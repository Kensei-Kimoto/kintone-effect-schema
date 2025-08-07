import { Schema } from 'effect';
import {
  RecordIdFieldPropertiesSchema,
  RevisionFieldPropertiesSchema,
  type RecordIdFieldProperties,
  type RevisionFieldProperties,
} from '../src/schemas/form/fields.js';
import { fieldsConfigToTypeScriptCode } from '../src/utils/field-config-to-typescript-code.js';

// Example: System fields with $ prefix
const systemFields = {
  $id: {
    type: 'RECORD_ID',
    code: '$id',
    label: 'レコードID'
  } as RecordIdFieldProperties,
  
  $revision: {
    type: 'REVISION',
    code: '$revision',
    label: 'リビジョン'
  } as RevisionFieldProperties
};

// Validate system field properties
try {
  const idField = Schema.decodeUnknownSync(RecordIdFieldPropertiesSchema)(systemFields.$id);
  console.log('Valid $id field:', idField);
  
  const revisionField = Schema.decodeUnknownSync(RevisionFieldPropertiesSchema)(systemFields.$revision);
  console.log('Valid $revision field:', revisionField);
} catch (error) {
  console.error('Validation error:', error);
}

// Generate TypeScript code for an app with system fields
const appFieldsConfig = {
  $id: {
    type: 'RECORD_ID',
    code: '$id',
    label: 'Record ID'
  } as RecordIdFieldProperties,
  
  $revision: {
    type: 'REVISION',
    code: '$revision',
    label: 'Revision'
  } as RevisionFieldProperties,
  
  title: {
    type: 'SINGLE_LINE_TEXT',
    code: 'title',
    label: 'Title',
    required: true
  },
  
  created_time: {
    type: 'CREATED_TIME',
    code: 'created_time',
    label: 'Created Time'
  }
};

// Generate TypeScript code
const generatedCode = fieldsConfigToTypeScriptCode(appFieldsConfig);
console.log('\n=== Generated TypeScript Code ===\n');
console.log(generatedCode);

// The generated code will properly handle system fields:
// - $id and $revision will be quoted in the app config object
// - Variable names will be $idField and $revisionField (valid TypeScript identifiers)