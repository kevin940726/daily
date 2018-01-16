class Store {
  constructor() {
    this.store = new Map();
  }

  has(ts) {
    return this.store.has(ts);
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

    message.set('isClosed', false);
  }

  getLunch(ts, callbackID) {
    return this.store.get(ts).get(callbackID);
  }

  toggleUser(ts, callbackID, user) {
    const lunch = this.store.get(ts).get(callbackID);
    if (lunch.has(user)) {
      lunch.delete(user);
    } else {
      lunch.add(user);
    }
  }

  getIsClosed(ts) {
    return !!this.store.get(ts).get('isClosed');
  }

  setIsClosed(ts, isClosed) {
    this.store.get(ts).set('isClosed', !!isClosed);
  }
}

module.exports = new Store();
