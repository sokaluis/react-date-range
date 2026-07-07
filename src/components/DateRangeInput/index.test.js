import React from 'react';
import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangeInput from './index.jsx';
import * as PublicApi from '../../index.js';
import defaultStyles from '../../styles.js';

const startDate = new Date(2026, 6, 7);
const endDate = new Date(2026, 6, 14);
const shownDate = new Date(2026, 6, 1);

const renderDateRangeInput = props =>
  render(
    <DateRangeInput
      ranges={[{ startDate, endDate, key: 'selection' }]}
      calendarProps={{ shownDate, minDate: new Date(2026, 6, 1), maxDate: new Date(2026, 6, 31) }}
      {...props}
    />
  );

const readTypeDeclarations = () => fs.readFileSync(path.resolve(__dirname, '../../index.d.ts'), 'utf8');

const getTrigger = (name = 'Select date range') => screen.getByRole('textbox', { name });

const calendarDayButtons = () =>
  screen
    .getAllByRole('gridcell')
    .filter(button => /^\d+$/.test(button.textContent) && button.tabIndex !== -1);

const findDayButton = dayNumber =>
  calendarDayButtons().find(button => button.textContent === String(dayNumber));

const selectDay = dayNumber => {
  const dayButton = findDayButton(dayNumber);
  fireEvent.mouseDown(dayButton);
  fireEvent.mouseUp(dayButton);
};

describe('DateRangeInput', () => {
  test('is exported from the public runtime API with types and style hooks', () => {
    const declarations = readTypeDeclarations();

    expect(PublicApi.DateRangeInput).toBe(DateRangeInput);
    expect(declarations).toContain('export interface DateRangeInputProps');
    expect(declarations).toContain('export interface DateRangeInputRef');
    expect(declarations).toContain('export function DateRangeInput');
    expect(declarations).toContain('dateRangeInputWrapper?: string | undefined;');
    expect(declarations).toContain('dateRangeInputTrigger?: string | undefined;');
    expect(declarations).toContain('dateRangeInputPopover?: string | undefined;');
    expect(defaultStyles.dateRangeInputWrapper).toBe('rdrDateRangeInputWrapper');
    expect(defaultStyles.dateRangeInputTrigger).toBe('rdrDateRangeInputTrigger');
    expect(defaultStyles.dateRangeInputPopover).toBe('rdrDateRangeInputPopover');
  });

  test('renders a formatted complete range and placeholder on a read-only trigger', () => {
    renderDateRangeInput({
      ariaLabels: { trigger: 'Trip range' },
      format: 'yyyy/MM/dd',
      triggerPlaceholder: 'Pick a trip range',
    });

    const trigger = getTrigger('Trip range');
    expect(trigger).toHaveValue('2026/07/07 – 2026/07/14');
    expect(trigger).toHaveAttribute('placeholder', 'Pick a trip range');
    expect(trigger).toHaveAttribute('readonly');
  });

  test('uses a custom formatter when provided', () => {
    renderDateRangeInput({
      formatter: range => `${range.startDate.getDate()} nights until ${range.endDate.getDate()}`,
    });

    expect(getTrigger()).toHaveValue('7 nights until 14');
  });

  test('falls back to the trigger placeholder for an incomplete range', () => {
    renderDateRangeInput({
      ranges: [{ startDate, key: 'selection' }],
      triggerPlaceholder: 'Select both dates',
    });

    expect(getTrigger()).toHaveValue('');
    expect(getTrigger()).toHaveAttribute('placeholder', 'Select both dates');
  });

  test('opens uncontrolled from the trigger and renders a labelled modal dialog without duplicate live regions', async () => {
    renderDateRangeInput({ popoverLabel: 'Choose trip range' });
    const trigger = getTrigger();

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Choose trip range' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(document.activeElement);
    expect(dialog.querySelectorAll('[aria-live]')).toHaveLength(2);
    expect(document.body.querySelectorAll('[aria-live]')).toHaveLength(2);
  });

  test('supports defaultOpen and controlled open requests', async () => {
    const onOpenChange = jest.fn();
    const { rerender } = renderDateRangeInput({ defaultOpen: true, onOpenChange });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <DateRangeInput
        ranges={[{ startDate, endDate, key: 'selection' }]}
        calendarProps={{ shownDate }}
        open={false}
        onOpenChange={onOpenChange}
      />
    );
    await userEvent.click(getTrigger());

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('disabled trigger blocks pointer and keyboard opening', async () => {
    const onOpenChange = jest.fn();
    renderDateRangeInput({ disabled: true, onOpenChange });
    const trigger = getTrigger();

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onOpenChange).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('stays open after start selection and closes after end selection by default', async () => {
    const onChange = jest.fn();
    renderDateRangeInput({
      ranges: [{ startDate, endDate: null, key: 'selection' }],
      onChange,
      triggerPlaceholder: 'Select both dates',
    });

    await userEvent.click(getTrigger());
    selectDay(7);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ selection: expect.objectContaining({ startDate: expect.any(Date) }) })
    );

    selectDay(14);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('keeps the popover open after end selection when closeOnEndSelection is false', async () => {
    renderDateRangeInput({
      ranges: [{ startDate, endDate: null, key: 'selection' }],
      closeOnEndSelection: false,
    });

    await userEvent.click(getTrigger());
    selectDay(7);
    selectDay(14);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('returns focus to the trigger after Escape closes the dialog', async () => {
    renderDateRangeInput();
    const trigger = getTrigger();

    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  test('closes on outside mousedown', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <DateRangeInput
          ranges={[{ startDate, endDate, key: 'selection' }]}
          calendarProps={{ shownDate }}
        />
      </>
    );

    await userEvent.click(getTrigger());
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('does not close during drag selection and closes after drag completes', async () => {
    renderDateRangeInput({ ranges: [{ startDate: null, endDate: null, key: 'selection' }] });

    await userEvent.click(getTrigger());
    fireEvent.mouseDown(findDayButton(10));
    fireEvent.mouseEnter(findDayButton(12));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseUp(findDayButton(12));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('warns in development and ignores extra ranges for the single-range MVP', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    renderDateRangeInput({
      ranges: [
        { startDate, endDate, key: 'selection' },
        { startDate: new Date(2026, 6, 20), endDate: new Date(2026, 6, 25), key: 'compare' },
      ],
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('DateRangeInput supports a single range'));

    await userEvent.click(getTrigger());
    expect(screen.queryByText('compare')).not.toBeInTheDocument();

    warn.mockRestore();
  });
});
