/// <reference path="./defaultKeywords.ts" />
import Ref from './utils/Ref';
import SimpleStorage from './utils/Storage';
import _extend from 'lodash/extend';
import _cloneDeep from 'lodash/cloneDeep';
import {
  ISchema,
  IKeyword,
  IKeywordMap,
  IRuleCompiled,
  ValidateRuleFn,
  IValidatorOptions,
  IRuleValidationOptions,
  IRef,
  IRule,
  IValidationResult,
  IRuleValidationResult,
  RuleValidationResult,
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
  private readonly rule: IRuleCompiled;

  constructor(schema: {}, options: Partial<IValidatorOptions> = {}) {
    this.options = _extend({}, DEFAULT_OPTIONS, options);
    this.keywords = { ...defaultKeywords };

    this.options.keywords.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    this.rule = this.compile(schema);
  }

  /**
   * Compiles the schema
   * @param schema
   */
  private compile = (schema: ISchema): IRuleCompiled => {
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

    function addCustomMessageDescriptions(result: IRuleValidationResult) {
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
    const rules: IRuleCompiled[] = [{
      keyword: 'annotations',
      validate: async (ref: Ref): Promise<undefined> => {
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
      },
    }];

    Object.entries(schema).forEach(([keywordName, keywordSchema]) => {
      if (SCHEMA_ANNOTATIONS.indexOf(keywordName) !== -1) {
        return;
      }

      const keyword: IKeyword = this.keywords[keywordName];

      if (!keyword) {
        throw new Error(`Keyword "${keywordName}" doesn't exists.`);
      }

      const rule = keyword.compile(this.compile, keywordSchema, schema) as IRuleCompiled;
      rule.keyword = keyword.name;

      rules.push(rule);
    });

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<RuleValidationResult> => {
      const results: IRuleValidationResult[] = [];

      for (const rule of rules) {
        if (rule.validate) {
          const res = await rule.validate(ref, validateRuleFn, options);

          res && results.push(res);
        }
      }

      if (results.length) {
        return addCustomMessageDescriptions(utils.mergeResults(results));
      }

      return undefined;
    };

    return {
      validate,
      keyword: 'schema',
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
    validateRuleFn?: ValidateRuleFn,
    options: Partial<IValidatorOptions> = {},
  ): Promise<IValidationResult> {
    const validationOptions = _extend({}, this.options, options);
    const results = {};
    const normalizedValidateRuleFn = validateRuleFn || getValidateRuleFn(results);

    const result = await normalizedValidateRuleFn(ref, this.rule, validationOptions);

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
    validateRuleFn?: ValidateRuleFn,
    options: Partial<IValidatorOptions> = {},
  ): Promise<IValidationResult> {
    const validationOptions = _extend({}, this.options, options);
    const ref = new Ref(new SimpleStorage(data), '/');
    const results = {};
    const normalizedValidateRuleFn = validateRuleFn || getValidateRuleFn(results);

    const result = await normalizedValidateRuleFn(ref, this.rule, validationOptions);

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

function getValidateRuleFn(results: {}): ValidateRuleFn {
  async function validateRuleFn(ref: IRef, rule: IRule, options: IRuleValidationOptions)
    : Promise<RuleValidationResult> {
    return rule.validate
      ? rule.validate(ref, validateRuleFn, options)
        .then((result: RuleValidationResult) => {
          results[ref.path] = result;
          return result;
        })
      : undefined;
  }

  return validateRuleFn;
}
