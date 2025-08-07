# Form Fields Schema

Support for kintone Form Fields API to manage field configurations with type safety.

## Getting Field Configurations

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

## Field Configuration Types

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

## Field Configuration Updates and Deployment

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

## Field Configuration Code Generation

Convert kintone field configurations to TypeScript code for version control and configuration management.

### Basic Usage

```typescript
import { fieldConfigToTypeScriptCode } from 'kintone-effect-schema';

// Field configuration from kintone API
const fieldConfig = {
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: 'Company Name',
  required: true,
  unique: true,
  maxLength: '100',
  defaultValue: ''
};

// Generate TypeScript code
const tsCode = fieldConfigToTypeScriptCode(fieldConfig);
console.log(tsCode);

// Output:
// export const companyNameField: SingleLineTextFieldProperties = {
//   type: 'SINGLE_LINE_TEXT',
//   code: 'company_name',
//   label: 'Company Name',
//   required: true,
//   unique: true,
//   maxLength: '100',
//   defaultValue: ''
// };
```

### Converting Multiple Fields

```typescript
import { fieldsConfigToTypeScriptCode } from 'kintone-effect-schema';

// Get field configurations from kintone
const formFields = await client.app.getFormFields({ app: 1 });

// Generate TypeScript code for all fields
const tsCode = fieldsConfigToTypeScriptCode(formFields.properties);
console.log(tsCode);

// Output:
// import type {
//   SingleLineTextFieldProperties,
//   NumberFieldProperties,
//   SubtableFieldProperties
// } from 'kintone-effect-schema';
//
// export const companyNameField: SingleLineTextFieldProperties = {
//   type: 'SINGLE_LINE_TEXT',
//   code: 'company_name',
//   label: 'Company Name',
//   required: true,
//   unique: true,
//   maxLength: '100',
//   defaultValue: ''
// };
//
// export const revenueField: NumberFieldProperties = {
//   type: 'NUMBER',
//   code: 'revenue',
//   label: 'Annual Revenue',
//   required: false,
//   defaultValue: '0',
//   unit: 'USD',
//   unitPosition: 'BEFORE',
//   digit: true
// };
//
// export const productsField: SubtableFieldProperties = {
//   type: 'SUBTABLE',
//   code: 'products',
//   fields: {
//     product_name: {
//       type: 'SINGLE_LINE_TEXT',
//       code: 'product_name',
//       label: 'Product Name',
//       required: true
//     },
//     quantity: {
//       type: 'NUMBER',
//       code: 'quantity',
//       label: 'Quantity',
//       defaultValue: '1'
//     }
//   }
// };
//
// export const appFieldsConfig = {
//   properties: {
//     company_name: companyNameField,
//     revenue: revenueField,
//     products: productsField
//   }
// };
```

### Workflow Example: kintone ↔ TypeScript

1. **Export from kintone**
   ```typescript
   // Get current field configurations
   const formFields = await client.app.getFormFields({ app: 1 });
   
   // Generate TypeScript code
   const tsCode = fieldsConfigToTypeScriptCode(formFields.properties);
   
   // Save to file
   await fs.writeFile('src/config/app-fields.ts', tsCode);
   ```

2. **Edit in TypeScript**
   ```typescript
   // src/config/app-fields.ts
   export const companyNameField: SingleLineTextFieldProperties = {
     type: 'SINGLE_LINE_TEXT',
     code: 'company_name',
     label: 'Company Name', // Edit label
     required: true,
     unique: true,
     maxLength: '200', // Increase max length
     defaultValue: 'New Company' // Change default value
   };
   ```

3. **Apply back to kintone**
   ```typescript
   import { appFieldsConfig } from './config/app-fields';
   
   // Update field configurations
   await client.app.updateFormFields({
     app: 1,
     properties: appFieldsConfig.properties
   });
   
   // Deploy changes
   await client.app.deployApp({
     apps: [{ app: 1 }]
   });
   ```

### Benefits

- **Version Control**: Track field configuration changes in Git
- **Code Review**: Review configuration changes before applying
- **Environment Management**: Manage configurations across dev/staging/production
- **Type Safety**: Full TypeScript type checking and autocompletion
- **Documentation**: Field configurations serve as documentation