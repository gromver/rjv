/// <reference path="./defaultKeywords.ts" />
import Ref from './utils/Ref';
import SimpleStorage from './utils/Storage';
import _extend from 'lodash/extend';
import _cloneDeep from 'lodash/cloneDeep';
import {
  ISchema,
  IKeyword,
  IKeywordMap,
  IValidatorOptions,
  IValidateFnOptions,
  IRef,
  IStorage,
  ValidateFn,
  IValidationResult,
  IValidateFnResult,
  KeywordFnValidationResult,
} from './types';
import defaultKeywords, { addKeyword } from './defaultKeywords';
import utils from './utils';

const DEFAULT_OPTIONS: IValidatorOptions = {
  coerceTypes: false,
  removeAdditional: false,
  validateFirst: true,
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
 * Creates a Validator instance using the given schema for data validation
 */
export default class Validator {
  private readonly options: IValidatorOptions;
  private readonly keywords: IKeywordMap;
  private readonly validateFn: ValidateFn;
  private readonly validateFnOptions: IValidateFnOptions;

  constructor(schema: ISchema, options: Partial<IValidatorOptions> = {}) {
    this.options = _extend({}, DEFAULT_OPTIONS, options);
    this.keywords = { ...defaultKeywords };

    this.options.keywords.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    this.validateFnOptions = {
      removeAdditional: options.removeAdditional,
      coerceTypes: options.coerceTypes,
      validateFirst: options.validateFirst,
    };

    this.validateFn = this.compile(schema);
  }

  /**
   * Compiles the schema according to the validator options
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

    function applyCustomMessageDescriptions(result: IValidateFnResult) {
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

        if (res) {
          // todo check correctness of the result
          results.push(res);

          if (options.validateFirst && !res.valid) break;
        }
      }

      if (results.length) {
        return applyCustomMessageDescriptions(utils.mergeResults(results));
      }

      return undefined;
    };
  }

  /**
   * Validates ref and returns a validation result object
   * @param ref
   * @param options
   */
  async validateRef(
    ref: IRef,
    options: Partial<IValidateFnOptions> = {},
  ): Promise<IValidationResult> {
    const validationOptions = _extend({}, this.validateFnOptions, options);
    const results = {};

    async function applyValidateFn(ref: IRef, validateFn: ValidateFn, options: IValidateFnOptions)
      : Promise<KeywordFnValidationResult> {
      return validateFn(ref, options, applyValidateFn)
        .then((result: KeywordFnValidationResult) => {
          results[ref.path] = result;
          return result;
        });
    }

    const result = await applyValidateFn(ref, this.validateFn, validationOptions);

    return {
      results,
      valid: result ? result.valid : false,
    };
  }

  /**
   * Validates storage and returns a validation result object
   * @param storage
   * @param options
   */
  async validateStorage(
    storage: IStorage,
    options: Partial<IValidateFnOptions> = {},
  ): Promise<IValidationResult> {
    const ref = new Ref(storage);

    return this.validateRef(ref, options);
  }

  /**
   * Validates data and returns a validation result object
   * @param data
   * @param options
   */
  async validateData(
    data: any,
    options: Partial<IValidateFnOptions> = {},
  ): Promise<IValidationResult> {
    const ref = new Ref(new SimpleStorage(data));

    return this.validateRef(ref, options);
  }

  /**
   * Adds new keyword
   * @param keyword
   */
  addKeyword(keyword: IKeyword) {
    addKeyword(keyword, this.keywords);
  }
}
