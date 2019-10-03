const Warte = require("../src/warte");

describe("warte", function() {
  it("processes promises in order for payload", async () => {
    const resolveMock = jest.fn();

    const warte = Warte();

    const async_a = () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolveMock("promiseA");
          resolve("ResolvePromiseA");
        }, 3);
      });

    const async_b = () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolveMock("promiseB");
          resolve("ResolvePromiseB");
        }, 1);
      });

    warte.keep(async_a);
    warte.keep(async_b);

    await warte.process({});

    expect(resolveMock).toHaveBeenNthCalledWith(2, "promiseA");
    expect(resolveMock).toHaveBeenNthCalledWith(1, "promiseB");
  });

  it("processes payloads in all promises", async () => {
    const resolveMock = jest.fn();

    const warte = Warte();

    const async_a = payload =>
      new Promise(resolve => {
        setTimeout(() => {
          resolveMock(payload);
          resolve("ResolvePromiseA");
        }, 3);
      });

    const async_b = payload =>
      new Promise(resolve => {
        setTimeout(() => {
          resolveMock(payload);
          resolve("ResolvePromiseB");
        }, 1);
      });

    warte.keep(async_a);
    warte.keep(async_b);

    const payload = {
      pay: "load"
    };

    await warte.process(payload);

    expect(resolveMock).toHaveBeenNthCalledWith(1, payload);
    expect(resolveMock).toHaveBeenNthCalledWith(2, payload);
  });
});
