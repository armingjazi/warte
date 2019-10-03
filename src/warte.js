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

  let timerId = null;

  const run = () => {
    timerId = setTimeout(() => {
      if (to_process.length) {
        const flush = to_process.slice();
        to_process = [];
        process(flush).then(payloads => onFinish(payloads));
      }
      run();
    }, flushIntervals);
  };

  run();

  return {
    keep: processor => processors.push(processor),
    process: payload => to_process.push(payload),
    onFinish: handler => (onFinish = handler),
    stop: () => clearTimeout(timerId)
  };
}

module.exports = warte;
