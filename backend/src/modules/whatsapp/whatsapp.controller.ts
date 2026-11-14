import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { WhatsAppService, type WhatsAppMessageType } from './whatsapp.service.js';

@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'))
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * GET /api/whatsapp/status
   * Returns WhatsApp integration status (connected/not configured).
   * Never exposes access token or secrets.
   */
  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  /**
   * POST /api/whatsapp/send-invoice
   *
   * Accepts multipart/form-data with:
   *   - invoiceId (string field → parsed to number)
   *   - messageType (string field)
   *   - invoiceImage (file: image/jpeg)
   *
   * The frontend renders the exact Rashidi Star invoice as a high-resolution JPG
   * using html2canvas and uploads it here. The backend does NOT re-render.
   */
  @Post('send-invoice')
  @UseInterceptors(
    FileInterceptor('invoiceImage', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req: any, file: any, cb: any) => {
        if (file.mimetype !== 'image/jpeg') {
          cb(new BadRequestException('Only JPEG images are accepted.'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async sendInvoice(
    @UploadedFile() file: any,
    @Body('invoiceId') invoiceIdStr: string,
    @Body('messageType') messageType: string,
    @Request() req: any,
  ) {
    if (!invoiceIdStr) {
      throw new BadRequestException('invoiceId is required.');
    }

    const invoiceId = parseInt(invoiceIdStr, 10);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      throw new BadRequestException('Invalid invoiceId.');
    }

    const validTypes: WhatsAppMessageType[] = [
      'FULL_PAYMENT_RECEIPT',
      'PARTIAL_PAYMENT_RECEIPT',
      'PENDING_REMINDER',
      'PARTIAL_REMINDER',
    ];
    if (!validTypes.includes(messageType as WhatsAppMessageType)) {
      throw new BadRequestException(`Invalid messageType. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!file) {
      throw new BadRequestException('Invoice image file (invoiceImage) is required.');
    }

    const username = req.user?.username || req.user?.email || 'system';

    return this.whatsappService.sendInvoiceImage(
      invoiceId,
      messageType as WhatsAppMessageType,
      file,
      username,
    );
  }

  /**
   * POST /api/whatsapp/log-share
   * Logs a native manual Web Share action.
   */
  @Post('log-share')
  async logShareAction(
    @Body() body: {
      action: string;
      invoiceNumber: string;
      customerName?: string;
      paymentStatus?: string;
      imageFilename: string;
    },
    @Request() req: any,
  ) {
    const username = req.user?.username || req.user?.email || 'system';
    return this.whatsappService.logManualShare(body, username);
  }
}
