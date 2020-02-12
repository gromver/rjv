import * as events from './events';
import * as types from './types';
// import { ISchema, IKeyword, IRuleValidationResult, IRule } from './types';
// import { StateTypes } from './interfaces/IState';

const version = '${RJV-VERSION}';

export { default as Model } from './ModelOld';

export { default as Ref } from './Ref';

// export { default as ISchema } from './interfaces/ISchema';
//
// export { default as IKeyword } from './interfaces/IKeyword';
//
// export { default as IRuleValidationResult } from './interfaces/IRuleValidationResult';
//
// export { default as IRule } from './interfaces/IRule';

export {
  version,
  events,
  // stateTypes,
  types,
};
