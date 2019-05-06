import * as events from './events';
import { StateTypes } from './interfaces/IState';

const version = '${RJV-VERSION}';

const stateTypes = {
  PRISTINE: StateTypes.PRISTINE,
  VALIDATING: StateTypes.VALIDATING,
  SUCCESS: StateTypes.SUCCESS,
  ERROR: StateTypes.ERROR,
};

export { default as Model } from './Model';

export { default as Ref } from './Ref';

export { default as ISchema } from './interfaces/ISchema';

export { default as IKeyword } from './interfaces/IKeyword';

export { default as IRuleValidationResult } from './interfaces/IRuleValidationResult';

export { default as IRule } from './interfaces/IRule';

export {
  version,
  events,
  stateTypes,
};
