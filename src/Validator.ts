import Ref from './Ref';
import {
  ISchema, IKeyword, IKeywordMap, IRuleCompiled, ValidateRuleFn, IRuleValidationResult,
} from './types';
import defaultKeywords, { addKeyword } from './defaultKeywords';
import utils from './utils';

const _ = {
  extend: require('lodash/extend'),
  cloneDeep: require('lodash/cloneDeep'),
  memoize: require('lodash/memoize'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

const DEFAULT_OPTIONS: IValidationOptions = {
  coerceTypes: false,
  removeAdditional: false,
  errors: {},
  warnings: {},
  keywords: [],
};

const SCHEMA_ANNOTATIONS = [
  'title',
  'description',
  'default',
  'readOnly',
  'writeOnly',
  'examples',
  'filter',
  'error',
  'errors',
  'warning',
  'warnings',
  'dependencies',
  'dependsOn',
];

export interface IValidationOptionsPartial {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  errors?: { [keywordName: string]: any };
  warnings?: { [keywordName: string]: any };
  keywords?: IKeyword[];
}

export interface IValidationOptions extends IValidationOptionsPartial {
  coerceTypes: boolean;
  removeAdditional: boolean;
  errors: { [keywordName: string]: any };
  warnings: { [keywordName: string]: any };
  keywords: IKeyword[];
}

export default class Validator {
  private readonly options: IValidationOptions;
  private readonly keywords: IKeywordMap;
  private readonly rule: IRuleCompiled;

  constructor(schema: {}, options: IValidationOptionsPartial = {}) {
    this.options = _.extend({}, DEFAULT_OPTIONS, options);
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
    const annotationResult: IRuleValidationResult = {
      title: schema.title,
      description: schema.description,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
      dependencies: schema.dependencies,
      dependsOn: schema.dependsOn,
    };

    const defaultValue = schema.default;
    const filterFn = schema.filter;
    const errorDesc = schema.error;
    const warningDesc = schema.warning;
    const schemaErrors = schema.errors || {};
    const schemaWarnings = schema.warnings || {};
    const modelErrors = this.options.errors;
    const modelWarnings = this.options.warnings;

    if (filterFn !== undefined && typeof filterFn !== 'function') {
      throw new Error('The schema of the "filter" keyword should be a function.');
    }

    function addSchemaMessageDescriptions(result: IRuleValidationResult) {
      const { message } = result;

      if (message) {
        if (result.valid === true) {
          message.description = warningDesc
            || schemaWarnings[message.keyword]
            || modelWarnings[message.keyword]
            || message.description;
        } else if (result.valid === false) {
          message.description = errorDesc
            || schemaErrors[message.keyword]
            || modelErrors[message.keyword]
            || message.description;
        }
      }

      return result;
    }

    // get rules
    const rules: IRuleCompiled[] = [{
      keyword: 'annotations',
      validate: async (ref: Ref): Promise<IRuleValidationResult> => {
        const value = ref.getValue();

        if (value === undefined) {
          if (defaultValue !== undefined) {
            ref.setValue(_.cloneDeep(defaultValue));
          }
        } else {
          if (filterFn) {
            const filteredValue = filterFn(value);

            if (filteredValue !== value) {
              ref.setValue(filteredValue);
            }
          }
        }

        return annotationResult;
      },
    }];

    Object.entries(schema).forEach(([keywordName, keywordSchema]) => {
      if (SCHEMA_ANNOTATIONS.indexOf(keywordName) !== -1) {
        return;
      }

      const keyword: IKeyword = this.keywords[keywordName];

      if (!keyword) {
        throw new Error(`Keyword "${keywordName}" does't exists.`);
      }

      const rule = keyword.compile(this.compile, keywordSchema, schema) as IRuleCompiled;
      rule.keyword = keyword.name;

      rules.push(rule);
    });

    const validate = async (ref: Ref, validateRuleFn: ValidateRuleFn, options)
      : Promise<IRuleValidationResult> => {
      const results: IRuleValidationResult[] = [];

      for (const rule of rules) {
        if (rule.validate) {
          const res = await rule.validate(ref, validateRuleFn, options);

          results.push(res);
        }
      }

      return addSchemaMessageDescriptions(utils.mergeResults(results));
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
  validate(ref: Ref, validateRuleFn: ValidateRuleFn, options = {}): Promise<IRuleValidationResult> {
    const validationOptions = _.extend({}, this.options, options);

    return validateRuleFn(ref, this.rule, validationOptions);
  }

  /**
   * Adds new keyword
   * @param keyword
   */
  addKeyword(keyword: IKeyword) {
    addKeyword(keyword, this.keywords);
  }
}
