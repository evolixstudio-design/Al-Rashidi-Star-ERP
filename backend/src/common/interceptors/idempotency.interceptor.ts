import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

// Simple in-memory cache for idempotency keys with automatic TTL cleanup
interface CachedResponse {
  timestamp: number;
  data: any;
  status: 'PENDING' | 'COMPLETED';
}

const keyStore = new Map<string, CachedResponse>();
const TTL_MS = 15000; // 15 seconds window

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of keyStore.entries()) {
    if (now - val.timestamp > TTL_MS) {
      keyStore.delete(key);
    }
  }
}, 60000);

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Only apply idempotency to state-changing requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['x-idempotency-key'];
    if (!idempotencyKey) {
      return next.handle();
    }

    const cached = keyStore.get(idempotencyKey);
    if (cached) {
      if (cached.status === 'PENDING') {
        throw new ConflictException(
          'Aapka request process ho raha hai, kripya dobara click na karein.',
        );
      }
      // If completed, return the cached result
      return new Observable((subscriber) => {
        subscriber.next(cached.data);
        subscriber.complete();
      });
    }

    keyStore.set(idempotencyKey, {
      timestamp: Date.now(),
      data: null,
      status: 'PENDING',
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          keyStore.set(idempotencyKey, {
            timestamp: Date.now(),
            data,
            status: 'COMPLETED',
          });
        },
        error: () => {
          keyStore.delete(idempotencyKey);
        },
      }),
    );
  }
}
