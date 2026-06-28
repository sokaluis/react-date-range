import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import InputRangeField from '../InputRangeField/index.jsx';

const styles = {
  inputRange: 'range',
  inputRangeInput: 'input',
  inputRangeLabel: 'label',
};

const setup = props =>
  render(
    <InputRangeField
      label="Input label"
      styles={styles}
      onChange={jest.fn()}
      onFocus={jest.fn()}
      onBlur={jest.fn()}
      {...props}
    />
  );

describe('InputRangeField tests', () => {
  test('Should parse input value to number', () => {
    const onChange = jest.fn();

    [
      ['3', 3],
      [12, 12],
      ['', 0],
      ['invalid number', 0],
      [-12, 0],
      [99999999, 99999],
    ].forEach(([value, expected]) => {
      const { unmount } = setup({ onChange, value: 'initial' });
      fireEvent.change(screen.getByRole('textbox'), { target: { value } });
      expect(onChange).toHaveBeenLastCalledWith(expected);
      unmount();
    });

    expect(onChange).toHaveBeenCalledTimes(6);
  });

  test('Should rerender when props change', () => {
    const { rerender } = setup({ value: 12, placeholder: 'Placeholder' });

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('12');
    expect(input).toHaveAttribute('placeholder', 'Placeholder');
    expect(screen.getByText('Input label')).toBeInTheDocument();

    rerender(
      <InputRangeField
        value="32"
        placeholder="Placeholder"
        label="Input label"
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', 'Placeholder');
    expect(screen.getByText('Input label')).toBeInTheDocument();

    rerender(
      <InputRangeField
        value="32"
        placeholder="-"
        label="Input label"
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', '-');
    expect(screen.getByText('Input label')).toBeInTheDocument();

    rerender(
      <InputRangeField
        value="32"
        placeholder="-"
        label="Label"
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', '-');
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  test('Should render the label as a Component', () => {
    const Label = () => <span className="input-range-field-label">Input label</span>;
    const { rerender } = setup({ value: 12, placeholder: 'Placeholder', label: <Label /> });

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('12');
    expect(input).toHaveAttribute('placeholder', 'Placeholder');
    expect(screen.getByText('Input label')).toHaveClass('input-range-field-label');

    rerender(
      <InputRangeField
        value="32"
        placeholder="Placeholder"
        label={<Label />}
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', 'Placeholder');
    expect(screen.getByText('Input label')).toBeInTheDocument();

    rerender(
      <InputRangeField
        value="32"
        placeholder="-"
        label={<Label />}
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', '-');
    expect(screen.getByText('Input label')).toBeInTheDocument();

    rerender(
      <InputRangeField
        value="32"
        placeholder="-"
        label="Label"
        styles={styles}
        onChange={jest.fn()}
        onFocus={jest.fn()}
        onBlur={jest.fn()}
      />
    );
    expect(input).toHaveValue('32');
    expect(input).toHaveAttribute('placeholder', '-');
    expect(screen.getByText('Label')).toBeInTheDocument();
  });
});
