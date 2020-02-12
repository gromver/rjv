import { Route } from './types';

const _ = {
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export default class Storage {
  constructor(private data?: any) {}

  get(route: Route): any {
    return route.length ? _.get(this.data, route) : this.data;
  }

  set(route: Route, value: any) {
    if (route.length) {
      _.set(this.data, route, value);
    } else {
      this.data = value;
    }
  }
}
