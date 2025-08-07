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

## Documentation

- [Why Effect-TS Schema?](./docs/why-effect.md) - Benefits and comparisons
- [Supported Field Types](./docs/field-types.md) - All field types and normalization rules
- [Form Fields Schema](./docs/form-fields.md) - Managing field configurations
- [API Reference](./docs/api-reference.md) - Complete API documentation

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