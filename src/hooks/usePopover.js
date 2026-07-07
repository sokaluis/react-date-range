import { useCallback, useEffect, useRef, useState } from 'react';

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const canUseDocument = () => typeof document !== 'undefined';

const getFocusable = element =>
  element
    ? Array.from(element.querySelectorAll(focusableSelector)).filter(
        node => node.getAttribute('tabindex') !== '-1' && node.getAttribute('aria-disabled') !== 'true'
      )
    : [];

export default function usePopover({ open: controlledOpen, defaultOpen = false, onOpenChange } = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const wasOpenRef = useRef(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const controlled = controlledOpen !== undefined;

  const setOpen = useCallback(
    nextOpen => {
      onOpenChange?.(nextOpen);
      if (!controlled) {
        setUncontrolledOpen(nextOpen);
      }
    },
    [controlled, onOpenChange]
  );

  const toggleOpen = useCallback(() => setOpen(!open), [open, setOpen]);

  useEffect(() => {
    if (!canUseDocument()) {
      return;
    }

    if (open) {
      const id = window.setTimeout(() => {
        const [firstFocusable] = getFocusable(popoverRef.current);
        firstFocusable?.focus();
      }, 0);

      return () => window.clearTimeout(id);
    }

    if (wasOpenRef.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open || !canUseDocument()) {
      return undefined;
    }

    const onMouseDown = event => {
      const target = event.target;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusable(popoverRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  return {
    open,
    setOpen,
    toggleOpen,
    triggerRef,
    popoverRef,
  };
}
