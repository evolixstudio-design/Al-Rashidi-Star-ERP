import { useState, useEffect, useCallback } from 'react';

export interface ActionMenuPosition {
  top?: number;
  bottom?: number;
  right?: number;
  left?: number;
  width?: number;
}

export function useActionMenu() {
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<ActionMenuPosition | null>(null);
  const [triggerElement, setTriggerElement] = useState<Element | null>(null);

  const calculatePosition = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Max expected dimensions of the action menu
    const MENU_HEIGHT = 320; 
    const MENU_WIDTH = 192; // equivalent to w-48

    let top, bottom, right, left;

    // Vertical alignment: check if there's enough space below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow) {
      // Open upward
      bottom = viewportHeight - rect.top + 4; // 4px margin
    } else {
      // Open downward
      top = rect.bottom + 4;
    }

    // Horizontal alignment: check if it overflows the right edge
    if (rect.right + MENU_WIDTH > viewportWidth) {
      right = viewportWidth - rect.right;
    } else {
      // By default align to the right side of the trigger
      right = viewportWidth - rect.right;
    }

    setDropdownPos({ top, bottom, right, left });
  }, []);

  const openMenu = useCallback((id: number | string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (openDropdownId === id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      setTriggerElement(null);
    } else {
      const el = event.currentTarget;
      setTriggerElement(el);
      calculatePosition(el);
      setOpenDropdownId(id);
    }
  }, [openDropdownId, calculatePosition]);

  const closeMenu = useCallback(() => {
    setOpenDropdownId(null);
    setDropdownPos(null);
    setTriggerElement(null);
  }, []);

  useEffect(() => {
    if (openDropdownId !== null && triggerElement) {
      let isScrolling = false;
      let animationFrameId: number;

      const handleUpdate = () => {
        calculatePosition(triggerElement);
      };

      const handleScroll = () => {
        if (!isScrolling) {
          isScrolling = true;
          animationFrameId = requestAnimationFrame(() => {
            handleUpdate();
            isScrolling = false;
          });
        }
      };

      const handleClickOutside = (e: MouseEvent) => {
        // Close if click is outside the trigger and the menu
        // We assume the menu will stop propagation or we just close on any outside click.
        // Actually, clicking a menu item will close it because the item calls closeMenu.
        // And if clicking elsewhere, we close it.
        const isClickInsideTrigger = triggerElement.contains(e.target as Node);
        const menuEl = document.getElementById(`action-menu-${openDropdownId}`);
        const isClickInsideMenu = menuEl?.contains(e.target as Node);
        
        if (!isClickInsideTrigger && !isClickInsideMenu) {
          closeMenu();
        }
      };

      window.addEventListener('scroll', handleScroll, true); // true to capture all scrolls
      window.addEventListener('resize', handleUpdate);
      window.addEventListener('click', handleClickOutside, true);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('click', handleClickOutside, true);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [openDropdownId, triggerElement, calculatePosition, closeMenu]);

  return { openDropdownId, dropdownPos, openMenu, closeMenu };
}
