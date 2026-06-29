import '@testing-library/jest-dom';

// React 19 requires this for act() to flush state synchronously in tests.
// Without it, setState calls from event handlers are not committed before
// the next event handler runs, breaking test patterns like change → blur.
global.IS_REACT_ACT_ENVIRONMENT = true;
