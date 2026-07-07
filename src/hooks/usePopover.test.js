import React from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import usePopover from './usePopover';

function PopoverTestbed({ hookProps = {} }) {
  const { open, toggleOpen, triggerRef, popoverRef } = usePopover(hookProps);
  return (
    <div>
      <button ref={triggerRef} type="button" data-testid="trigger" onClick={toggleOpen}>
        Toggle
      </button>
      {open && (
        <div ref={popoverRef} role="dialog" aria-label="Test popover" data-testid="popover">
          <button type="button">First</button>
          <input type="text" placeholder="Middle" />
          <button type="button">Last</button>
        </div>
      )}
    </div>
  );
}

const focusablesIn = element =>
  Array.from(
    element.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    node =>
      node.getAttribute('tabindex') !== '-1' && node.getAttribute('aria-disabled') !== 'true',
  );

describe('usePopover', () => {
  describe('state', () => {
    it('returns open=false by default in uncontrolled mode', () => {
      const { result } = renderHook(() => usePopover());
      expect(result.current.open).toBe(false);
    });

    it('respects defaultOpen=true in uncontrolled mode', () => {
      const { result } = renderHook(() => usePopover({ defaultOpen: true }));
      expect(result.current.open).toBe(true);
    });

    it('calls onOpenChange without mutating open in controlled mode', () => {
      const onOpenChange = jest.fn();
      const { result } = renderHook(
        ({ open }) => usePopover({ open, onOpenChange }),
        { initialProps: { open: false } },
      );

      act(() => result.current.setOpen(true));

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(result.current.open).toBe(false);
    });
  });

  describe('focus management', () => {
    it('focuses first focusable element in the popover on open', async () => {
      render(<PopoverTestbed hookProps={{ defaultOpen: true }} />);
      const firstButton = screen.getByRole('button', { name: 'First' });

      await waitFor(() => {
        expect(document.activeElement).toBe(firstButton);
      });
    });

    it('returns focus to the trigger when the popover closes', async () => {
      render(<PopoverTestbed hookProps={{ defaultOpen: true }} />);
      const trigger = screen.getByTestId('trigger');

      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
      });
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('focus trap', () => {
    it('wraps Tab from last focusable to first in the popover', () => {
      render(<PopoverTestbed hookProps={{ defaultOpen: true }} />);
      const popover = screen.getByTestId('popover');
      const f = focusablesIn(popover);
      const last = f[f.length - 1];

      act(() => last.focus());
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(document.activeElement).toBe(f[0]);
    });

    it('wraps Shift+Tab from first focusable to last in the popover', () => {
      render(<PopoverTestbed hookProps={{ defaultOpen: true }} />);
      const popover = screen.getByTestId('popover');
      const f = focusablesIn(popover);
      const first = f[0];

      act(() => first.focus());
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      expect(document.activeElement).toBe(f[f.length - 1]);
    });
  });

  describe('dismissal', () => {
    it('closes on Escape key', async () => {
      render(<PopoverTestbed hookProps={{ defaultOpen: true }} />);
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
      });
    });

    it('closes on outside mousedown, stays open on popover/trigger mousedown', () => {
      render(
        <div>
          <button type="button" data-testid="outside">
            Outside
          </button>
          <PopoverTestbed hookProps={{ defaultOpen: true }} />
        </div>,
      );
      const popover = screen.getByTestId('popover');

      fireEvent.mouseDown(popover);
      expect(screen.getByTestId('popover')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
    });
  });
});
