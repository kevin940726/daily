class Store {
  constructor() {
    this.store = new Map();
  }

  set(ts, lunches) {
    if (!this.store.has(ts)) {
      this.store.set(ts, new Map());
    }

    const message = this.store.get(ts);

    lunches.forEach((users, callbackID) => {
      if (!message.has(callbackID)) {
        message.set(callbackID, new Set());
      }

      const set = message.get(callbackID);

      users.forEach((user) => {
        set.add(user);
      });
    });
  }

  get(ts, callbackID) {
    return this.store.get(ts).get(callbackID);
  }

  add(ts, callbackID, user) {
    this.store.get(ts).get(callbackID).add(user);
  }

  delete(ts, callbackID, user) {
    this.store.get(ts).get(callbackID).delete(user);
  }

  has(ts, callbackID, user) {
    return this.store.get(ts).get(callbackID).has(user);
  }
}

module.exports = new Store();
