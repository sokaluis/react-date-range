import React from 'react';
import { render, screen } from '@testing-library/react';

import DefinedRange from '../DefinedRange/index.jsx';
import { isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import styles from '../../styles';

const selectableRange = overrides => ({
  label: 'Static Label',
  range: () => ({}),
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
  ...overrides,
});

describe('DefinedRange tests', () => {
  test('Should call "renderStaticRangeLabel" callback correct amount of times according to the "hasCustomRendering" option', () => {
    const renderStaticRangeLabel = jest.fn();

    render(
      <DefinedRange
        staticRanges={[
          selectableRange({ label: 'Dynamic Label', hasCustomRendering: true }),
          selectableRange({ label: 'Static Label' }),
          selectableRange({ label: 'Hede', hasCustomRendering: true }),
        ]}
        renderStaticRangeLabel={renderStaticRangeLabel}
      />
    );

    expect(renderStaticRangeLabel).toHaveBeenCalledTimes(2);
  });

  test('Should render dynamic static label contents correctly', () => {
    const renderItalicLabelContent = () => (
      <i className={'italic-label-content'}>{'Italic Content'}</i>
    );
    const renderBoldLabelContent = () => <b className={'bold-label-content'}>{'Bold Content'}</b>;
    const renderSomethingElse = () => <img className={'random-image'} />;

    const renderStaticRangeLabel = function(staticRange) {
      let result;

      if (staticRange.id === 'italic') {
        result = renderItalicLabelContent();
      } else if (staticRange.id === 'bold') {
        result = renderBoldLabelContent();
      } else {
        result = renderSomethingElse();
      }

      return result;
    };

    const { container } = render(
      <DefinedRange
        staticRanges={[
          selectableRange({ id: 'italic', hasCustomRendering: true }),
          selectableRange({ label: 'Static Label' }),
          selectableRange({ id: 'whatever', hasCustomRendering: true }),
          selectableRange({ id: 'bold', hasCustomRendering: true }),
        ]}
        renderStaticRangeLabel={renderStaticRangeLabel}
      />
    );

    expect(screen.getByText('Italic Content').tagName).toBe('I');
    expect(screen.getByText('Static Label')).toBeInTheDocument();
    expect(container.querySelector('img.random-image')).toBeInTheDocument();
    expect(screen.getByText('Bold Content').tagName).toBe('B');
  });

  // -------------------------------------------------------------------------
  // weekStartsOn propagation — selected styling (tasks 1.6–1.7)
  // -------------------------------------------------------------------------

  test('Shows selected style on This Week when focused range matches Monday-start current week', () => {
    const today = new Date();
    const mondayStart = startOfWeek(today, { weekStartsOn: 1 });
    const sundayEnd = endOfWeek(today, { weekStartsOn: 1 });

    const { container } = render(
      <DefinedRange
        ranges={[{ startDate: mondayStart, endDate: sundayEnd }]}
        weekStartsOn={1}
      />
    );

    const thisWeekButton = screen.getByText('This Week').closest('button');
    const selectedButtons = container.querySelectorAll(`.${styles.staticRangeSelected}`);

    expect(thisWeekButton.className).toContain(styles.staticRangeSelected);
    expect(selectedButtons).toHaveLength(1);
  });

  test('Renders zero selected static range buttons for mid-week focus with weekStartsOn=1', () => {
    const { container } = render(
      <DefinedRange
        ranges={[{ startDate: new Date(2025, 5, 11), endDate: new Date(2025, 5, 13) }]}
        weekStartsOn={1}
      />
    );

    const selectedButtons = container.querySelectorAll(`.${styles.staticRangeSelected}`);
    expect(selectedButtons).toHaveLength(0);
  });
});
