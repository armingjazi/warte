function warte(options) {
  const { flushIntervals } = options || { flushIntervals: 1000 };

  const processors = [];
  let to_process = [];
  let onFinish = () => {};

  const process = async payloads => {
    await Promise.all(
      payloads.map(
        async payload =>
          await Promise.all(processors.map(processor => processor(payload)))
      )
    );
    return payloads;
  };

  const flush_and_process = () => {
    if (to_process.length) {
      const flush = to_process.slice();
      to_process = [];
      process(flush).then(payloads => onFinish(payloads));
    }
  };

  let timerId = null;
  const run = () => {
    timerId = setTimeout(() => {
      flush_and_process();
      run();
    }, flushIntervals);
  };

  const stop = () => {
    flush_and_process();
    clearTimeout(timerId);
  };

  run();

  return {
    keep: processor => processors.push(processor),
    process: payload => to_process.push(payload),
    onFinish: handler => (onFinish = handler),
    stop: stop
  };
}

module.exports = warte;
