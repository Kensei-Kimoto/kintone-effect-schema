# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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