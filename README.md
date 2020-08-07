# RxJV

Reactive JSON Schema Validator. Provides a low level API for building frontend form validation tools.
At the moment, there is the [rjv-react](https://github.com/gromver/rjv-react) tool for creating forms in ReactJS applications.

 - utilizing familiar JSON schema to describe validation rules and extend it with functional keywords which allows to easily create dynamic validation rules.
 - managing validation state (errors/warnings) of the props
 - managing UI state (touched/dirty/validated/required/mutable/immutable) of the props 
 - customizable error and warning messages

> If you are looking for a server side data validation solution, you should choose another, such as [ajv](https://github.com/ajv-validator/ajv)

 - [Install](#install)
 - [Guide](#guide)
 - [API](#api)
 - [Keywords](#keywords)

# Install
```
# install using npm
npm i rjv lodash rxjs rxjs-compat

# or using yarn
yarn add rjv lodash rxjs rxjs-compat
```

# Guide
 - [Validating data](#validating-data)
 - [Subscription to the model events](#subscription-to-the-model-events)
 - [Accessing and managing data](#accessing-and-managing-data)
 - [Inline validation](#inline-validation)
 - [Conditional validation](#conditional-validation)
 - [Customizing validation messages](#customizing-validation-messages)

## Validating data

Validating scalar value
```js
import { Model } from 'rjv';

const schema = {
  type: 'number',
  minimum: 5,
  exclusiveMinimum: true,
}

const model = new Model(schema, 6)

model.validate().then(isValid => console.log('isValid: ', isValid))
```

Validating object value
```js
import { Model } from 'rjv';

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
  password: '123qwe',
}


const model = new Model(schema, data)

model.validate().then(isValid => console.log('isValid: ', isValid)) // isValid: true
```

## Subscription to the model events
Model exposes RxJs Subject to subscribe.

```js
import { Model } from 'rjv';

const schema = {
  type: 'string',
  presence: true,
}

const model = new Model(schema, 'abc')

const subscription = model.observable.subscribe((event) => console.log(event));

// to unsubscribe
subscription.unsubscribe();
```

## Accessing and managing data
The `Ref` is a main [interface](#ref) to access and manage data. It can be retrieved from a `Model` or any other `Ref`.
Each `Ref` points on the certain property of the data, to determine that property a `path` is being used.
`path` is a simple string working like a file system path, it could be absolute - `/a/b/c` or relative - `../b/c`, `b/c`.
The numeric parts of the `path` are treated as an array index, the rest as an object key.

```typescript
import { Model, Ref } from 'rjv';

const data = {
  items: [1, 2, 3],
  obj: {
    prop: 'foo'
  }
}

const model = new Model({}, data);
const rootRef = model.ref(); // the same as model.ref('/')
// getting value
console.log(rootRef.value); // { items: [1, 2, 3], obj: { prop: 'foo' } }

const objRef = model.ref('obj');
// there is used a relative path which model resolves to the root path '/'
// or could be used an absolute path '/obj'
console.log(objRef.value); // { prop: 'foo' }

let propRef = model.ref('obj/prop');  // get a ref to the "foo" property using model 
propRef = objRef.ref('prop'); // get a ref to the "foo" property using another ref
// the objRef resolves relative paths to the '/obj' path
propRef = objRef.ref('/obj/prop'); // get ref using absolute path
console.log(propRef.value); // 'foo'

const itemsRef = model.ref('items');
console.log(itemsRef.value); // [1, 2, 3]
console.log(itemsRef.ref('0').value); // 1
console.log(itemsRef.ref('1').value); // 2
console.log(itemsRef.ref('../obj/prop').value); // 'foo'
console.log(itemsRef.ref('1').ref('../../obj/prop').value); // 'foo'

// changing values
propRef.value = 'bar';
console.log(propRef.value); // 'bar'
// validating data
rootRef.validate(); // validate whole data, same as model.validate()
objRef.validate() // validate /obj object
propRef.validate() // validate /obj/prop value
itemsRef.validate() // validate /items array
itemsRef.ref('0').validate() // validate first item of the array
```

## Inline validation
Besides the standard JSON validation keywords there is an additional `validate` keyword, which allows
you to place custom validation functions right in the schema. These functions receive a `Ref` instance to validate and must return
a validation result object. There are three possible results:
 - success result - means that the value of the ref is correct and might have a validation message treated as a warning description.
 - error result - means that the value of the ref is incorrect and must have a validation message treated as an error description.
 - undefined result - means that the value of the ref is not suitable for validation and was skipped

Validation function could be sync:
```javascript
import { Model } from 'rjv';

const schema = {
  properties: {
    age: {
      type: 'number',
      validate: (ref) => {
        if (!ref.checkDataType('number')) {
          // Skip validation of the value as it is a non-numeric value
          // In practice, you are not required to handle undefined results in inline validation functions
          return ref.createUndefinedResult();
        }

        const value = ref.value;

        if (value < 18) {
          return ref.createErrorResult('You are too young.')
        }

        if (value >= 100) {
          return ref.createErrorResult('You are too old.')
        }

        return ref.createSuccessResult();
      },
    }
  }
};
const data = { age: 16 };

const model = new Model(schema, data);

const isValid = await model.validate(); // false
conosle.log(model.ref('age').isValid); // false
conosle.log(model.ref('age').messageDescription); // You are too young.
```

or async:
```javascript
import { Model } from 'rjv';

const schema = {
  properties: {
    email: {
      presence: true,
      type: 'string',
      format: 'email',
      if: {
        presence: true,
        type: 'string',
        format: 'email',
      },
      then: {
        // there is a little trick
        // the validate function is enclosed in the "if/then" condition
        // to launch async validation only when the passed value is a valid email
        // and it prevents unnecessary requests with invalid email values
        validate: async (ref) => {
          const value = ref.value;  // always be a valid email string 
        
          const res = await fetch(`/is-email-registered?email=${value}`);

          if (res === 'ok') {
            return ref.createErrorResult('Email is already registered.')
          }
          

          return ref.createSuccessResult();
        },
      }
    }
  }
};
const data = { email: 'john123@gmail.com' };

const model = new Model(schema, data);

// assume that the user was already registered
const isValid = await model.validate(); // false
conosle.log(model.ref('email').isValid); // false
conosle.log(model.ref('email').messageDescription); // Email is already registered.
```

## Conditional validation
Conditional validation could be realized in two ways:
 - Declarative way - using keywords `if/then/else` and the `applySchemas` keyword to combine multiple `if/then/else` conditions.
 - Functional way - using the `resolveSchema` keyword, which is a function that takes a `Ref` instance and returns a JSON validation schema for the given ref.

## Customizing validation messages
There are two options to customize error messages:
 - Through the `validator` option of the model [options](#model-options), these settings changes default keyword messages:
    ```javascript
    import { Model } from 'rjv';
    
    const model = new Model(
      { minLength: 6 },
      'abc',
      {
        validator: {
          errors: {
            minLength: 'The value must be at least {limit} characters.',
          }
        }
      }
    );
    ```
 - Through the [`error/errors`](#error--errors) and [`warning/warnings`](#warning--warnings) schema keywords, these setting will only be applied within the schema where they were declared:
    ```javascript
    import { Model } from 'rjv';
    
    const model = new Model(
      {
         minLength: 6,
         errors: {
           minLength: 'The value must be at least {limit} characters.'
         }
      },
      'abc'
    );
    ```

# API
 - [Model](#model)
    - [`new Model(schema: Object<Schema>, data?: any, options?: Object<Model options>): Model`](#new-modelschema-objectschema-data-any-options-objectmodel-options-model)
    - [`model.validate(options?: Object<Validation options>): Promise<bool>`](#modelvalidateoptions-objectvalidation-options-promisebool)
    - [`model.prepare(options?: Object<Validation options>): Promise<bool>`](#modelprepareoptions-objectvalidation-options-promisebool)
    - [`model.ref(path = '/', resolve = true): Ref`](#modelrefpath---resolve--true-ref)
    - [`model.safeRef(path = '/', resolve = true): Ref | undefined`](#modelsaferefpath---resolve--true-ref--undefined)
    - [`model.getData(): any` / `model.data: any`](#modelgetdata-any)
    - [`model.setSchema(schema: Object<Schema>): void`](#modelsetschemaschema-objectschema-void)
    - [`model.getSchema(): Object<Schema>`](#modelgetschema-objectschema)
 - [Ref](#ref)
    - [`new Ref(model: Model, path: string): Ref`](#new-refmodel-model-path-string-ref)
    - [Accessors](#accessors)
        - [`ref.ref(path = '/', resolve = true): Ref`](#refrefpath---resolve--true-ref)
        - [`ref.safeRef(path = '/', resolve = true): Ref | undefined`](#refsaferefpath---resolve--true-ref--undefined)
        - [`ref.validate(options?: Object<Validation options>): Promise<bool>`](#refvalidateoptions-objectvalidation-options-promisebool)
        - [`ref.prepare(onlyRef = false): Promise<bool>`](#refprepareonlyref--false-promisebool)
        - [`ref.setValue(value: any): void` / `ref.value = value`](#refsetvaluevalue-any-void)
        - [`ref.getValue(): any` / `ref.value: any`](#refgetvalue-any)
        - [`ref.getInitialValue(): any` / `ref.initialValue: any`](#refgetinitialvalue-any)
        - [`ref.errors: Ref[]`](#referrors-ref)
        - [`ref.validatedErrors: Ref[]`](#refvalidatederrors-ref)
        - [`ref.firstError: Ref | undefined`](#reffirsterror-ref--undefined)
        - [`ref.validatedFirstError: Ref | undefined`](#refvalidatedfirsterror-ref--undefined)
    - [Data validation state](#data-validation-state)
        - [`ref.state: Object<Validation state>`](#refstate-objectvalidation-state)
        - [`ref.message: ValidationMessage | undefined`](#refmessage-validationmessage--undefined)
        - [`ref.messageDescription: string | any | undefined`](#refmessagedescription-string--any--undefined)
        - [`ref.isValid: boolean`](#refisvalid-boolean)
        - [`ref.isInvalid: boolean`](#refisinvalid-boolean)
        - [`ref.isRequired: boolean`](#refisrequired-boolean)
        - [`ref.isShouldNotBeBlank: boolean`](#refisshouldnotbeblank-boolean)
        - [`ref.isMutable: boolean`](#refismutable-boolean)
        - [`ref.isReadOnly: boolean`](#refisreadonly-boolean)
        - [`ref.isWriteOnly: boolean`](#refiswriteonly-boolean)
    - [UI field state](#ui-field-state)
        - [`ref.isTouched: boolean`](#refistouched-boolean)
        - [`ref.isUntouched: boolean`](#refisuntouched-boolean)
        - [`ref.isChanged: boolean`](#refischanged-boolean)
        - [`ref.isDirty: boolean`](#refisdirty-boolean)
        - [`ref.isValidated: boolean`](#refisvalidated-boolean)
        - [`ref.isPristine: boolean`](#refispristine-boolean)
    - [Changing UI field state](#changing-ui-field-state)
        - [`ref.markAsDirty(): void`](#refmarkasdirty-void)
        - [`ref.markAsTouched(): void`](#refmarkastouched-void)
        - [`ref.markAsValidated(): void`](#refmarkasvalidated-void)
        - [`ref.markAsPristine(): void`](#refmarkaspristine-void)
        - [`ref.markAsChanged(): void`](#refmarkaschanged-void)
    - [Helpers](#helpers)
        - [`ref.resolvePath(path: string): string`](#refresolvepathpath-string-string)
        - [`ref.checkDataType(dataType: 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean'): boolean`](#refcheckdatatypedatatype-null--string--number--integer--object--array--boolean-boolean)
        - [`ref.createUndefinedResult(metadata?: Object<Metadata>): Object<Validation result>`](#refcreateundefinedresultmetadata-objectmetadata-objectvalidation-result)
        - [`ref.createErrorResult(message: ValidationMessage | string | any, metadata: Object<Metadata>): Object<Validation result>`](#refcreateerrorresultmessage-validationmessage--string--any-metadata-objectmetadata-objectvalidation-result)
        - [`ref.createSuccessResult(message?: ValidationMessage | string | any, metadata?: Object<Metadata>): Object<Validation result>`](#refcreatesuccessresultmessage-validationmessage--string--any-metadata-objectmetadata-objectvalidation-result)
 - [Events](#events)
    - [`changeRefValue`](#changerefvalue)
    - [`beforeValidation`, `changeRefValidationState`, `afterValidation`](#beforevalidation-changerefvalidationstate-aftervalidation)
    - [`changeRefUIState`](#changerefuistate)
 - [ValidationMessage](#validationmessage)
    - [`new ValidationMessage(keyword: string, description: string | any, bindings?: {}): ValidationMessage`](#new-validationmessagekeyword-string-description-string--any-bindings--validationmessage)

## Model
The main class for data validation combines JSON schema and data together.
#### `new Model(schema: Object<Schema>, data?: any, options?: Object<Model options>): Model`
Creates model instance.
> Note that the provided data to be cloned. 

##### Model options:
 - keywords: list of additional keywords.
 - validator: [validator options](#validator-options).
 - descriptionResolver: a function `(message: Object<Validation message>) => string | any` gets a validation [message](#validation-message) and returns a readable description. Used by [`Ref::messageDescription`](#refmessagedescription-string--any--undefined). You might customize it for getting multi-language descriptions.
 - debug: debug mode, if enabled provides additional info

Model options defaults:
```json5
{
  keywords: [],
  validator: {},
  debug: false,
}
```

##### Validator options:
 - coerceTypes: coerce data types by default
 - removeAdditional: remove additional properties by default
 - errors: customize error messages, an object `{ [keywordName]: any }` expected
 - warnings: customize warning messages, an object `{ [keywordName]: any }` expected
 - keywords: additional keywords

Validator options defaults:
```json5
{
  coerceTypes: false,
  removeAdditional: false,
  errors: {},
  warnings: {},
  keywords: [],
}
```

#### `model.validate(options?: Object<Validation options>): Promise<bool>`
Launch async validation process of the whole model data using provided validation options.

##### Validation options:
 - coerceTypes: coerce data types
 - removeAdditional: remove additional properties
 - markAsValidated: mark refs as validated

#### `model.prepare(options?: Object<Validation options>): Promise<bool>`
The wrapper function around `model.validate({ markAsValidated: false  })` call.
The difference is that the refs aren't marked as validated.
`model.prepare()` is usually being used for the population of the model's initial state.

#### `model.ref(path = '/', resolve = true): Ref`
Get a ref of the property. `path` could be absolute or relative. By default, the given `path` is resolved using the root path `/`.
If the `resolve` option disabled you should provide an absolute `path`.

#### `model.safeRef(path = '/', resolve = true): Ref | undefined`
Same as `model.ref()` but it returns a property reference only if it has applicable schema rules

#### `model.getData(): any`
#### `model.data: any`
Get data of the model. Note that the returned data will be cloned. 

#### `model.setSchema(schema: Object<Schema>): void`
Replace the schema of the model with a new one.

#### `model.getSchema(): Object<Schema>`
Get the current schema of the model.

## Ref
Represents a reference to a property of the model and provides access to value and state of the property.

#### `new Ref(model: Model, path: string): Ref`
Create ref instance. Provided `path` must be absolute.

### Accessors

#### `ref.ref(path = '/', resolve = true): Ref`
Get a ref of the property. `path` could be absolute or relative. By default, the given `path` is resolved using the path of the ref.
If the `resolve` option disabled you should provide an absolute `path`.

#### `ref.safeRef(path = '/', resolve = true): Ref | undefined`
Same as `ref.ref()` but it returns a property reference only if it has applicable schema rules

#### `ref.validate(options?: Object<Validation options>): Promise<bool>`
Launch async validation process of the ref's value using provided [validation options](#validation-options).

#### `ref.prepare(onlyRef = false): Promise<bool>`
The wrapper function around `model.validate({ markAsValidated: false  })` call.
The difference is that the refs aren't marked as validated.
`ref.prepare()` is usually being used for the (re)population of the model's initial state, 
if `onlyRef=true` validation process affects only the ref's value.

#### `ref.setValue(value: any): void`
#### `ref.value = value`
Change value of the ref and trigger [ChangeRefValueEvent](#changerefvalue).

#### `ref.getValue(): any`
#### `ref.value: any`
Get current value of the ref.

#### `ref.getInitialValue(): any`
#### `ref.initialValue: any`
Get initial value of the ref. These getters extract value from the initial data of the model. 

#### `ref.errors: Ref[]`
Returns error refs related to the selected ref

#### `ref.validatedErrors: Ref[]`
Returns error refs related to the selected ref and marked as validated

#### `ref.firstError: Ref | undefined`
Get the error that occurred first if exists

#### `ref.validatedFirstError: Ref | undefined`
Get the error that occurred first among the validated refs (refs [marked](#refmarkasvalidated-void) as validated) if exists

### Data validation state

#### `ref.state: Object<Validation state>`
Returns current validation state of the ref

Validation state:
```json5
{
  // validation state
  valid: false,
  message: {
    keyword: 'minLength',
    description: 'Should not be shorter than {limit} characters',
    bindings: { limit: 6 }
  },
  // schema metadata
  title: 'Password',
  description: 'Password length must not be shorter than 6 characters.',
  readOnly: false,
  writeOnly: false,
  validating: false,
  dependencies: ['confirmPassword'],
  // keywords shared metadata
  presence: true,
  minLength: 6
}
```

#### `ref.message: ValidationMessage | undefined`
Returns current [validation message](#validationmessage) if exists

Example:
```json5
{
  keyword: 'maxLength',
  description: 'Should not be longer than {limit} characters',
  bindings: {
    limit: 5,
  },
}
```

#### `ref.messageDescription: string | any | undefined`
Returns readable description of the validation message if exists

Example:
```typescript
console.log(ref.message);
// {
//   keyword: 'maxLength',
//   description: 'Should not be longer than {limit} characters',
//   bindings: {
//     limit: 5,
//   },
// }

console.log(ref.messageDescription);
// Should not be longer than 5 characters
```

#### `ref.isValid: boolean`
Is ref has been validated and has a valid state?

#### `ref.isInvalid: boolean`
Is ref has been validated and has an invalid state?

#### `ref.isRequired: boolean`
Is the value of the required?

#### `ref.isShouldNotBeBlank: boolean`
Is ref should not be blank?

#### `ref.isMutable: boolean`
Is ref mutable?

#### `ref.isReadOnly: boolean`
Is ref marked as read only?

#### `ref.isWriteOnly: boolean`
Is ref marked as write only?

### UI field state

#### `ref.isTouched: boolean`
Is ref touched?

#### `ref.isUntouched: boolean`
Is ref untouched?

#### `ref.isChanged: boolean`
Is the value of the ref changed?

#### `ref.isDirty: boolean`
Is ref dirty?

#### `ref.isValidated: boolean`
Is ref validated? Note that the model preparing doesn't affect this state.

#### `ref.isPristine: boolean`
Is ref pristine?

### Changing UI field state

#### `ref.markAsDirty(): void`
Mark ref as dirty and emit ChangeRefUIStateEvent if the ref has not been dirty yet.

#### `ref.markAsTouched(): void`
Mark ref as touched and emit ChangeRefUIStateEvent if the ref has not been touched yet.

#### `ref.markAsValidated(): void`
Mark ref as validated and emit ChangeRefUIStateEvent if the ref has not been validated yet.
> Note that by default `ref.validate()` call marks ref and all descendant refs as validated.

#### `ref.markAsPristine(): void`
Mark ref as pristine and emit ChangeRefUIStateEvent.

#### `ref.markAsChanged(): void`
Mark ref as changed. When the ref is marked as changed, the validation state of the ref becomes undefined.

### Helpers

#### `ref.resolvePath(path: string): string`
Resolves given path relative to the path of the ref.

#### `ref.checkDataType(dataType: 'null' | 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean'): boolean`
Checks if the value of the ref has the desired type

#### `ref.createUndefinedResult(metadata?: Object<Metadata>): Object<Validation result>`
Creates undefined validation result

#### `ref.createErrorResult(message: ValidationMessage | string | any, metadata: Object<Metadata>): Object<Validation result>`
Creates error validation result. If the message is a `ValidationMessage` [instance](#validationmessage), it is used as is.
If message has other value, it will be used as a description for a newly created `ValidationMessage` instance with the `inline` keyword and empty bindings.

#### `ref.createSuccessResult(message?: ValidationMessage | string | any, metadata?: Object<Metadata>): Object<Validation result>`
Creates success validation result. If a message is provided, it is treated as a warning message. The message processing logic is the same as in `ref.createErrorResult`.

## Events
The `Model` instance generates data mutation, validation and UI field changing events.

#### `changeRefValue`
Generated when the model's data [changed](#refsetvaluevalue-any-void)
```js
const model = new Model({ type: 'number' }, 1 );

model.observable.subscribe((event) => console.log('event: ', event));

model.ref().value = 2;

// event: { type: 'changeRefValue', path: '/', value: 2 }
```

#### `beforeValidation`, `changeRefValidationState`, `afterValidation`
These events are generated during the validation process.

`beforeValidation` - before the validation process begins.
```json5
{
  type: 'beforeValidation',
  path: '/', // the path of the ref caused validation process
}
```

`changeRefValidationState` - during the validation process when a ref's [validation state](#data-validation-state) are changed
```json5
{
  type: 'changeRefState',
  path: '/foo', // the path to the ref that has changed state
  state: {  // validation state object
    validating: true,
    // ...
  },
}
```

`afterValidation` - when the validation process ends.
```json5
{
  type: 'afterValidation',
  path: '/', // the path of the ref caused validation process
}
```

Example:
```js
const model = new Model({ type: 'number' }, 1 );

model.observable.subscribe((event) => console.log('event: ', event));

model.validate()

// event: { type: 'beforeValidation', path: '/' }
// event: { type: 'changeRefUIState', path: '/', state: 'validated' }
// event: { type: 'changeRefValidationState', path: '/', state: { validating: true } }
// event: { type: 'changeRefValidationState', path: '/', state: { validating: false, required: false, readOnly: false, writeOnly: false, valid: true } }
// event: { type: 'afterValidation', path: '/', valid: true }
```

#### `changeRefUIState`
Generated when a ref's UI state are [changed](#changing-ui-field-state)
```json5
{
  type: 'changeRefUIState',
  path: '/foo', // the path to the ref that has changed state
  state: 'touched',
}
```

## ValidationMessage
Represents error / warning message.

#### `new ValidationMessage(keyword: string, description: string | any, bindings?: {}): ValidationMessage`
Create a validation message description object with properties:
 - keyword: the name of the keyword causing the error/warning
 - bindings: the additional values describing message
 - description: the error/warning description, might have tags which can be replaced with values from the `bindings` field

Example:
```typescript
import { ValidationMessage } from 'rjv';

const message = new ValidationMessage(
  'format',
  'Should match format "{format}"',
  { format: 'email' }
);

console.log(message);
/*
{
  keyword: 'format',
  description: 'Should match format "{format}"',
  bindings: { format: 'email' }
}
*/
```

# Keywords
- [Keywords for all types](#keywords-for-all-types)
    - [type](#type)
    - [enum](#enum)
    - [const](#const)
- [Keywords for numbers](#keywords-for-numbers)
    - [maximum / minimum and exclusiveMaximum / exclusiveMinimum](#maximum--minimum-and-exclusivemaximum--exclusiveminimum)
    - [multipleOf](#multipleof)
- [Keywords for strings](#keywords-for-strings)
    - [maxLength/minLength](#maxlength--minlength)
    - [pattern](#pattern)
    - [format](#format)
- [Keywords for arrays](#keywords-for-arrays)
    - [maxItems/minItems](#maxitems--minitems)
    - [items](#items)
    - [additionalItems](#additionalitems)
    - [contains](#contains)
- [Keywords for objects](#keywords-for-objects)
    - [maxProperties/minProperties](#maxproperties--minproperties)
    - [required](#required)
    - [properties](#properties)
    - [additionalProperties](#additionalproperties)
- [Compound keywords](#compound-keywords)
    - [not](#not)
    - [oneOf](#oneof)
    - [anyOf](#anyof)
    - [allOf](#allof)
    - [if/then/else](#if--then--else)
    - [applySchemas](#applyschemas)
- [Inline validation keywords](#inline-validation-keywords)
    - [validate](#validate)
    - [resolveSchema](#resolveschema)
- [Annotation keywords](#annotation-keywords)
    - [title](#title)
    - [description](#description)
    - [removeAdditional](#removeadditional)
    - [readOnly/writeOnly](#readonly--writeonly)
    - [dependencies](#dependencies)
    - [error / errors](#error--errors)
    - [warning / warnings](#warning--warnings)
 - [Data mutation keywords](#data-mutation-keywords)
    - [default](#default)
    - [coerceTypes](#coercetypes)
    - [filter](#filter)
    - [removeAdditional](#removeadditional)

The description of each keyword will consist of a specification of the scheme and the validation status produced during the verification process.

## Keywords for all types
#### `type`
This keyword requires that the data is of certain type (or some of types)

Schema:
```typescript
type Type = 'number' | 'integer' | 'string' | 'boolean' | 'array' | 'object' | 'null'

interface Schema {
  type: Type | Type[]
}
```
State:
```json5
{
  message: {
    keyword: 'type',
    description: 'Should be {typesAsString}',
    bindings: { types: ['number', 'string'], typesAsString: 'number, string' },
  }
}
```

#### `enum`
The value of the keyword should be an array of unique items of any types. The data is valid if it is deeply equal to one of items in the array.

Schema:
```typescript
interface Schema {
  enum: any[]
}
```
State:
```json5
{
  enum: [1, 2, 3],
  message: {
    keyword: 'enum',
    description: 'Should be equal to one of the allowed values',
    bindings: { allowedValues: [1, 2, 3] }
  }
}
```

#### `const`
The value of this keyword can be anything. If a function is specified as a value, the value will be resolved by calling this function and passing the current ref as an argument.
The data is valid if it is deeply equal to the value of the keyword.
```typescript
interface Schema {
  const: any | ((ref: Ref) => any)
}
```
State:
```json5
{
  const: 123,
  message: {
    keyword: 'const',
    description: 'Should be equal to constant',
    bindings: { allowedValue: 123 }
  }
}
```

## Keywords for numbers
#### `maximum` / `minimum` and `exclusiveMaximum` / `exclusiveMinimum`
```typescript
interface Schema {
  maximum: number;
  minimum: number;
  exclusiveMaximum: boolean;
  exclusiveMinimum: boolean;
}
```
State of the `maximum`:
```json5
{
  maximum: 123,
  message: {
    keyword: 'maximum',
    description: 'Should be less than or equal {limit}',
    bindings: { limit: 123, exclusive: false }
  }
}
```
State of the `maximum` with `exclusiveMaximum`:
```json5
{
  maximum: 123,
  exclusiveMaximum: true,
  message: {
    keyword: 'exclusiveMaximum',
    description: 'Should be less than {limit}',
    bindings: { limit: 123, exclusive: true }
  }
}
```
State of the `minimum`:
```json5
{
  minimum: 123,
  message: {
    keyword: 'minimum',
    description: 'Should be greater than or equal {limit}',
    bindings: { limit: 123, exclusive: false }
  }
}
```
State of the `minimum` with `exclusiveMinimum`:
```json5
{
  minimum: 123,
  exclusiveMinimum: true,
  message: {
    keyword: 'exclusiveMinimum',
    description: 'Should be greater than {limit}',
    bindings: { limit: 123, exclusive: true }
  }
}
```

#### `multipleOf`
The value of the keyword should be a number. The data to be valid should be a multiple of the keyword value (i.e. the result of division of the data on the value should be integer)

Schema:
```typescript
interface Schema {
  multipleOf: number
}
```
State:
```json5
{
  message: {
    keyword: 'multipleOf',
    description: 'Should be multiple of {multiplier}',
    bindings: { multiplier: 2 }
  }
}
```

## Keywords for strings
#### `maxLength` / `minLength`
The data to be valid should have length satisfying this rule.

Schema:
```typescript
interface Schema {
  maxLength: number
  minLength: number
}
```
State of the `maxLength`:
```json5
{
  maxLength: 5,
  message: {
    keyword: 'maxLength',
    description: 'Should not be longer than {limit} characters',
    bindings: { limit: 5 }
  }
}
```
State of the `minLength`:
```json5
{
  minLength: 5,
  message: {
    keyword: 'minLength',
    description: 'Should not be shorter than {limit} characters',
    bindings: { limit: 5 }
  }
}
```

#### `pattern`
The data to be valid should match the regular expression defined by the keyword value.
Rjv uses new RegExp(value) to create the regular expression that will be used to test data.

Schema:
```typescript
interface Schema {
  pattern: string
}
```
State:
```json5
{
  pattern: '/\d/',
  message: {
    keyword: 'pattern',
    description: 'Should match pattern {pattern}',
    bindings: { pattern: '/\d/' }
  }
}
```

#### `format`
The data to be valid should match the format with this name.

Schema:
```typescript
type Format = 'date' | 'time' | 'date-time' | 'email' | 'uri' | 'url' | 'uri-reference' | 'uri-template' | 'hostname' | 'ipv4' | 'ipv6' | 'regex'

interface Schema {
  format: Format
}
```
State:
```json5
{
  format: 'email',
  message: {
    keyword: 'format',
    description: 'Should match format "{format}"',
    bindings: { format: 'email' }
  }
}
```

## Keywords for arrays

#### `maxItems` / `minItems`
The data array to be valid should not have more (less) items than the keyword value.

Schema:
```typescript
interface Schema {
  maxItems: number
  minItems: number
}
```
State of the `maxItems`:
```json5
{
  maxItems: 3,
  message: {
    keyword: 'maxItems',
    description: 'Should not have more than {limit} items',
    bindings: { limit: 3 }
  }
}
```
State of the `minItems`:
```json5
{
  minItems: 3,
  message: {
    keyword: 'minItems',
    description: 'Should not have fewer than {limit} items',
    bindings: { limit: 3 }
  }
}
```

#### `items` / `additionalItems`
The value of the keyword should be an object or an array of objects.

If the keyword value is an object, then for the data array to be valid each item of the array should be valid according to the schema in this value. In this case the "additionalItems" keyword is ignored.

If the keyword value is an array, then items with indices less than the number of items in the keyword should be valid according to the schemas with the same indices. Whether additional items are valid will depend on "additionalItems" keyword.

Schema:
```typescript
interface Schema {
  items: Schema | Schema[]
  additionalItems: boolean | Schema
}
```
State of the `items`:
```json5
{
  message: {
    keyword: 'items',
    description: 'Should not have more than {limit} items',
    bindings: { limit: 3 }
  }
}
```

#### `contains`
The value of the keyword is a JSON Schema. The array is valid if it contains at least one item that is valid according to this schema.

Schema:
```typescript
interface Schema {
  contains: Schema
  additionalItems: boolean | Schema
}
```
State:
```json5
{
  message: {
    keyword: 'contains',
    description: 'Should contain a valid item'
  }
}
```

## Keywords for objects

#### `maxProperties` / `minProperties`
The value of the keywords should be a number. The data object to be valid should have not more (less) properties than the keyword value.

Schema:
```typescript
interface Schema {
  maxProperties: number
  minProperties: number
}
```
State of the `maxProperties`:
```json5
{
  maxProperties: 4,
  message: {
    keyword: 'maxProperties',
    description: 'Should not have more than {limit} properties',
    bindings: { limit: 4 }
  }
}
```
State of the `minProperties`:
```json5
{
  minProperties: 4,
  message: {
    keyword: 'minProperties',
    description: 'Should not have fewer than 4 properties',
    bindings: { limit: 4 }
  }
}
```

#### `required`
The value of the keyword should be an array of unique strings. The data object to be valid should contain all properties with names equal to the elements in the keyword value.

Schema:
```typescript
interface Schema {
  required: string[]
}
```
State:
```json5
{
  message: {
    keyword: 'required',
    description: 'Should have all required properties',
    bindings: { invalidProperties: ['foo', 'bar'] }
  }
}
```

#### `properties`
The value of the keyword should be a map with keys equal to data object properties. Each value in the map should be a JSON Schema. For data object to be valid the corresponding values in data object properties should be valid according to these schemas.

`properties` keyword does not require that the properties mentioned in it are present in the object

Schema:
```typescript
interface Schema {
  properties: { [propertyName: string]: Schema }
}
```
State:
```json5
{
  message: {
    keyword: 'properties',
    description: 'Should have valid properties',
    bindings: { invalidProperties: ['foo', 'bar'] }
  }
}
```

#### `additionalProperties`
The value of the keyword should be either a boolean or a JSON Schema.

If the value is true the keyword is ignored.

If the value is false the data object to be valid should not have "additional properties" (i.e. properties other than those used in "properties" keyword).

If the value is a schema for the data object to be valid the values in all "additional properties" should be valid according to this schema.

Schema:
```typescript
interface Schema {
  additionalProperties: boolean | Schema
}
```
State:
```json5
{
  message: {
    keyword: 'properties',
    description: 'Should have valid properties',
    bindings: { invalidProperties: ['foo', 'bar'] }
  }
}
```

## Compound keywords

#### `not`
The value of the keyword should be a JSON Schema. The data is valid if it is invalid according to this schema.The value of the keyword should be a JSON Schema. The data is valid if it is invalid according to this schema.

Schema:
```typescript
interface Schema {
  not: Schema
}
```
State:
```json5
{
  message: {
    keyword: 'not',
    description: 'Should not be valid'
  }
}
```

#### `oneOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it matches exactly one JSON Schema from this array. Validators have to validate data against all schemas to establish validity according to this keyword.

Schema:
```typescript
interface Schema {
  oneOf: Schema[]
}
```
State:
```json5
{
  message: {
    keyword: 'oneOf',
    description: 'Should match exactly one schema in oneOf'
  }
}
```

#### `anyOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it is valid according to one or more JSON Schemas in this array. Validators only need to validate data against schemas in order until the first schema matches (or until all schemas have been tried)

Schema:
```typescript
interface Schema {
  anyOf: Schema[]
}
```
State:
```json5
{
  message: {
    keyword: 'anyOf',
    description: 'Should match some schema in anyOf'
  }
}
```

#### `allOf`
The value of the keyword should be an array of JSON Schemas. The data is valid if it is valid according to all JSON Schemas in this array.

Schema:
```typescript
interface Schema {
  allOf: Schema[]
}
```
State:
```json5
{
  message: {
    keyword: 'allOf',
    description: 'Should match all schema in allOf'
  }
}
```

#### `if` / `then` / `else`
These keywords allow you to implement conditional validation. Their values should be valid JSON Schemas.

Schema:
```typescript
interface Schema {
  if: Schema
  then: Schema
  else: Schema
}
```

#### `applySchemas`
Apply several validation schemas, useful when a property has several validation scenarios (for example `if` / `then` / `else` clauses)

Schema:
```typescript
interface Schema {
  applySchemas: Schema[]
}
```

## Inline validation keywords

#### `validate`
Custom validation function receives current property ref and rule validation function being used for nested properties validation.
The validation function must return a validation result object. 

Schema:
```typescript
type RuleValidationResult = {
  valid?: boolean;  // is value valid? might be undefined
  message?: ValidationMessage;  // error or warning message
  [additionalMetadata: string]: any; // some additional state props
}

interface Schema {
  validate: (ref: Ref, validateRuleFn: ValidateRuleFn) => RuleValidationResult | Promise<RuleValidationResult>
}
```

#### `resolveSchema`
Custom function receives the current property ref and returns a validation schema applicable to this property.

Schema:
```typescript
interface Schema {
  resolveSchema: (ref: Ref) => Schema | Promise<Schema>
}
```

## Annotation keywords

#### `title`
Provides title of the property.

Schema:
```typescript
interface Schema {
  title: string
}
```
State:
```json5
{
  title: 'Password',
}
```

#### `description`
Provides additional description of the property.

Schema:
```typescript
interface Schema {
  description: string
}
```
State:
```json5
{
  description: 'Type at least 6 characters',
}
```

#### `readOnly` / `writeOnly`
Marks property as read only or write only.

Schema:
```typescript
interface Schema {
  readOnly: boolean
  writeOnly: boolean
}
```
State:
```json5
{
  readOnly: true,
  writeOnly: true
}
```

#### `dependencies`
The value of the keyword should be an array of paths to dependant properties.
When a certain property is validated with a `dependencies` keyword it enforces validator to validate listed properties either.

> Note that the path to the property could be absolute and relative. Also, validating properties listed in `dependencies` keyword don't mark them as validated.

Schema:
```typescript
interface Schema {
  dependencies: string[]
}
```

#### `error` / `errors`
These keywords are used to customize default error message descriptions if they are provided.
The provided value will be used as the description of the error message instead of the default descriptions.
`error` is used to customize any error message and takes precedence over `warnings` keyword, which is used
to customize an error message of a particular keyword. 

Schema:
```typescript
interface Schema {
  error: any
  errors: { [keyword: string]: any }
}
```

#### `warning` / `warnings`
These keywords are used to customize default warning message descriptions if they are provided.
The provided value will be used as the description of the warning message instead of the default descriptions.
`warning` is used to customize any warning message and takes precedence over `warnings` keyword, which is used
to customize a warning message of a particular keyword. 

Schema:
```typescript
interface Schema {
  warning: any
  warnings: { [keyword: string]: any }
}
```

## Data mutation keywords

#### `default`
If property is undefined, provides default value for it

Schema:
```typescript
interface Schema {
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
interface Schema {
  coerceTypes: boolean // default false
}
```

#### `filter`
The value of the keyword should be a function receiving a data value and returning filtered (normalized) value.

Schema:
```typescript
interface Schema {
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
interface Schema {
  removeAdditional: boolean // default false
}
```

## License
**RxJV** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rjv/blob/master/LICENSE
