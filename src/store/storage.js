const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage = (() => {
  if (typeof window !== 'undefined') {
    return require('redux-persist/lib/storage').default;
  }
  return createNoopStorage();
})();

export default storage; 