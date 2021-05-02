let subscribers = {};

export const publish = (event, data = null) => {
  if (!subscribers[event]) return;
  subscribers[event].forEach(subscriberCallback => subscriberCallback(data));
};

export const subscribe = (event, callback) => {
  let index;

  if (!subscribers[event]) {
    subscribers[event] = [];
  }

  index = subscribers[event].push(callback) - 1;

  return () => {
    subscribers[event].splice(index, 1);
  };
};

export const subscribeToAll = events => {
  let unsub = events.map(([event, callback]) => {
    return subscribe(event, callback);
  });
  return () => {
    unsub.forEach(f => {
      f();
    });
  };
};
