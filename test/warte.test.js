const Warte = require("../src/warte");

const check = async function(condition) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (condition()) resolve();
      else reject();
    }, 10);
  }).catch(() => {
    return check(condition);
  });
};

describe("warte", function() {
  it("processes processors promises ", done => {
    const warte = Warte({ flushIntervals: 10 });

    const processor = () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 10);
      }).then(() => {
        done();
        warte.stop();
      });

    warte.keep(processor);

    warte.process({ payload: "test" });
  });

  it("processes payloads in all promises", async () => {
    expect.assertions(2);

    const resolved = jest.fn();

    const expected_payload = {
      pay: "load"
    };

    const warte = Warte({ flushIntervals: 10 });

    const processor_a = payload =>
      new Promise(resolve => {
        setTimeout(() => {
          resolved(payload);
          resolve();
        }, 3);
      });

    const processor_b = payload =>
      new Promise(resolve => {
        setTimeout(() => {
          resolved(payload);
          resolve();
        }, 1);
      });

    warte.keep(processor_a);
    warte.keep(processor_b);

    warte.process(expected_payload);

    await check(() => resolved.mock.calls.length === 2);

    expect(resolved).toHaveBeenNthCalledWith(1, expected_payload);
    expect(resolved).toHaveBeenNthCalledWith(2, expected_payload);

    warte.stop();
  });

  it("processes payloads in order", async () => {
    expect.assertions(1);

    const payload_1 = {
      time: 15
    };

    const payload_2 = {
      time: 1
    };

    const payload_3 = {
      time: 10
    };

    const warte = Warte({ flushIntervals: 10 });

    const processor = payload =>
      new Promise(resolve => {
        // NOTE: reordering the time it takes for payloads to be processed
        setTimeout(() => {
          resolve(payload);
        }, payload.time);
      });

    let receivedPayloads = [];
    warte.onFinish(payloads => {
      receivedPayloads = payloads;
    });

    warte.keep(processor);

    warte.process(payload_1);
    warte.process(payload_2);
    warte.process(payload_3);

    await check(() => receivedPayloads.length === 3);

    expect(receivedPayloads).toEqual([payload_1, payload_2, payload_3]);
    warte.stop();
  });
});
