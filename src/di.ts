class DI {
  dependencies: any;

  constructor() {
    this.dependencies = {};
  }

  get(name: any) {
    return this.dependencies[name];
  }

  set(name: any, value: any) {
    this.dependencies[name] = value;
  }
}

export const di = new DI();
