import { useState, useEffect, useCallback } from 'react';
import type { RefObject, MutableRefObject } from 'react';

interface ViewportDropdownResult {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  style: React.CSSProperties;
  openDirection: 'up' | 'down';
}

export function useViewportDropdown(triggerRef: RefObject<any> | MutableRefObject<any>): ViewportDropdownResult {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down');

  const updatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Space above and below the trigger
    const availableBelow = viewportHeight - rect.bottom;
    const availableAbove = rect.top;
    
    // Desired dropdown constraints
    const MIN_HEIGHT = 150; // minimum usable height
    const IDEAL_MAX_HEIGHT = Math.min(320, viewportHeight * 0.45); // e.g. 45vh max for mobile usability
    
    let direction: 'up' | 'down' = 'down';
    let maxHeight = IDEAL_MAX_HEIGHT;

    if (availableBelow < IDEAL_MAX_HEIGHT && availableAbove > availableBelow) {
      direction = 'up';
      maxHeight = Math.max(MIN_HEIGHT, Math.min(IDEAL_MAX_HEIGHT, availableAbove - 10)); // 10px margin
    } else {
      maxHeight = Math.max(MIN_HEIGHT, Math.min(IDEAL_MAX_HEIGHT, availableBelow - 10));
    }

    setOpenDirection(direction);

    if (direction === 'down') {
      setStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width, // Match trigger width
        maxHeight,
        zIndex: 9999,
      });
    } else {
      setStyle({
        position: 'fixed',
        bottom: viewportHeight - rect.top + 4, // anchor to bottom relative to top of trigger
        left: rect.left,
        width: rect.width,
        maxHeight,
        zIndex: 9999,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    updatePosition();
    
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true); // true = capture phase to catch internal scrolls
      window.addEventListener('resize', updatePosition);
      window.addEventListener('orientationchange', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [isOpen, updatePosition]);

  return { isOpen, setIsOpen, style, openDirection };
}
