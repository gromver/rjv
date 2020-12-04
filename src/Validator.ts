/// <reference path="./defaultKeywords.ts" />
import Ref from './utils/Ref';
import SimpleStorage from './utils/Storage';
import _extend from 'lodash/extend';
import _cloneDeep from 'lodash/cloneDeep';
import {
  ISchema,
  IKeyword,
  IKeywordMap,
  ApplyValidateFn,
  IValidatorOptions,
  IValidateFnOptions,
  IRef,
  ValidateFn,
  IValidatorResult,
  IValidateFnResult,
  ValidateFnResult,
} from './types';
import defaultKeywords, { addKeyword } from './defaultKeywords';
import utils from './utils';

const DEFAULT_OPTIONS: IValidatorOptions = {
  coerceTypes: false,
  removeAdditional: false,
  errors: {},
  warnings: {},
  keywords: [],
};

const SCHEMA_ANNOTATIONS = [
  'default',
  'filter',
  'readonly',
  'error',
  'errors',
  'warning',
  'warnings',
  'removeAdditional',
];

/**
 * Compiles given schema to a validation rule and gives an ability to validate ref using this schema
 */
export default class Validator {
  private readonly options: IValidatorOptions;
  private readonly keywords: IKeywordMap;
  private readonly validateFn: ValidateFn;

  constructor(schema: ISchema, options: Partial<IValidatorOptions> = {}) {
    this.options = _extend({}, DEFAULT_OPTIONS, options);
    this.keywords = { ...defaultKeywords };

    this.options.keywords.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    this.validateFn = this.compile(schema);
  }

  /**
   * Compiles the schema
   * @param schema
   */
  private compile = (schema: ISchema): ValidateFn => {
    const defaultValue = schema.default;
    const filterFn = schema.filter;
    const errorDesc = schema.error;
    const warningDesc = schema.warning;
    const schemaErrors = schema.errors || {};
    const schemaWarnings = schema.warnings || {};
    const validatorErrors = this.options.errors;
    const validatorWarnings = this.options.warnings;

    if (filterFn !== undefined && typeof filterFn !== 'function') {
      throw new Error('The schema of the "filter" keyword should be a function.');
    }

    function addCustomMessageDescriptions(result: IValidateFnResult) {
      const { messages } = result;

      messages.forEach((message) => {
        if (message.success) {
          message.description = warningDesc
            || schemaWarnings[message.keyword]
            || validatorWarnings[message.keyword]
            || message.description;
        } else {
          message.description = errorDesc
            || schemaErrors[message.keyword]
            || validatorErrors[message.keyword]
            || message.description;
        }
      });

      return result;
    }

    // get rules
    const rules: ValidateFn[] = [async (ref: Ref): Promise<undefined> => {
      const value = ref.value;

      if (value === undefined) {
        if (defaultValue !== undefined) {
          ref.value = _cloneDeep(defaultValue);
        }
      } else {
        if (filterFn) {
          const filteredValue = filterFn(value);

          if (filteredValue !== value) {
            ref.value = filteredValue;
          }
        }
      }

      return undefined;
    }];

    Object.entries(schema).forEach(([keywordName, keywordSchema]) => {
      if (SCHEMA_ANNOTATIONS.indexOf(keywordName) !== -1) {
        return;
      }

      const keyword: IKeyword = this.keywords[keywordName];

      if (!keyword) {
        throw new Error(`Keyword "${keywordName}" doesn't exists.`);
      }

      const rule = keyword.compile(this.compile, keywordSchema, schema);

      rules.push(rule);
    });

    return async (ref, options, applyValidateFn) => {
      const results: IValidateFnResult[] = [];

      for (const rule of rules) {
        const res = await rule(ref, options, applyValidateFn);

        res && results.push(res);
      }

      if (results.length) {
        return addCustomMessageDescriptions(utils.mergeResults(results));
      }

      return undefined;
    };
  }

  /**
   * Validates ref and returns a validation result object
   * @param ref
   * @param validateRuleFn
   * @param options
   */
  async validateRef(
    ref: IRef,
    options: Partial<IValidatorOptions> = {},
    validateRuleFn?: ApplyValidateFn,
  ): Promise<IValidatorResult> {
    const validationOptions = _extend({}, this.options, options);
    const results = {};
    const normalizedValidateRuleFn = validateRuleFn || getApplyValidateFn(results);

    const result = await normalizedValidateRuleFn(ref, this.validateFn, validationOptions);

    return {
      results,
      valid: result ? result.valid : false,
    };
  }

  /**
   * Validates given data and returns a validation result object
   * @param data
   * @param validateRuleFn
   * @param options
   */
  async validateData(
    data: any,
    options: Partial<IValidatorOptions> = {},
    validateRuleFn?: ApplyValidateFn,
  ): Promise<IValidatorResult> {
    const validationOptions = _extend({}, this.options, options);
    const ref = new Ref(new SimpleStorage(data), '/');
    const results = {};
    const normalizedValidateRuleFn = validateRuleFn || getApplyValidateFn(results);

    const result = await normalizedValidateRuleFn(ref, this.validateFn, validationOptions);

    return {
      results,
      valid: result ? result.valid : false,
    };
  }

  /**
   * Adds new keyword
   * @param keyword
   */
  addKeyword(keyword: IKeyword) {
    addKeyword(keyword, this.keywords);
  }
}

function getApplyValidateFn(results: {}): ApplyValidateFn {
  async function applyValidateFn(ref: IRef, validateFn: ValidateFn, options: IValidateFnOptions)
    : Promise<ValidateFnResult> {
    return validateFn(ref, options, applyValidateFn)
      .then((result: ValidateFnResult) => {
        results[ref.path] = result;
        return result;
      });
  }

  return applyValidateFn;
}
