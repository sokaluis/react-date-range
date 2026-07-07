import React from 'react';
import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePickerInput from './index.jsx';
import * as PublicApi from '../../index.js';

const selectedDate = new Date(2026, 6, 7);
const shownDate = new Date(2026, 6, 1);

const renderDatePickerInput = props =>
  render(
    <DatePickerInput
      date={selectedDate}
      calendarProps={{ shownDate, minDate: new Date(2026, 6, 1), maxDate: new Date(2026, 6, 31) }}
      {...props}
    />
  );

const readTypeDeclarations = () =>
  fs.readFileSync(path.resolve(__dirname, '../../index.d.ts'), 'utf8');

const getTrigger = (name = 'Select date') => screen.getByRole('textbox', { name });

const openPopover = async (name = 'Select date') => {
  const trigger = getTrigger(name);
  await userEvent.click(trigger);
  return { trigger, dialog: await screen.findByRole('dialog') };
};

const tabbablesIn = element =>
  Array.from(element.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'))
    .filter(node => !node.disabled && node.getAttribute('tabindex') !== '-1');

describe('DatePickerInput', () => {
  test('is exported from the public runtime API without exporting DateRangeInput', () => {
    expect(PublicApi.DatePickerInput).toBe(DatePickerInput);
    expect(PublicApi.DateRangeInput).toBeUndefined();
  });

  test('declares DatePickerInput types and class hooks without declaring DateRangeInput', () => {
    const declarations = readTypeDeclarations();

    expect(declarations).toContain('export interface DatePickerInputProps');
    expect(declarations).toContain('export function DatePickerInput');
    expect(declarations).toContain('datePickerInputWrapper?: string | undefined;');
    expect(declarations).toContain('datePickerInputTrigger?: string | undefined;');
    expect(declarations).toContain('datePickerInputPopover?: string | undefined;');
    expect(declarations).not.toContain('DateRangeInput');
  });

  test('renders formatted selected date and placeholder on a read-only trigger', () => {
    renderDatePickerInput({
      ariaLabel: 'Trip date',
      dateDisplayFormat: 'yyyy/MM/dd',
      placeholder: 'Pick a trip date',
    });

    const trigger = getTrigger('Trip date');
    expect(trigger).toHaveValue('2026/07/07');
    expect(trigger).toHaveAttribute('placeholder', 'Pick a trip date');
    expect(trigger).toHaveAttribute('readonly');
  });

  test('does not commit typed text because manual parsing is deferred', async () => {
    const onChange = jest.fn();
    renderDatePickerInput({ date: null, placeholder: 'Pick a date', onChange });
    const trigger = getTrigger();

    await userEvent.type(trigger, 'not a date');

    expect(trigger).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  test('opens uncontrolled popover from the trigger with dialog and trigger ARIA', async () => {
    renderDatePickerInput({ popoverLabel: 'Choose trip date' });
    const trigger = getTrigger();

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Choose trip date' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(document.activeElement);
  });

  test('supports defaultOpen and closes on trigger toggle', async () => {
    renderDatePickerInput({ defaultOpen: true });
    const trigger = getTrigger();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens from keyboard activation on the read-only trigger', async () => {
    renderDatePickerInput();
    const trigger = getTrigger();

    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('requests open in controlled mode without rendering until the parent opens it', async () => {
    const onOpenChange = jest.fn();
    renderDatePickerInput({ open: false, onOpenChange });

    await userEvent.click(getTrigger());

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('requests close in controlled mode when Escape is pressed', () => {
    const onOpenChange = jest.fn();
    renderDatePickerInput({ open: true, onOpenChange });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('closes on Escape and returns focus to the trigger', async () => {
    renderDatePickerInput();
    const { trigger } = await openPopover();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  test('closes on outside mouse interaction but keeps inside clicks open', async () => {
    render(
      <div>
        <button type="button">Outside</button>
        <DatePickerInput date={selectedDate} calendarProps={{ shownDate }} />
      </div>
    );
    const { trigger, dialog } = await openPopover();

    fireEvent.mouseDown(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  test('wraps focus inside the popover on Shift+Tab from the first focusable control', async () => {
    renderDatePickerInput();
    const { dialog } = await openPopover();
    const focusables = tabbablesIn(dialog);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  test('selecting a day calls onChange and closes the uncontrolled popover', async () => {
    const onChange = jest.fn();
    renderDatePickerInput({ date: null, onChange });
    const { trigger } = await openPopover();
    const dayButton = screen.getAllByRole('gridcell').find(button => button.textContent === '15');

    await userEvent.click(dayButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual(new Date(2026, 6, 15));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(trigger);
  });

  test('disabled trigger blocks opening and open change requests', async () => {
    const onOpenChange = jest.fn();
    renderDatePickerInput({ disabled: true, onOpenChange });
    const trigger = getTrigger();

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
