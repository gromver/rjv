# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.1.0"></a>
# [4.1.0](https://github.com/gromver/rjv/compare/v4.0.0...v4.1.0) (2020-04-27)


### Features

* **Model:** add before/after validation events ([272d4ac](https://github.com/gromver/rjv/commit/272d4ac))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/gromver/rjv/compare/v3.1.1...v3.2.0) (2020-04-12)


### Features

* **Model:** add attributes getter ([6ab693d](https://github.com/gromver/rjv/commit/6ab693d))
* **Ref:** add message getter ([871ae58](https://github.com/gromver/rjv/commit/871ae58))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/gromver/rjv/compare/v3.1.0...v3.1.1) (2020-03-25)



<a name="3.1.0"></a>
# [3.1.0](https://github.com/gromver/rjv/compare/v3.0.5-alpha...v3.1.0) (2020-03-25)


### Bug Fixes

* default keyword - clone value before setting ([3bde716](https://github.com/gromver/rjv/commit/3bde716))
* fix allOf validation ([619b095](https://github.com/gromver/rjv/commit/619b095))
* fix model::validateRef(), support relative dependencies ([23d4b14](https://github.com/gromver/rjv/commit/23d4b14))
* set lib version in the .d.ts files ([e3956c8](https://github.com/gromver/rjv/commit/e3956c8))


### Features

* add "applySchemas" keyword ([5f7ebe1](https://github.com/gromver/rjv/commit/5f7ebe1))
* add Ref::refresh method ([c169fa9](https://github.com/gromver/rjv/commit/c169fa9))
* add Ref::resolvePath() helper ([f46a99d](https://github.com/gromver/rjv/commit/f46a99d))
* rename Storage => LodashStorage ([d665612](https://github.com/gromver/rjv/commit/d665612))



<a name="3.0.5"></a>
## [3.0.5](https://github.com/gromver/rjv/compare/v3.0.5-alpha...v3.0.5) (2020-02-17)


### Bug Fixes

* fix model::validateRef(), support relative dependencies ([23d4b14](https://github.com/gromver/rjv/commit/23d4b14))



<a name="2.6.0"></a>
# [2.6.0](https://github.com/gromver/rjv/compare/v2.5.2...v2.6.0) (2019-10-29)


### Features

* **presence:** now affects all types ([163e0da](https://github.com/gromver/rjv/commit/163e0da))



<a name="2.5.2"></a>
## [2.5.2](https://github.com/gromver/rjv/compare/v2.5.1...v2.5.2) (2019-08-05)


### Bug Fixes

* **errLock:** fixed errLock ([a0d4ccc](https://github.com/gromver/rjv/commit/a0d4ccc))



<a name="2.5.1"></a>
## [2.5.1](https://github.com/gromver/rjv/compare/v2.4.0...v2.5.1) (2019-08-05)


### Bug Fixes

* **Model:** fixed errLock, used only when error acquires ([498bb9b](https://github.com/gromver/rjv/commit/498bb9b))



<a name="2.5.0"></a>
# [2.5.0](https://github.com/gromver/rjv/compare/v2.3.1...v2.5.0) (2019-08-04)


### Features

* **Model:** make clearAttributeStates public ([de6e82e](https://github.com/gromver/rjv/commit/de6e82e))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/gromver/rjv/compare/v2.2.0...v2.4.0) (2019-06-10)


### Bug Fixes

* **package.json:** fix jest warnings ([1b0e970](https://github.com/gromver/rjv/commit/1b0e970))


### Features

* **coerceTypes:** add coerceTypes keyword ([fa5b62b](https://github.com/gromver/rjv/commit/fa5b62b))
* **Model:** make clearAttributeStates public ([de6e82e](https://github.com/gromver/rjv/commit/de6e82e))
* **removeAdditional:** add removeAdditional keyword ([4ea776e](https://github.com/gromver/rjv/commit/4ea776e))
* **State:** use more descriptive keywords in the validation states ([9ce5872](https://github.com/gromver/rjv/commit/9ce5872))
>>>>>>> 9d9a7ef0d972ba07a1c7b07728ea4deb3d46ff64



<a name="2.3.0"></a>
# [2.3.0](https://github.com/gromver/rjv/compare/v2.2.0...v2.3.0) (2019-06-07)


### Bug Fixes

* **package.json:** fix jest warnings ([1b0e970](https://github.com/gromver/rjv/commit/1b0e970))


### Features

* **coerceTypes:** add coerceTypes keyword ([fa5b62b](https://github.com/gromver/rjv/commit/fa5b62b))
* **removeAdditional:** add removeAdditional keyword ([4ea776e](https://github.com/gromver/rjv/commit/4ea776e))
* **State:** use more descriptive keywords in the validation states ([9ce5872](https://github.com/gromver/rjv/commit/9ce5872))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/gromver/rjv/compare/v2.1.1...v2.2.0) (2019-05-24)


### Features

* **Model:** add `dispatch` param => setRefValue(value, dispatch) ([61ca334](https://github.com/gromver/rjv/commit/61ca334))



<a name="2.1.1"></a>
## [2.1.1](https://github.com/gromver/rjv/compare/v2.1.0...v2.1.1) (2019-05-13)


### Bug Fixes

* **Model:** fixed dispatchChangeValue() behavior ([4f5970a](https://github.com/gromver/rjv/commit/4f5970a))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/gromver/rjv/compare/v1.0.2...v2.1.0) (2019-05-07)


### Bug Fixes

* **Model:** fixed state's metadata loss when attribute value changes ([c5d8cb8](https://github.com/gromver/rjv/commit/c5d8cb8))


### Features

* rename state type PENDING => VALIDATING ([d44e8c2](https://github.com/gromver/rjv/commit/d44e8c2))
* use only async flow ([aefb0a2](https://github.com/gromver/rjv/commit/aefb0a2))



# Change Log
