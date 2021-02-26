import _get from 'lodash/get';
import _set from 'lodash/set';
import { Route, IStorage } from '../types';

export default class Storage implements IStorage {
  constructor(private data?: any) {}

  get(route: Route): any {
    return route.length ? _get(this.data, route) : this.data;
  }

  set(route: Route, value: any) {
    if (route.length) {
      _set(this.data, route, value);
    } else {
      this.data = value;
    }
  }
}
