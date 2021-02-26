# RJV

Reactive JSON Schema Validator - a simplified JSON schema validator adapted for building frontend form validation tools,
such as the [rjv-react](https://github.com/gromver/rjv-react) library for creating forms in ReactJS applications.

 - extends JSON schema with functional keywords which allow creating validation rules at runtime.
 - customizable error and warning messages

> If you are looking for a server side data validation solution, you should choose another one, such as [ajv](https://github.com/ajv-validator/ajv)

 - [Install](#install)
 - [Usage](#usage)
 - [Keywords](#keywords)
 - [API](#api)

# Install
```
# npm
npm i rjv

# yarn
yarn add rjv
```

# Usage
 - [Validating data](#validating-data)
 - [Accessing data](#accessing-data)
 - [Inline validation](#inline-validation)
 - [Conditional validation](#conditional-validation)
 - [Customizing validation messages](#customizing-validation-messages)
 - [Adding validation keywords](#adding-validation-keywords)

## Validating data

Validating scalar value
```typescript
import { Validator } from 'rjv';

const schema = {
  type: 'number',
  minimum: 5,
  exclusiveMinimum: true,
}

const validator = new Validator(schema)

const data = 6;

validator
  .validateData(data)
  .then(result => console.log('is valid: ', result.valid)) // is valid: true
```

Validating object value
```typescript
import { Validator } from 'rjv';

const schema = {
  properties: {
    login: {
      type: 'string',
      presence: true,
      format: 'email',
      minLength: 3,
    },
    password: {
      type: 'string',
      presence: true,
      minLength: 6,
      pattern: '',
    },
  },
}

const data = {
  login: 'john@mail.com',
  password: '',
}

const validator = new Validator(schema)

validator
  .validateData(data)
  .then(result => console.log('is valid: ', result.valid)) // is valid: false
```

## Accessing data
The `Ref` is a main [interface](#ref) to access and change data.
Each `Ref` points to a specific data property, to determine that property a `path` is being used.
The `path` is a simple string working like a file system path, it can be absolute - `/`, `/a/b/c` or relative - `../b/c`, `b/c`.
The numeric parts of the `path` are treated as an array index, the rest as an object key.
Refs are provided to the validation functions, also refs can be created manually or retrieved from any other `Ref`.

```typescript
import { Ref, Storage, Validator } from 'rjv';

// data source
const data = {
  items: [1, 2, 3],
  obj: {
    prop: 'foo'
  }
}

// wrap data to a Storage object
const storage = new Storage(data);
const rootRef = new Ref(storage); // the same as - new Ref(storage, '/')

// getting values
console.log(rootRef.value); // { items: [1, 2, 3], obj: { prop: 'foo' } }

const objRef = rootRef.ref('obj');
// there is used a relative path which model resolves to the root path '/'
// or could be used an absolute path '/obj'
console.log(objRef.value); // { prop: 'foo' }

let propRef = rootRef.ref('obj/prop');  // get a ref to the "foo" property using model 
propRef = objRef.ref('prop'); // get a ref to the "foo" property using another ref
// the objRef resolves relative paths to the '/obj' path
propRef = objRef.ref('/obj/prop'); // get ref using absolute path
console.log(propRef.value); // 'foo'

const itemsRef = rootRef.ref('items');
console.log(itemsRef.value); // [1, 2, 3]
console.log(itemsRef.ref('0').value); // 1
console.log(itemsRef.ref('1').value); // 2
console.log(itemsRef.ref('../obj/prop').value); // 'foo'
console.log(itemsRef.ref('1').ref('../../obj/prop').value); // 'foo'

// changing values
propRef.value = 'bar';
console.log(propRef.value); // 'bar'
console.log(objRef.value); // { prop: 'bar' }
console.log(rootRef.value); // { items: [1, 2, 3], obj: { prop: 'bar' } }

// validating refs
const result = await (new Validator({ type: 'string' })).validateRef(propRef)
console.log('is valid: ', result.valid) // is valid: true
```

## Inline validation
Besides, the standard JSON validation keywords there is an additional `validate` keyword, which allows
you to place custom validation functions right in the schema.
That functions receive a `Ref` instance to validate and must return a **value**
which is resolved to a `ValidateFnResult` [object](#validatefnresult) according to the following rules:
 - a `ValidateFnResult` object is used as is
 - a `string` value - invalid result with error message ```{ keyword: 'inline', description: `${value}` }```
 - a `boolean` value:
    - `true` - valid result without warning message
    - `false` - invalid result with default error message `{ keyword: 'inline', description: 'Incorrect value' }`

Validation function could be sync:
```typescript
import { Validator, Ref, ValidateFnResult, types } from 'rjv';

const schema: types.ISchema = {
  properties: {
    password: {
      validate: (ref: Ref) => {
        const password = ref.value;

        if (typeof password === 'string') {
          if (password.length < 6) {
            // invalid value having an error message with
            // description - "Password must be at least 6 characters"
            // keyword - "inline"
            return 'Password must be at least 6 characters'
          }

          if (password.length < 8) {
            // valid value but has an additional warning message with
            // description - "Weak password"
            // keyword - "password"
            return new ValidateFnResult(true, 'Weak password', 'password')
          }

          // valid value without warning message
          return true
        }

        // invalid value having a default error message with
        // description - "Incorrect value"
        // keyword - "inline"
        return false
      },
    }
  }
};
const data = { password: '1234567' };

const validator = new Validator(schema);

const { valid, results } = await validator.validateData(data);
conosle.log(valid); // true
conosle.log(results['/'].messages[0].toString()); // Weak password
```

or async:
```typescript
import { Validator, Ref, types } from 'rjv';

const schema: types.ISchema = {
  properties: {
    email: {
      presence: true,
      type: 'string',
      format: 'email',
      validate: async (ref: Ref) => {
        const value = ref.value;

        const res = await fetch(`/is-email-registered?email=${value}`);

        if (res === 'ok') {
          // invalid value
          return 'Email is already registered'
        }

        // valid value
        return true;
      },
    }
  }
};
const data = { email: 'john123@gmail.com' };

const validator = new Validator(schema);

// assume that the user was already registered
const { valid, results } = await validator.validateData(data);
conosle.log(valid); // false
conosle.log(results['/'].messages[0].toString()); // Email is already registered
```

## Conditional validation
Conditional validation could be realized in two ways:
 - Declarative way - using keywords `if/then/else` and the `applySchemas` keyword to combine multiple `if/then/else` conditions.
 - Functional way - using the `resolveSchema` keyword, which is a function that takes a `Ref` instance and returns a JSON validation schema for the given ref.

## Customizing validation messages
There are two options to customize error/warning messages:
 - Through the [options](#ivalidatoroptions) param, these settings changes default keyword messages:
    ```typescript
    import { Validator } from 'rjv';
    
    const validator = new Validator(
      { minLength: 6 },
      // options param
      {
        errors: {
        minLength: 'The value must be at least {limit} characters.',
        }
      }
    );
    ```
 - Through the [`error/errors`](#error--errors) and [`warning/warnings`](#warning--warnings) schema keywords, these setting will only be applied within the schema where they were declared:
    ```typescript
    import { Validator } from 'rjv';
    
    const validator = new Validator(
      {
         minLength: 6,
         errors: {
           minLength: 'The value must be at least {limit} characters.'
         }
      },
    );
    ```

## Adding validation keywords
TBD

# API
 - [Validator](#validator)
    - [`new Validator(schema: ISchema, options?: Partial<IValidatorOptions>): Validator`](#new-validatorschema-ischema-options-partialivalidatoroptions-validator)
    - [`IValidatorOptions`](#ivalidatoroptions)
    - [`validator.validateData(data: any, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`](#validatorvalidatedatadata-any-options-partialivalidatefnoptions-promiseivalidationresult)
    - [`validator.validateStorage(storage: IStorage, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`](#validatorvalidatestoragestorage-istorage-options-partialivalidatefnoptions-promiseivalidationresult)
    - [`validator.validateRef(ref: IRef, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`](#validatorvalidaterefref-iref-options-partialivalidatefnoptions-promiseivalidationresult)
    - [`IValidateFnOptions`](#ivalidatefnoptions)
    - [`IValidationResult`](#ivalidationresult)
 - [Storage](#storage)
    - [`new Storage(data: any): Storage`](#new-storagedata-any-storage)
    - [`storage.set(route: Array<string | number>, value: any): void`](#storagesetroute-arraystring--number-value-any-void)
    - [`storage.get(route: Array<string | number>): any`](#storagegetroute-arraystring--number-any)
 - [Ref](#ref)
    - [`new Ref(storage: Storage, path = '/'): Ref`](#new-refstorage-storage-path---ref)
    - [`ref.ref(path: string): Ref`](#refrefpath-string-ref)
    - [`ref.setValue(value: any): void` / `ref.value = value`](#refsetvaluevalue-any-void)
    - [`ref.getValue(): any` / `ref.value: any`](#refgetvalue-any)
 - [ValidationMessage](#validationmessage)
    - [`IValidationMessage`](#ivalidationmessage)
    - [`new ValidationMessage(success: boolean, keyword: string, description: string, bindings?: {}): ValidationMessage`](#new-validationmessagesuccess-boolean-keyword-string-description-string-bindings--validationmessage)
    - [`message.toString(): string`](#messagetostring-string)
 - [ValidateFnResult](#validatefnresult)
    - [`IValidateFnResult`](#ivalidatefnresult)
    - [`new ValidateFnResult(valid: boolean, description?: string, keyword?: string, bindings?: {}): ValidateFnResult`](#new-validatefnresultvalid-boolean-description-string-keyword-string-bindings--validatefnresult)

## Validator
The main class uses JSON schema for data validation.
#### `new Validator(schema: ISchema, options?: Partial<IValidatorOptions>): Validator`
Creates Validator instance:
```typescript
import { Validator } from 'rjv';

const validator = new Validator({ type: 'string', presence: true })
```

#### `IValidatorOptions`:
An object representing a validator options
```typescript
interface IValidatorOptions {
  /**
   * Coerce data types
   */
  coerceTypes: boolean;
  /**
   * Remove additional properties
   */
  removeAdditional: boolean;
  /**
   * Stop the property validation proccess on the first error
   */
  validateFirst: boolean;
  /**
   * A map with custom error messages
   */
  errors: { [keywordName: string]: string };
  /**
   * A map with custom warning messages
   */
  warnings: { [keywordName: string]: string };
  /**
   * An array of additional keywords
   */
  keywords: IKeyword[];
}
```
Default validator options:
```typescript
const defaultOptions = {
  coerceTypes: false,
  removeAdditional: false,
  validateFirst: true,
  errors: {},
  warnings: {},
  keywords: []
}
```

#### `validator.validateData(data: any, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`
Validates data
```typescript
import { Validator } from 'rjv';

const validator = new Validator({ type: 'string', presence: true })
validator
  .validateData('abc')
  .then((res) => console.log(res.valid)) // true
```
See [IValidateFnOptions](#ivalidatefnoptions), [IValidationResult](#ivalidationresult)

#### `validator.validateStorage(storage: IStorage, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`
Validates data wrapped in a `Storage` object
```typescript
import { Validator, Storage } from 'rjv';

const validator = new Validator({ type: 'string', presence: true })
validator
  .validateData(new Storage('abc'))
  .then((res) => console.log(res.valid)) // true
```
See [IValidateFnOptions](#ivalidatefnoptions), [IValidationResult](#ivalidationresult)

#### `validator.validateRef(ref: IRef, options?: Partial<IValidateFnOptions>): Promise<IValidationResult>`
Validates data referenced by the `Ref` object
```typescript
import { Validator, Storage } from 'rjv';

const validator = new Validator({ type: 'string', presence: true })
const storage = new Storage({
  foo: 'abc',
  bar: 123
})

validator
  .validateData(new Ref(storage, '/foo'))
  .then((res) => console.log(res.valid)) // true

validator
  .validateData(new Ref(storage, '/bar'))
  .then((res) => console.log(res.valid)) // false
```

#### `IValidateFnOptions`:
An object representing a validate process options, default values are inherited
from the [IValidatorOptions](#ivalidatoroptions) object
```typescript
interface IValidatorOptions {
  /**
   * Coerce data types
   */
  coerceTypes: boolean;
  /**
   * Remove additional properties
   */
  removeAdditional: boolean;
  /**
   * Stop the property validation proccess on the first error
   */
  validateFirst: boolean;
}
```

#### `IValidationResult`:
An object representing a validate process result
```typescript
interface IValidatorOptions {
  /**
   * Is the verified data valid?
   */
  valid: boolean;
  /**
   * Results map
   * Note: that some properties may have an undefined result
   * that means there is no applicable rules for the value type of the property
   * for example: schema { minimum: 10 } doesn't applicable for any non-number values,
   * because "minimum" keyword only works with numbers
   * You should avoid undefined results
   */
  results: {
    [path: string]: IValidateFnResult | undefined;
  };
}
```
See [IValidateFnResult](#ivalidatefnresult)

## Storage
Provides a simple `get/set` API to access data

#### `new Storage(data: any): Storage`
Creates Storage instance.
```typescript
import { Storage } from 'rjv';

const storage = new Storage('some data');
```

#### `storage.set(route: Array<string | number>, value: any): void`
Sets new value to the specified property
```typescript
import { Storage } from 'rjv';

const scalarStorage = new Storage('foo');
console.log(scalarStorage.get([])); // foo
scalarStorage.set([], 'bar');
console.log(scalarStorage.get([])); // bar

const objectStorage = new Storage({ prop: 'foo' });
console.log(objectStorage.get([])); // { prop: 'foo' }
objectStorage.set(['prop'], 'bar');
console.log(objectStorage.get([])); // { prop: 'bar' }

const arrayStorage = new Storage(['foo']);
console.log(arrayStorage.get([])); // ['foo']
arrayStorage.set([0], 'bar');
console.log(arrayStorage.get([])); // ['bar']
```

#### `storage.get(route: Array<string | number>): any`
Gets the value of the specified property
```typescript
import { Storage } from 'rjv';

const storage = new Storage({
  a: 'a',
  b: {
    c: 'c',
    d: [123]
  }
});
console.log(storage.get([])); // { a: 'a', b: { c: 'c', d: [123] } }
console.log(storage.get(['a'])); // 'a'
console.log(storage.get(['b'])); // { c: 'c', d: [123] }
console.log(storage.get(['b', 'd', 0])); // 123 }
```

## Ref
Represents a reference to a property of the data storage and provides access to the value of the property.

#### `new Ref(storage: Storage, path = '/'): Ref`
Creates Ref instance.
```typescript
import { Storage, Ref } from 'rjv';

const ref = new Ref(new Storage('foo'));
```
> Provided `path` must be absolute.

#### `ref.ref(path: string): Ref`
Resolves the `path` and gets a ref to the desired property. The `path` could be absolute or relative.
If given `path` is relative it is resolved to the `path` of the current ref.

#### `ref.setValue(value: any): void`
#### `ref.value = value`
Change the value of the ref.
```typescript
import { Storage, Ref } from 'rjv';

const ref = new Ref(new Storage('foo'));
// setter
ref.value = 'bar'; // set new value
// as function
ref.setValue('bar');  // the same
```

#### `ref.getValue(): any`
#### `ref.value: any`
Get the current value of the ref.
```typescript
import { Storage, Ref } from 'rjv';

const ref = new Ref(new Storage('foo'));
// getter
ref.value; // foo
// as function
ref.getValue(); // foo
```

## ValidationMessage
Implements IValidationMessage interface.

#### `IValidationMessage`
An object representing the error / warning messages.
```typescript
export interface IValidationMessage {
  /**
   * `true` if it is a warning message, otherwise it is an error message
   */
  success: boolean;
  /**
   * the name of the keyword causing the error/warning
   */
  keyword: string;
  /**
   * the error/warning description
   * might have {bindingName} tags which can be replaced with values from the `bindings` field
   */
  description: string;
  /**
   * the additional values describing message
   */
  bindings: {};
}
```

#### `new ValidationMessage(success: boolean, keyword: string, description: string, bindings?: {}): ValidationMessage`
Create a validation message description object:
```typescript
import { ValidationMessage } from 'rjv';

const message = new ValidationMessage(
  false,
  'format',
  'Should match format "{format}"',
  { format: 'email' }
);

console.log(message);
/*
{
  success: false,
  keyword: 'format',
  description: 'Should match format "{format}"',
  bindings: { format: 'email' }
}
*/
```

#### `message.toString(): string`
Returns a normalized description of the message, trying to replace `{bindingName}` tags
of the description with the corresponding `bindings` values.
```typescript
import { ValidationMessage } from 'rjv';

const message = new ValidationMessage(
  false,
  'format',
  'Should match format "{format}"',
  { format: 'email' }
);
console.log(message.toString()); // Should match format "email"
```

## ValidateFnResult
Implements IValidateFnResult interface. Used by the build-in keywords and inline validation functions.

#### `IValidateFnResult`
An object describing the result of the value validating process.
```typescript
interface IValidateFnResult {
  valid: boolean;
  messages: IValidationMessage[];
}
```
See [IValidationMessage](#ivalidationmessage)

#### `new ValidateFnResult(valid: boolean, description?: string, keyword?: string, bindings?: {}): ValidateFnResult`
Creates a validation result object.
```typescript
import { ValidateFnResult } from 'rjv';

const result = new ValidateFnResult(
  false,
  'format',
  'Should match format "{format}"',
  { format: 'email' }
);

console.log(result);
/*
{
  valid: false,
  messages: [
    {
      success: false,
      keyword: 'format',
      description: 'Should match format "{format}"',
      bindings: { format: 'email' }
    }
  ]
}
*/
```

# Keywords
- [Keywords for all types](#keywords-for-all-types)
    - [type](#type)
    - [enum](#enum)
    - [const](#const)
    - [presence](#presence)
- [Keywords for numbers](#keywords-for-numbers)
    - [maximum / minimum and exclusiveMaximum / exclusiveMinimum](#maximum--minimum-and-exclusivemaximum--exclusiveminimum)
    - [multipleOf](#multipleof)
- [Keywords for strings](#keywords-for-strings)
    - [maxLength / minLength](#maxlength--minlength)
    - [pattern](#pattern)
    - [format](#format)
- [Keywords for arrays](#keywords-for-arrays)
    - [maxItems / minItems](#maxitems--minitems)
    - [items / additionalItems](#items--additionalitems)
    - [contains](#contains)
- [Keywords for objects](#keywords-for-objects)
    - [maxProperties / minProperties](#maxproperties--minproperties)
    - [required](#required)
    - [properties](#properties)
    - [additionalProperties](#additionalproperties)
- [Compound keywords](#compound-keywords)
    - [not](#not)
    - [oneOf](#oneof)
    - [anyOf](#anyof)
    - [allOf](#allof)
    - [if / then / else](#if--then--else)
    - [applySchemas](#applyschemas)
- [Inline validation keywords](#inline-validation-keywords)
    - [validate](#validate)
    - [resolveSchema](#resolveschema)
- [Annotation keywords](#annotation-keywords)
    - [readOnly](#readonly)
    - [error / errors](#error--errors)
    - [warning / warnings](#warning--warnings)
- [Data mutation keywords](#data-mutation-keywords)
    - [default](#default)
    - [coerceTypes](#coercetypes)
    - [filter](#filter)
    - [removeAdditional](#removeadditional)

## Keywords for all types
#### `type`
This keyword requires that the data is of certain type (or some of the types)

Schema:
```typescript
type Type = 'number' | 'integer' | 'string' | 'boolean' | 'array' | 'object' | 'null'

interface ISchema {
  type: Type | Type[]
}
```
Error message of the `{ type: ['number', 'string'] }`:
```json5
{
  success: false,
  keyword: 'type',
  description: 'Should be {typesAsString}',
  bindings: { types: ['number', 'string'], typesAsString: 'number, string' },
}
```

#### `enum`
The value of the keyword should be an array of unique items of any types. The data is valid if it is deeply equal to one of items in the array.

Schema:
```typescript
interface ISchema {
  enum: any[]
}
```
Error message of the `{ enum: [1, 2, 3] }`:
```json5
{
  success: false,
  keyword: 'enum',
  description: 'Should be equal to one of the allowed values',
  bindings: { allowedValues: [1, 2, 3] }
}
```

#### `const`
The value of this keyword can be anything. If a function is specified as a value, the value will be resolved by calling this function and passing the current ref as an argument.
The data is valid if it is deeply equal to the value of the keyword.
```typescript
interface ISchema {
  const: any | ((ref: Ref) => any)
}
```
Error message of the `{ const: 123 }`:
```json5
{
  success: false,
  keyword: 'const',
  description: 'Should be equal to constant',
  bindings: { allowedValue: 123 }
}
```

#### `presence`
The data is valid if it is not undefined and is not an empty string. If the `trim` option equals `true`
and the value is a string, it will be trimmed.
```typescript
interface ISchema {
  presence: boolean | {
    trim: boolean;
  }
}
```
Error message of the `{ presence: true }`:
```json5
{
  success: false,
  keyword: 'presence',
  description: 'Should not be blank',
  bindings: { path: '/' }
}
```

## Keywords for numbers
#### `maximum` / `minimum` and `exclusiveMaximum` / `exclusiveMinimum`
```typescript
interface ISchema {
  maximum: number;
  minimum: number;
  exclusiveMaximum: boolean;
  exclusiveMinimum: boolean;
}
```
Error message of the `{ maximum: 123 }`:
```json5
{
  success: false,
  keyword: 'maximum',
  description: 'Should be less than or equal {limit}',
  bindings: { limit: 123, exclusive: false }
}
```
Error message of the `{ maximum: 123, exclusiveMaximum: true }`:
```json5
{
  success: false,
  keyword: 'maximum_exclusive',
  description: 'Should be less than {limit}',
  bindings: { limit: 123, exclusive: true }
}
```
Error message of the `{ minimum: 123 }`:
```json5
{
  success: false,
  keyword: 'minimum',
  description: 'Should be greater than or equal {limit}',
  bindings: { limit: 123, exclusive: false }
}
```
Error message of the `{ maximum: 123, exclusiveMinimum: true }`:
```json5
{
  success: false,
  keyword: 'minimum_exclusive',
  description: 'Should be greater than {limit}',
  bindings: { limit: 123, exclusive: true }
}
```

#### `multipleOf`
The value of the keyword should be a number. The data to be valid should be a multiple of the keyword value (i.e. the result of division of the data on the value should be integer)

Schema:
```typescript
interface ISchema {
  multipleOf: number
}
```
Error message of the `{ multipleOf: 2 }`:
```json5
{
  success: false,
  keyword: 'multipleOf',
  description: 'Should be multiple of {multiplier}',
  bindings: { multiplier: 2 }
}
```

## Keywords for strings
#### `maxLength` / `minLength`
The data to be valid should have length satisfying this rule.

Schema:
```typescript
interface ISchema {
  maxLength: number
  minLength: number
}
```
Error message of the `{ maxLength: 5 }`:
```json5
{
  success: false,
  keyword: 'maxLength',
  description: 'Should not be longer than {limit} characters',
  bindings: { limit: 5 }
}
```
Error message of the `{ minLength: 5 }`:
```json5
{
  success: false,
  keyword: 'minLength',
  description: 'Should not be shorter than {limit} characters',
  bindings: { limit: 5 }
}
```

#### `pattern`
The data to be valid should match the regular expression defined by the keyword value.
Rjv uses new RegExp(value) to create the regular expression that will be used to test data.

Schema:
```typescript
interface ISchema {
  pattern: string
}
```
Error message of the `{ pattern: '/\d/' }`:
```json5
{
  success: false,
  keyword: 'pattern',
  description: 'Should match pattern {pattern}',
  bindings: { pattern: '/\d/' }
}
```

#### `format`
The data to be valid should match the format with this name.

Schema:
```typescript
type Format = 'date' | 'time' | 'date-time' | 'email' | 'uri' | 'url' | 'uri-reference' | 'uri-template' | 'hostname' | 'ipv4' | 'ipv6' | 'regex'

interface ISchema {
  format: Format
}
```

Formats description:
- `date` - full-date according to [RFC3339](http://tools.ietf.org/html/rfc3339#section-5.6).
- `time` - time with optional time-zone.
- `date-time` - date-time from the same source (time-zone is mandatory).
- `uri` - full URI.
- `uri-reference` - URI reference, including full and relative URIs.
- `uri-template` - URI template according to [RFC6570](https://datatracker.ietf.org/doc/rfc6570/)
- `url` - [URL record](https://url.spec.whatwg.org/#concept-url).
- `email` - email address.
- `hostname` - host name according to [RFC1034](http://tools.ietf.org/html/rfc1034#section-3.5).
- `ipv4` - IP address v4.
- `ipv6` - IP address v6.
- `regex` - tests whether a string is a valid regular expression by passing it to RegExp constructor.

Error message of the `{ format: 'email' }`:
```json5
{
  success: false,
  keyword: 'format',
  description: 'Should match format "{format}"',
  bindings: { format: 'email' }
}
```

## Keywords for arrays

#### `maxItems` / `minItems`
The data array to be valid should not have more (less) items than the keyword value.

Schema:
```typescript
interface ISchema {
  maxItems: number
  minItems: number
}
```
Error message of the `{ maxItems: 3 }`:
```json5
{
  success: false,
  keyword: 'maxItems',
  description: 'Should not have more than {limit} items',
  bindings: { limit: 3 }
}
```
Error message of the `{ minItems: 3 }`:
```json5
{
  success: false,
  keyword: 'minItems',
  description: 'Should not have fewer than {limit} items',
  bindings: { limit: 3 }
}
```

#### `items` / `additionalItems`
The value of the keyword should be an object or an array of objects.

If the keyword value is an object, then for the data array to be valid each item of the array should be valid according to the schema in this value. In this case the "additionalItems" keyword is ignored.

If the keyword value is an array, then items with indices less than the number of items in the keyword should be valid according to the schemas with the same indices. Whether additional items are valid will depend on "additionalItems" keyword.

Schema:
```typescript
interface ISchema {
  items: Schema | Schema[]
  additionalItems: boolean | Schema
}
```
Error message of the `{ items: { type: 'number' } }`:
```json5
{
  message: {
    keyword: 'items',
    description: 'Should have valid items',
    bindings: { invalidIndexes: [1] }
  }
}
```
Error message of the `{ items: [{ type: 'number' }, { type: 'number' }] }`:
```json5
{
  message: {
    keyword: 'items_overflow',
    description: 'Should not have more than {limit} items',
    bindings: { limit: 2 }
  }
}
```

#### `contains`
The value of the keyword is a JSON Schema. The array is valid if it contains at least one item that is valid according to this schema.

Schema:
```typescript
interface ISchema {
  contains: Schema
  additionalItems: boolean | Schema
}
```
Error message of the `{ contains: 123 }`:
```json5
{
  success: false,
  keyword: 'contains',
  description: 'Should contain a valid item',
  bindings: {}
}
```

## Keywords for objects

#### `maxProperties` / `minProperties`
The value of the keywords should be a number. The data object to be valid should have not more (less) properties than the keyword value.

Schema:
```typescript
interface ISchema {
  maxProperties: number
  minProperties: number
}
```
Error message of the `{ maxProperties: 4 }`:
```json5
{
  success: false,
  keyword: 'maxProperties',
  description: 'Should not have more than {limit} properties',
  bindings: { limit: 4 }
}
```
Error message of the `{ minProperties: 4 }`:
```json5
{
  success: false,
  keyword: 'minProperties',
  description: 'Should not have fewer than {limit} properties',
  bindings: { limit: 4 }
}
```

#### `required`
The value of the keyword should be an array of unique strings. The data object to be valid should contain all properties with names equal to the elements in the keyword value.

Schema:
```typescript
interface ISchema {
  required: string[]
}
```
Error message of the `{ required: ['foo', 'bar'] }`:
```json5
{
  success: false,
  keyword: 'required',
  description: 'Should have all required properties',
  bindings: { invalidProperties: ['foo', 'bar'] }
}
```

#### `properties`
The value of the keyword should be a map with keys equal to data object properties. Each value in the map should be a JSON Schema. For data object to be valid the corresponding values in data object properties should be valid according to these schemas.

`properties` keyword does not require that the properties mentioned in it are present in the object

Schema:
```typescript
interface ISchema {
  properties: { [propertyName: string]: Schema }
}
```
Error message of the `{ properties: { foo: { type: 'string' } } }`:
```json5
{
  success: false,
  keyword: 'properties',
  description: 'Should have valid properties',
  bindings: { invalidProperties: ['foo'] }
}
```

#### `additionalProperties`
The value of the keyword should be either a boolean or a JSON Schema.

If the value is true the keyword is ignored.

If the value is false the data object to be valid should not have "additional properties" (i.e. properties other than those used in "properties" keyword).

If the value is a schema for the data object to be valid the values in all "additional properties" should be valid according to this schema.

Schema:
```typescript
interface ISchema {
  additionalProperties: boolean | Schema
}
```
Error message of the `{ properties: { foo: { type: 'string' } }, additionalProperties: false }`:
```json5
{
  success: false,
  keyword: 'properties',
  description: 'Should have valid properties',
  bindings: { invalidProperties: ['bar'] }
}
```

## Compound keywords

#### `not`
The value of the keyword should be a JSON Schema. The data is valid if it is invalid according to this schema.The value of the keyword should be a JSON Schema. The data is valid if it is invalid according to this schema.

Schema:
```typescript
interface ISchema {
  not: Schema
}
```
Error message of the `{ not: { type: 'string' } }`:
```json5
{
  success: false,
  keyword: 'not',
  description: 'Should not be valid',
  bindings: {}
}
```

#### `oneOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it matches exactly one JSON Schema from this array. Validators have to validate data against all schemas to establish validity according to this keyword.

Schema:
```typescript
interface ISchema {
  oneOf: Schema[]
}
```
Error message of the `{ oneOf: [{ type: 'string' }, { type: 'number' }] }`:
```json5
{
  success: false,
  keyword: 'oneOf',
  description: 'Should match exactly one schema in oneOf',
  bindings: {}
}
```

#### `anyOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it is valid according to one or more JSON Schemas in this array. Validators only need to validate data against schemas in order until the first schema matches (or until all schemas have been tried)

Schema:
```typescript
interface ISchema {
  anyOf: Schema[]
}
```
Error message of the `{ anyOf: [{ type: 'string' }, { type: 'number' }] }`:
```json5
{
  success: false,
  keyword: 'anyOf',
  description: 'Should match some schema in anyOf',
  bindings: {}
}
```

#### `allOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it is valid according to all JSON Schemas in this array.

Schema:
```typescript
interface ISchema {
  allOf: Schema[]
}
```
Error message of the `{ allOf: [{ type: 'integer' }, { type: 'number' }] }`:
```json5
{
  success: false,
  keyword: 'allOf',
  description: 'Should match all schema in allOf',
  bindings: {}
}
```

#### `if` / `then` / `else`
These keywords allow you to implement conditional validation. Their values should be valid JSON Schemas.

Schema:
```typescript
interface ISchema {
  if: Schema
  then: Schema
  else: Schema
}
```

#### `applySchemas`
Apply several validation schemas, useful when a property has several validation scenarios (for example `if` / `then` / `else` clauses)

Schema:
```typescript
interface ISchema {
  applySchemas: Schema[]
}
```

## Inline validation keywords

#### `validate`
Custom validation function receives current property ref and rule validation function being used for nested properties validation.
The validation function must return a validation result object.

Schema:
```typescript
type InlineFnValidationResult = ValidateFnResult
  | string
  | boolean
  | undefined

interface ISchema {
  validate: (ref: Ref) => InlineFnValidationResult | Promise<InlineFnValidationResult>
}
```

#### `resolveSchema`
Custom function receives the current property ref and returns a validation schema applicable to this property.

Schema:
```typescript
interface ISchema {
  resolveSchema: (ref: Ref) => Schema | Promise<Schema>
}
```

## Annotation keywords

#### `readOnly`
Marks property as read only.

Schema:
```typescript
interface ISchema {
  readOnly: boolean
}
```

#### `error` / `errors`
These keywords are used to customize default error message descriptions if they are provided.
The provided value will be used as the description of the error message instead of the default descriptions.
`error` is used to customize any error message and takes precedence over `warnings` keyword, which is used
to customize an error message of a particular keyword.

Schema:
```typescript
interface ISchema {
  error: string
  errors: {
    // common
    type?: string
    const?: string
    enum?: string
    presence?: string
    // string
    format?: string
    pattern?: string
    minLength?: string
    maxLength?: string
    // number
    maximum?: string
    maximum_exclusive?: string
    minimum?: string
    minimum_exclusive?: string
    multipleOf?: string
    // array
    contains?: string
    minItems?: string
    maxItems?: string
    items?: string
    items_overflow?: string
    // object
    minProperties?: string
    maxProperties?: string
    properties?: string
    required?: string
    // conditionals
    allOf?: string
    anyOf?: string
    not?: string
    oneOf?: string
    // added custom keywords
    [keyword: string]: string
  }
}
```

#### `warning` / `warnings`
These keywords are used to customize default warning message descriptions if they are provided.
The provided value will be used as the description of the warning message instead of the default descriptions.
`warning` is used to customize any warning message and takes precedence over `warnings` keyword, which is used
to customize a warning message of a particular keyword.

Schema:
```typescript
interface ISchema {
  warning: any
  warnings: { [keyword: string]: any }  // default keywords don't expose warnings
}
```

## Data mutation keywords

#### `default`
If property is undefined, provides default value for it

Schema:
```typescript
interface ISchema {
  default: any
}
```

#### `coerceTypes`
If the keyword is true or the `coerceTypes` validation option is true - coerces data to the desired [type](#type) if it needed. Coerce type rules:
- to `string`: `123` => `"123"`, `true` => `"true"`, `false` => `"false"`
- to `number`: `false` => `0`, `true` => `1`, `null` => `0`, `"123.45"` => `123.45`, not numeric strings `"asd123"` and empty strings `""` are not being coerced.
- to `integer`: `false` => `0`, `true` => `1`, `null` => `0`, `"123"` => `123`, not numeric strings `"asd123"`, not integer strings `"123.45"` and empty strings `""` are not being coerced.
- to `boolean`: `null` => `false`, `0` => `false`, `1` => `true`
- to `null`: `""` => `null`, `0` => `null`, `false` => `null`

Schema:
```typescript
interface ISchema {
  coerceTypes: boolean // default false
}
```

#### `filter`
The value of the keyword should be a function receiving a data value and returning filtered (normalized) value.

Schema:
```typescript
interface ISchema {
  filter: (value: any) => any
}
```

#### `removeAdditional`
The value of the keyword should be a boolean.

When the keyword is true or the `removeAdditional` validation option is true:
- if the value being validated is an object, the invalid properties (i.e. properties other than those used in "properties" keyword and those that do not satisfy "additionalProperties" keyword) are removed from the data object.
- if the value being validated is an array, the invalid items (i.e. items other than those used in "items" keyword and those that do not satisfy "additionalItems" keyword) are removed from the data array.

> Note that the validated value will be replaced with a cleaned value when the `items` or `properties` keyword finishes validation. So the following keywords will validate the cleaned value.

Schema:
```typescript
interface ISchema {
  removeAdditional: boolean // default false
}
```

# License
**RJV** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rjv/blob/master/LICENSE

