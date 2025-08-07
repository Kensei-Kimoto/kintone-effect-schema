# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0](https://github.com/Kensei-Kimoto/kintone-effect-schema/compare/v0.6.0...v0.7.0) (2025-08-07)


### Features

* add form-to-record schema converter utility ([d13fdc8](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/d13fdc8be554d4c12b47ae32cc2e35f80efe94e8))


### Bug Fixes

* handle empty schema array in Schema.Union call ([fd372b8](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/fd372b82fe08b3ca5c47266fa083c9ac2a872bca))
* resolve ESLint errors in form-to-record converter ([eefc597](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/eefc59784aebf2f71b6b62851778b89a288451d8))
* resolve ESLint no-unnecessary-condition errors ([aa0bec8](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/aa0bec8c78f7aa6d619b0ae8cffd0bbf3484e978))
* resolve merge conflict with main branch ([c558aa9](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/c558aa9f524343023597fcff7541a4463cf868f6))
* resolve rollup native module error in CI ([55d39d4](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/55d39d42763a59f296116bea6b83adf52c506483))
* resolve type errors for subtable field conversion ([dbc06f9](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/dbc06f901c7c41f4387551e5b1c51765d5dd748e))
* resolve TypeScript type errors using type inference ([09c2e8d](https://github.com/Kensei-Kimoto/kintone-effect-schema/commit/09c2e8d052f965f0c63d504fb7ff5735dfe8b531))

## [0.2.2] - 2025-02-03

### Added
- Field configuration to TypeScript code generation utilities
  - `fieldConfigToTypeScriptCode` - Convert single field configuration to TypeScript code
  - `fieldsConfigToTypeScriptCode` - Convert multiple field configurations to TypeScript code
  - Support for Japanese field codes as valid TypeScript identifiers
  - Automatic handling of special characters in field codes
  - Proper escaping and formatting of generated code

### Changed
- Japanese field codes are now preserved as-is in generated variable names (e.g., `会社名Field`)
- Field codes with invalid JavaScript identifier characters are automatically sanitized

### Fixed
- Improved escaping of string values in generated TypeScript code
- Better handling of undefined/null values in field configurations
- Fixed lint errors and test failures

## [0.2.0] - 2025-01-31

### Added
- Form Fields API schema support
  - `GetFormFieldsResponseSchema` for parsing Form Fields API responses
  - Complete property schemas for all field types (`SingleLineTextFieldPropertiesSchema`, `NumberFieldPropertiesSchema`, etc.)
  - Field code validation with kintone-specific constraints
  - Subtable field type constraints
- TypeScript type exports for all schemas
  - Field property types (`SingleLineTextFieldProperties`, `NumberFieldProperties`, etc.)
  - `GetFormFieldsResponse` type for API responses
- Comprehensive test coverage for Form Fields API schemas
- Documentation and examples for Form Fields API usage

### Changed
- Subtable schema now enforces field type constraints (only allows specific field types inside subtables)

## [0.1.0] - 2025-01-29

### Added
- Initial release of kintone-effect-schema
- Complete schema definitions for all kintone field types (28+ types)
- Empty value normalization for JavaScript API and REST API differences
- Write validation for fields that don't allow empty values (RADIO_BUTTON, CATEGORY, STATUS_ASSIGNEE)
- Type-safe field and record schemas using Effect-TS
- Comprehensive test coverage
- Examples and documentation

### Features
- `decodeKintoneField` - Normalize and decode single fields
- `decodeKintoneRecord` - Normalize and decode entire records
- `validateFieldForWrite` - Validate fields before writing to kintone
- `validateRecordForWrite` - Validate entire records before writing
- Support for all kintone field types including:
  - Basic fields (text, number, date, etc.)
  - Selection fields (dropdown, checkbox, radio button, etc.)
  - User/Organization/Group selection fields
  - System fields (record number, creator, timestamps, etc.)
  - Special fields (subtable, lookup, category, status, etc.)
