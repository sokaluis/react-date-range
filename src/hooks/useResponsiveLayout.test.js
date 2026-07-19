import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MOBILE_MAX_PX, useResponsiveLayout } from './useResponsiveLayout';

const createMatchMediaMock = initialMatches => {
  let matches = initialMatches;
  const listeners = new Set();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: `(max-width: ${MOBILE_MAX_PX}px)`,
    addEventListener: jest.fn((event, listener) => {
      if (event === 'change') listeners.add(listener);
    }),
    removeEventListener: jest.fn((event, listener) => {
      if (event === 'change') listeners.delete(listener);
    }),
    setMatches(nextMatches) {
      matches = nextMatches;
      listeners.forEach(listener => listener({ matches, media: mediaQueryList.media }));
    },
  };
  window.matchMedia = jest.fn(() => mediaQueryList);
  return mediaQueryList;
};

describe('useResponsiveLayout', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  test('keeps auto in reference mode during server rendering', () => {
    const Probe = () => <span>{useResponsiveLayout('auto')}</span>;

    expect(renderToString(<Probe />)).toContain('reference');
  });

  test('falls back to reference when matchMedia is unavailable', () => {
    delete window.matchMedia;

    const { result } = renderHook(() => useResponsiveLayout('auto'));

    expect(result.current).toBe('reference');
  });

  test('normalizes invalid runtime modes to reference', () => {
    createMatchMediaMock(true);

    const { result } = renderHook(() => useResponsiveLayout('compact'));

    expect(result.current).toBe('reference');
    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  test('resolves auto to mobile after a matching media-query change', () => {
    const mediaQuery = createMatchMediaMock(false);
    const { result } = renderHook(() => useResponsiveLayout('auto'));

    expect(result.current).toBe('reference');

    act(() => {
      mediaQuery.setMatches(true);
    });

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
    expect(result.current).toBe('mobile');
  });

  test('subscribes to and cleans up media-query changes', () => {
    const mediaQuery = createMatchMediaMock(false);
    const { unmount } = renderHook(() => useResponsiveLayout('auto'));
    const listener = mediaQuery.addEventListener.mock.calls[0][1];

    unmount();

    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', listener);
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener);
  });
});
