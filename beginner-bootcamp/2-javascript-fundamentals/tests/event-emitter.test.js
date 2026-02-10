const EventEmitter = require("../lab/custom-event-emitter/event-emitter");

describe("EventEmitter", () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  test("registers and emits events", () => {
    const listener = jest.fn();
    emitter.on("test", listener);

    emitter.emit("test", "data");

    expect(listener).toHaveBeenCalledWith("data");
  });

  test("supports multiple listeners", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on("test", listener1);
    emitter.on("test", listener2);

    emitter.emit("test");

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test("once listener is called only once", () => {
    const listener = jest.fn();
    emitter.once("test", listener);

    emitter.emit("test");
    emitter.emit("test");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("removes specific listener", () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on("test", listener1);
    emitter.on("test", listener2);
    emitter.off("test", listener1);

    emitter.emit("test");

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test("removes all listeners", () => {
    const listener = jest.fn();

    emitter.on("test1", listener);
    emitter.on("test2", listener);
    emitter.removeAllListeners();

    emitter.emit("test1");
    emitter.emit("test2");

    expect(listener).not.toHaveBeenCalled();
  });

  test("gets listener count", () => {
    emitter.on("test", () => {});
    emitter.on("test", () => {});

    expect(emitter.listenerCount("test")).toBe(2);
  });

  test("returns false when no listeners", () => {
    const result = emitter.emit("nonexistent");
    expect(result).toBe(false);
  });
});
