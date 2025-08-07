# API Reference

## Schemas

### Field Value Schemas

Schema definitions for each field type:

- `SingleLineTextFieldSchema`, `NumberFieldSchema`, `DateFieldSchema`, etc.
- `KintoneFieldSchema` - Union of all field types
- `KintoneRecordSchema` - Schema for entire record

### Form Field Configuration Schemas

- `SingleLineTextFieldPropertiesSchema`, `NumberFieldPropertiesSchema`, etc. - Configuration schemas for each field type
- `SubtableFieldPropertiesSchema` - Subtable field configuration schema
- `GetFormFieldsResponseSchema` - Form Fields API response schema
- `KintoneFieldPropertiesSchema` - Union of all field configuration types

## Type Definitions

TypeScript types inferred from schemas:

### Field Value Types

```typescript
import type { 
  SingleLineTextField, 
  NumberField,
  KintoneField,
  KintoneRecord 
} from 'kintone-effect-schema';

// Individual field types
type TextField = SingleLineTextField; // { type: 'SINGLE_LINE_TEXT', value: string }
type NumField = NumberField; // { type: 'NUMBER', value: string | null }

// Union type
type AnyField = KintoneField; // Union of all field types
```

### Field Configuration Types

```typescript
import type {
  SingleLineTextFieldProperties,
  NumberFieldProperties,
  SubtableFieldProperties,
  GetFormFieldsResponse,
  KintoneFieldProperties
} from 'kintone-effect-schema';

// Individual field configuration types
type TextFieldProps = SingleLineTextFieldProperties;
type NumberFieldProps = NumberFieldProperties;

// API response type
type FormFields = GetFormFieldsResponse;
```

## Decoder Functions

### `decodeKintoneField(field)`

Normalize and decode a single field.

```typescript
import { decodeKintoneField } from 'kintone-effect-schema';

const field = { type: 'SINGLE_LINE_TEXT', value: undefined };
const normalized = decodeKintoneField(field);
// Result: { type: 'SINGLE_LINE_TEXT', value: '' }
```

### `decodeKintoneRecord(record)`

Normalize entire record.

```typescript
import { decodeKintoneRecord } from 'kintone-effect-schema';

const record = {
  title: { type: 'SINGLE_LINE_TEXT', value: undefined },
  price: { type: 'NUMBER', value: '' }
};
const normalized = decodeKintoneRecord(record);
// Result: {
//   title: { type: 'SINGLE_LINE_TEXT', value: '' },
//   price: { type: 'NUMBER', value: null }
// }
```

### `normalizeFieldValue(field)`

Normalize field value only.

```typescript
import { normalizeFieldValue } from 'kintone-effect-schema';

const field = { type: 'NUMBER', value: '' };
const normalized = normalizeFieldValue(field);
// Result: { type: 'NUMBER', value: null }
```

## Validation Functions

### `validateFieldForWrite(field)`

Validate field before writing.

```typescript
import { validateFieldForWrite } from 'kintone-effect-schema';

const field = { type: 'RADIO_BUTTON', value: null };
validateFieldForWrite(field); // Throws KintoneValidationError
```

### `validateRecordForWrite(record)`

Validate entire record before writing.

```typescript
import { validateRecordForWrite } from 'kintone-effect-schema';

const record = {
  status: { type: 'RADIO_BUTTON', value: null },
  title: { type: 'SINGLE_LINE_TEXT', value: '' }
};
validateRecordForWrite(record); // Throws error for radio button
```

### `isNonEmptyField(type)`

Check if field type allows empty values.

```typescript
import { isNonEmptyField } from 'kintone-effect-schema';

isNonEmptyField('RADIO_BUTTON'); // true
isNonEmptyField('SINGLE_LINE_TEXT'); // false
```

### `getEmptyValueForWrite(type)`

Get appropriate empty value for field type.

```typescript
import { getEmptyValueForWrite } from 'kintone-effect-schema';

getEmptyValueForWrite('SINGLE_LINE_TEXT'); // ''
getEmptyValueForWrite('NUMBER'); // null
getEmptyValueForWrite('CHECK_BOX'); // []
```

## Error Classes

### `KintoneValidationError`

Validation error with fieldType and message.

```typescript
import { KintoneValidationError } from 'kintone-effect-schema';

try {
  validateFieldForWrite({ type: 'RADIO_BUTTON', value: null });
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.log(error.fieldType); // 'RADIO_BUTTON'
    console.log(error.message); // 'RADIO_BUTTON field cannot have empty value'
  }
}
```

## Code Generation Functions

### `fieldConfigToTypeScriptCode(fieldConfig, fieldCode?)`

Convert a single field configuration to TypeScript code.

```typescript
import { fieldConfigToTypeScriptCode } from 'kintone-effect-schema';

const fieldConfig = {
  type: 'SINGLE_LINE_TEXT',
  code: 'title',
  label: 'Title',
  required: true
};

const code = fieldConfigToTypeScriptCode(fieldConfig);
// Result: export const titleField: SingleLineTextFieldProperties = { ... };
```

### `fieldsConfigToTypeScriptCode(fieldsConfig)`

Convert multiple field configurations to TypeScript code.

```typescript
import { fieldsConfigToTypeScriptCode } from 'kintone-effect-schema';

const fieldsConfig = {
  title: { type: 'SINGLE_LINE_TEXT', ... },
  price: { type: 'NUMBER', ... }
};

const code = fieldsConfigToTypeScriptCode(fieldsConfig);
// Result: Complete TypeScript code with imports and type definitions
```