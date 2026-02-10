const debounce = require("../lab/debounce-throttle/debounce");

describe("Debounce", () => {
  jest.useFakeTimers();

  test("delays function execution", () => {
    const func = jest.fn();
    const debounced = debounce(func, 1000);

    debounced();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(999);
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test("cancels previous calls", () => {
    const func = jest.fn();
    const debounced = debounce(func, 1000);

    debounced();
    jest.advanceTimersByTime(500);

    debounced(); // Cancels previous
    jest.advanceTimersByTime(500);
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test("preserves context", () => {
    const obj = {
      value: 42,
      getValue: jest.fn(function () {
        return this.value;
      }),
    };

    obj.getValue = debounce(obj.getValue, 1000);
    obj.getValue();
    jest.runAllTimers();

    expect(obj.getValue()).toBe(42);
  });

  test("passes arguments", () => {
    const func = jest.fn();
    const debounced = debounce(func, 1000);

    debounced("a", "b", "c");
    jest.runAllTimers();

    expect(func).toHaveBeenCalledWith("a", "b", "c");
  });
});
