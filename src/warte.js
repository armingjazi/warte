function warte() {
  const async_functions = [];
  return {
    keep: async_func => {
      async_functions.push(async_func);
    },
    process: async payload => {
      const promises = async_functions.map(f => f(payload));
      await Promise.all(promises);
    }
  };
}

module.exports = warte;
