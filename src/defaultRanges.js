import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays,
} from 'date-fns';

const getWeekOptions = props => {
  if (props && props.weekStartsOn !== undefined) {
    return { weekStartsOn: props.weekStartsOn };
  }
  return {};
};

const defineds = {
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
};

const staticRangeHandler = {
  range: {},
  isSelected(range, props) {
    const definedRange = this.range(props);
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
};

export function createStaticRanges(ranges) {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
}

export const defaultStaticRanges = createStaticRanges([
  {
    label: 'Today',
    range: () => ({
      startDate: defineds.startOfToday,
      endDate: defineds.endOfToday,
    }),
  },
  {
    label: 'Yesterday',
    range: () => ({
      startDate: defineds.startOfYesterday,
      endDate: defineds.endOfYesterday,
    }),
  },

  {
    label: 'This Week',
    range: (props) => ({
      startDate: startOfWeek(new Date(), getWeekOptions(props)),
      endDate: endOfWeek(new Date(), getWeekOptions(props)),
    }),
  },
  {
    label: 'Last Week',
    range: (props) => ({
      startDate: startOfWeek(addDays(new Date(), -7), getWeekOptions(props)),
      endDate: endOfWeek(addDays(new Date(), -7), getWeekOptions(props)),
    }),
  },
  {
    label: 'This Month',
    range: () => ({
      startDate: defineds.startOfMonth,
      endDate: defineds.endOfMonth,
    }),
  },
  {
    label: 'Last Month',
    range: () => ({
      startDate: defineds.startOfLastMonth,
      endDate: defineds.endOfLastMonth,
    }),
  },
]);

export const defaultInputRanges = [
  {
    label: 'days up to today',
    range(value) {
      return {
        startDate: addDays(defineds.startOfToday, (Math.max(Number(value), 1) - 1) * -1),
        endDate: defineds.endOfToday,
      };
    },
    getCurrentValue(range) {
      if (!isSameDay(range.endDate, defineds.endOfToday)) return '-';
      if (!range.startDate) return '∞';
      return differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1;
    },
  },
  {
    label: 'days starting today',
    range(value) {
      const today = new Date();
      return {
        startDate: today,
        endDate: addDays(today, Math.max(Number(value), 1) - 1),
      };
    },
    getCurrentValue(range) {
      if (!isSameDay(range.startDate, defineds.startOfToday)) return '-';
      if (!range.endDate) return '∞';
      return differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1;
    },
  },
];
