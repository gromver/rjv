import * as events from './events';
import * as types from './types';

const version = '${RJV-VERSION}';

export { default as Model } from './Model';

export { default as Ref } from './Ref';

export { default as Storage } from './storage/LodashStorage';

export { default as utils } from './utils';

export {
  version,
  events,
  types,
};
