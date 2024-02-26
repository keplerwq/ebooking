class Sys {
  constructor(data) {
    this.onDone = (cb) => {
      this.doneQueue.push(cb);
    };
    this.pluginQueue = Promise.resolve(data);
    this.doneQueue = [];
  }

  use(plugin, params) {
    this.pluginQueue =
          this.pluginQueue.then(data => plugin.call(this, data, params));
    return this;
  }

  done(run = true) {
    return this.pluginQueue.then((data) => {
      if (run)
        this.doneQueue.forEach(cb => cb());
      return data;
    });
  }
}
export default Sys;
