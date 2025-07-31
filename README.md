# kintone-effect-schema

Type-safe schema definitions for kintone fields using Effect-TS. Normalize empty values, validate writes, and ensure runtime type safety for kintone API responses. Also supports Form Fields API for type-safe app configuration management.

[日本語版 README はこちら](./README.ja.md)

## Features

- 🔒 **Type Safety** - Full TypeScript type inference
- 🔄 **Empty Value Normalization** - Handle differences between JavaScript API and REST API
- ✅ **Write Validation** - Automatic validation for fields that don't allow empty values
- 📦 **All Field Types** - Support for all kintone field types
- 🎯 **Effect-TS** - Powerful schema validation with Effect ecosystem
- ⚙️ **Form Fields API** - Type-safe field configuration management

## Why Effect-TS Schema?

### 🤔 The Problem with kintone Development

kintone field type definitions are complex:

```typescript
// Are these types guaranteed at runtime?
const record = await client.record.getRecord({ app: 1, id: 1 });
const title = record.record.title.value; // string? undefined? null?
const price = record.record.price.value; // string? number? "123.45"?
```

**Answer: No!** 😱

- TypeScript types only exist at **compile time**
- At runtime, they're just `any` (type information is erased)
- API response types cannot be trusted
- Breaking changes in kintone specifications

### 💪 What Effect-TS Schema Solves

#### 1. **Runtime Type Validation**

```typescript
import { Schema } from 'effect';
import { NumberFieldSchema } from 'kintone-effect-schema';

// Type checking at runtime!
const field = { type: 'NUMBER', value: '123.45' };
const validated = Schema.decodeUnknownSync(NumberFieldSchema)(field);
// ✅ Type is guaranteed! validated is definitely NumberField type
```

#### 2. **Detailed Error Information**

```typescript
try {
  const invalid = { type: 'NUMBER', value: { nested: 'object' } };
  Schema.decodeUnknownSync(NumberFieldSchema)(invalid);
} catch (error) {
  console.error(Schema.formatError(error));
  // Detailed error info:
  // └─ ["value"]
  //    └─ Expected string | null, actual {"nested":"object"}
}
```

#### 3. **Composable Schema Definitions**

```typescript
// Combine small schemas to create larger ones
const CustomRecordSchema = Schema.Struct({
  title: SingleLineTextFieldSchema,
  price: NumberFieldSchema,
  tags: CheckBoxFieldSchema,
  // Add custom validation
  total: Schema.Number.pipe(
    Schema.filter((n) => n >= 0, { message: 'Total must be non-negative' })
  ),
});
```

#### 4. **Type Inference**

```typescript
// Automatically generate TypeScript types from schemas
type CustomRecord = Schema.Schema.Type<typeof CustomRecordSchema>;
// No need to write type definitions manually!
```

## Installation

```bash
npm install kintone-effect-schema effect
```

### TypeScript Configuration

Effect-TS requires the following TypeScript settings:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true // Recommended for stricter type checking
  }
}
```

## Quick Start

### 1. Type Checking and Parsing Fields

```typescript
import { Schema } from 'effect';
import { 
  SingleLineTextFieldSchema, 
  NumberFieldSchema,
  type SingleLineTextField,
  type NumberField 
} from 'kintone-effect-schema';

// Parse text field
const textField = {
  type: 'SINGLE_LINE_TEXT',
  value: 'Hello, kintone!',
};
const parsedText: SingleLineTextField = Schema.decodeUnknownSync(SingleLineTextFieldSchema)(textField);
// parsedText.type is 'SINGLE_LINE_TEXT' literal type
// parsedText.value is string type

// Parse number field (allows null)
const numberField = {
  type: 'NUMBER',
  value: '1234.56', // or null
};
const parsedNumber: NumberField = Schema.decodeUnknownSync(NumberFieldSchema)(numberField);
// parsedNumber.value is string | null type
```

### 2. Empty Value Normalization (Important!)

kintone API handles empty values differently between retrieval and updates. This library normalizes them automatically.

```typescript
import { decodeKintoneField } from 'kintone-effect-schema';

// Data from JavaScript API (contains undefined)
const jsApiField = {
  type: 'SINGLE_LINE_TEXT',
  value: undefined, // JavaScript API returns undefined
};

// Automatically normalized
const normalized = decodeKintoneField(jsApiField);
console.log(normalized); // { type: 'SINGLE_LINE_TEXT', value: '' }

// Number field case
const numberField = {
  type: 'NUMBER',
  value: '', // Sometimes returns empty string
};
const normalizedNumber = decodeKintoneField(numberField);
console.log(normalizedNumber); // { type: 'NUMBER', value: null }
```

### 3. Processing Entire Records

```typescript
import { decodeKintoneRecord, KintoneRecordSchema } from 'kintone-effect-schema';

// Record from JavaScript API
const record = kintone.app.record.get();
const normalizedRecord = decodeKintoneRecord(record.record);

// Type-safe access
const title = normalizedRecord.title as { type: 'SINGLE_LINE_TEXT'; value: string };
console.log(title.value);
```

### 4. Write Validation

Some fields don't allow empty values. They are automatically checked.

```typescript
import { validateFieldForWrite, KintoneValidationError } from 'kintone-effect-schema';

// Radio buttons don't allow empty values
const radioField = {
  type: 'RADIO_BUTTON' as const,
  value: null,
};

try {
  validateFieldForWrite(radioField);
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.error(error.message);
    // => "RADIO_BUTTON field cannot have empty value"
  }
}

// Categories also don't allow empty arrays
const categoryField = {
  type: 'CATEGORY' as const,
  value: [],
};
// This will also throw an error
```

## Empty Value Normalization Rules

| Field Type | Empty Value on Retrieval | After Normalization | Used for Updates |
|------------|-------------------------|-------------------|------------------|
| Text (Single/Multi-line) | `undefined` | `""` | `""` |
| Link, Lookup | `undefined` | `""` | `""` |
| Number, DateTime | `undefined` or `""` | `null` | `null` |
| Date, Time | `undefined` | `null` | `null` |
| Dropdown | `undefined` or `""` | `null` | `null` |
| Radio Button | `undefined` or `""` | `null` | Cannot be empty |
| Array types (Checkbox, etc.) | `undefined` or `null` | `[]` | `[]` |
| Category, Status Assignee | `undefined` or `null` | `[]` | Cannot be empty |

## Real-World Examples

### Using with kintone Customization

```typescript
import { decodeKintoneRecord, validateRecordForWrite } from 'kintone-effect-schema';

kintone.events.on('app.record.create.submit', (event) => {
  const record = event.record;
  
  try {
    // Normalize empty values
    const normalizedRecord = decodeKintoneRecord(record);
    
    // Validate before writing
    validateRecordForWrite(normalizedRecord);
    
    // Return normalized record
    event.record = normalizedRecord;
    return event;
    
  } catch (error) {
    event.error = error.message;
    return event;
  }
});
```

### Working with REST API

```typescript
import { decodeKintoneField, getEmptyValueForWrite } from 'kintone-effect-schema';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

// Normalize records from API
const client = new KintoneRestAPIClient({
  baseUrl: 'https://example.cybozu.com',
  auth: { /* authentication */ }
});

const response = await client.record.getRecords({
  app: 1,
  fields: ['title', 'price', 'tags'],
  query: "title = 'test'",
  totalCount: false
});

// Normalize each record
const normalizedRecords = response.records.map((record) => {
  return decodeKintoneRecord(record);
});

// Type-safe access after normalization
normalizedRecords.forEach((record) => {
  console.log(record.title.value); // Always string (undefined normalized to '')
  console.log(record.price.value); // null or string
})

// Setting appropriate empty values for updates
const updateData = {
  title: { value: '' }, // Empty string for text
  price: { value: null }, // null for numbers
  tags: { value: [] }, // Empty array for arrays
};
```

## Supported Field Types

### Basic Fields
- `SINGLE_LINE_TEXT` - Single-line text
- `MULTI_LINE_TEXT` - Multi-line text
- `RICH_TEXT` - Rich text editor
- `NUMBER` - Number
- `CALC` - Calculation
- `RADIO_BUTTON` - Radio button
- `CHECK_BOX` - Checkbox
- `MULTI_SELECT` - Multi-select
- `DROP_DOWN` - Dropdown
- `DATE` - Date
- `TIME` - Time
- `DATETIME` - Date and time
- `LINK` - Link

### Special Fields
- `USER_SELECT` - User selection
- `ORGANIZATION_SELECT` - Organization selection
- `GROUP_SELECT` - Group selection
- `CATEGORY` - Category
- `STATUS` - Status
- `STATUS_ASSIGNEE` - Status assignee
- `FILE` - Attachment
- `LOOKUP` - Lookup
- `REFERENCE_TABLE` - Related records list

### System Fields
- `RECORD_NUMBER` - Record number
- `RECORD_ID` - Record ID ($id)
- `REVISION` - Revision ($revision)
- `CREATOR` - Creator
- `CREATED_TIME` - Created time
- `MODIFIER` - Modifier
- `UPDATED_TIME` - Updated time

### Layout Fields
- `SUBTABLE` - Table
- `GROUP` - Group

## Form Fields Schema (New Feature!)

Support for kintone Form Fields API to manage field configurations with type safety.

### Getting Field Configurations

```typescript
import { Schema } from 'effect';
import { GetFormFieldsResponseSchema, type GetFormFieldsResponse } from 'kintone-effect-schema';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

// Parse Form Fields API response
const client = new KintoneRestAPIClient({
  baseUrl: 'https://example.cybozu.com',
  auth: { /* authentication */ }
});

const apiResponse = await client.app.getFormFields({
  app: 1,
});
const formFields: GetFormFieldsResponse = Schema.decodeUnknownSync(
  GetFormFieldsResponseSchema
)(apiResponse);

// Type-safe access to field configurations
Object.entries(formFields.properties).forEach(([fieldCode, fieldProps]) => {
  console.log(`Field Code: ${fieldCode}`);
  console.log(`Field Type: ${fieldProps.type}`);
  console.log(`Label: ${fieldProps.label}`);
  
  // Type-specific processing
  switch (fieldProps.type) {
    case 'SINGLE_LINE_TEXT':
      console.log(`Max Length: ${fieldProps.maxLength}`);
      console.log(`Required: ${fieldProps.required}`);
      break;
    case 'NUMBER':
      console.log(`Unit: ${fieldProps.unit}`);
      console.log(`Unit Position: ${fieldProps.unitPosition}`);
      break;
    case 'SUBTABLE':
      // Fields inside subtable
      Object.entries(fieldProps.fields).forEach(([subCode, subField]) => {
        console.log(`  Sub-field: ${subCode} - ${subField.type}`);
      });
      break;
  }
});
```

### Field Configuration Types

Type definitions for each field configuration:

```typescript
import type {
  SingleLineTextFieldProperties,
  NumberFieldProperties,
  SubtableFieldProperties,
  // ... other field types
} from 'kintone-effect-schema';

// Type-safe field configuration creation
const textFieldProps: SingleLineTextFieldProperties = {
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: 'Company Name',
  required: true,
  unique: true,
  minLength: '1',
  maxLength: '100',
  defaultValue: '',
};
```

### Field Code Validation

kintone field codes have specific constraints that are automatically validated:

- Allowed characters: Hiragana, Katakana, Kanji, alphanumeric, underscore, middle dot, currency symbols
- Reserved words (`ステータス`, `作業者`, `カテゴリー`, `__ROOT__`, `not`) are not allowed
- Cannot start with a number

### Subtable Constraints

Only the following field types can be used inside subtables:

- Single-line text, Multi-line text, Rich text
- Number, Calculation
- Checkbox, Radio button, Dropdown, Multi-select
- Date, Time, DateTime
- Link

### Field Configuration Updates and Deployment

Example of type-safe field updates and deployment:

```typescript
import { Schema } from 'effect';
import { 
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  type SingleLineTextFieldProperties,
  type NumberFieldProperties 
} from 'kintone-effect-schema';

// 1. Add new fields
const newTextField: SingleLineTextFieldProperties = Schema.decodeUnknownSync(
  SingleLineTextFieldPropertiesSchema
)({
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: 'Company Name',
  required: true,
  unique: true,
  minLength: '1',
  maxLength: '100',
  defaultValue: ''
});

// 2. Update field configuration
await client.app.updateFormFields({
  app: 1,
  properties: {
    company_name: newTextField,
  }
});

// 3. Deploy the app
const { revision } = await client.app.deployApp({
  apps: [{ app: 1 }]
});

console.log(`App deployment started. Revision: ${revision}`);
```

## API Reference

### Schemas

#### Field Value Schemas
Schema definitions for each field type:
- `SingleLineTextFieldSchema`, `NumberFieldSchema`, `DateFieldSchema`, etc.
- `KintoneFieldSchema` - Union of all field types
- `KintoneRecordSchema` - Schema for entire record

#### Form Field Configuration Schemas
- `SingleLineTextFieldPropertiesSchema`, `NumberFieldPropertiesSchema`, etc. - Configuration schemas for each field type
- `SubtableFieldPropertiesSchema` - Subtable field configuration schema
- `GetFormFieldsResponseSchema` - Form Fields API response schema
- `KintoneFieldPropertiesSchema` - Union of all field configuration types

### Type Definitions

TypeScript types inferred from schemas:

#### Field Value Types
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

#### Field Configuration Types
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

### Decoder Functions

- `decodeKintoneField(field)` - Normalize and decode a single field
- `decodeKintoneRecord(record)` - Normalize entire record
- `normalizeFieldValue(field)` - Normalize field value only

### Validation Functions

- `validateFieldForWrite(field)` - Validate field before writing
- `validateRecordForWrite(record)` - Validate entire record before writing
- `isNonEmptyField(type)` - Check if field type allows empty values
- `getEmptyValueForWrite(type)` - Get appropriate empty value for field type

### Error Classes

- `KintoneValidationError` - Validation error with fieldType and message

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

## License

MIT

## Contributing

Issues and Pull Requests are welcome! Since kintone API specifications are complex, we appreciate bug reports and improvement suggestions.