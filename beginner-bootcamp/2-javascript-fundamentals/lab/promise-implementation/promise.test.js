const MyPromise = require('./promise');

describe('MyPromise', () => {
  test('should resolve synchronously', () => {
    const promise = new MyPromise((resolve) => {
      resolve('success');
    });

    return promise.then((value) => {
      expect(value).toBe('success');
    });
  });

  test('should reject synchronously', () => {
    const promise = new MyPromise((_, reject) => {
      reject('error');
    });

    return promise.catch((reason) => {
      expect(reason).toBe('error');
    });
  });

  test('should chain then calls', () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });

    return promise
      .then((value) => value + 1)
      .then((value) => value * 2)
      .then((value) => {
        expect(value).toBe(4);
      });
  });

  test('should handle Promise.all', () => {
    const p1 = MyPromise.resolve(1);
    const p2 = MyPromise.resolve(2);
    const p3 = MyPromise.resolve(3);

    return MyPromise.all([p1, p2, p3]).then((values) => {
      expect(values).toEqual([1, 2, 3]);
    });
  });

  // Add more tests...
});
