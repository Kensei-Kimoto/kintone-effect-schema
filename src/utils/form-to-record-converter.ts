import { Schema } from 'effect';
import type {
  SubtableFieldProperties,
  KintoneFieldProperties,
} from '../schemas/form/fields.js';

import {
  SingleLineTextFieldSchema,
  MultiLineTextFieldSchema,
  RichTextFieldSchema,
  NumberFieldSchema,
  CalcFieldSchema,
  RadioButtonFieldSchema,
  CheckBoxFieldSchema,
  MultiSelectFieldSchema,
  DropDownFieldSchema,
  DateFieldSchema,
  TimeFieldSchema,
  DateTimeFieldSchema,
  LinkFieldSchema,
  UserSelectFieldSchema,
  OrganizationSelectFieldSchema,
  GroupSelectFieldSchema,
  FileFieldSchema,
  RecordNumberFieldSchema,
  CreatorFieldSchema,
  CreatedTimeFieldSchema,
  ModifierFieldSchema,
  UpdatedTimeFieldSchema,
  StatusFieldSchema,
  StatusAssigneeFieldSchema,
  CategoryFieldSchema,
  LookupFieldSchema,
  RecordIdFieldSchema,
  RevisionFieldSchema,
} from '../schemas/fields.js';

/**
 * Form field properties to record field schema converter
 * 
 * Converts form field configuration (from Form Fields API) to record field schema.
 * This is a pure function with no side effects.
 * 
 * @param formField - Form field properties from Form Fields API
 * @returns Record field schema or undefined for non-data fields
 * 
 * @example
 * ```typescript
 * const formField = {
 *   type: 'SINGLE_LINE_TEXT',
 *   code: 'title',
 *   label: 'Title',
 *   required: true,
 *   defaultValue: 'Default'
 * };
 * 
 * const recordSchema = convertFormFieldToRecordSchema(formField);
 * // Returns SingleLineTextFieldSchema
 * ```
 */
export function convertFormFieldToRecordSchema(
  formField: KintoneFieldProperties | SubtableFieldProperties
): Schema.Schema<any> | undefined {
  switch (formField.type) {
    // Text fields
    case 'SINGLE_LINE_TEXT':
      return SingleLineTextFieldSchema;
    
    case 'MULTI_LINE_TEXT':
      return MultiLineTextFieldSchema;
    
    case 'RICH_TEXT':
      return RichTextFieldSchema;
    
    // Number and calculation fields
    case 'NUMBER':
      return NumberFieldSchema;
    
    case 'CALC':
      return CalcFieldSchema;
    
    // Selection fields
    case 'RADIO_BUTTON':
      return RadioButtonFieldSchema;
    
    case 'CHECK_BOX':
      return CheckBoxFieldSchema;
    
    case 'MULTI_SELECT':
      return MultiSelectFieldSchema;
    
    case 'DROP_DOWN':
      return DropDownFieldSchema;
    
    // Date and time fields
    case 'DATE':
      return DateFieldSchema;
    
    case 'TIME':
      return TimeFieldSchema;
    
    case 'DATETIME':
      return DateTimeFieldSchema;
    
    // Link field
    case 'LINK':
      return LinkFieldSchema;
    
    // User/Organization/Group selection fields
    case 'USER_SELECT':
      return UserSelectFieldSchema;
    
    case 'ORGANIZATION_SELECT':
      return OrganizationSelectFieldSchema;
    
    case 'GROUP_SELECT':
      return GroupSelectFieldSchema;
    
    // File field
    case 'FILE':
      return FileFieldSchema;
    
    // Lookup field (treated as LOOKUP type in record)
    case 'LOOKUP':
      return LookupFieldSchema;
    
    // Reference table (not included in record data directly)
    case 'REFERENCE_TABLE':
      // Reference tables are not included in record data
      return undefined;
    
    // System fields
    case 'RECORD_NUMBER':
      return RecordNumberFieldSchema;
    
    case 'CREATOR':
      return CreatorFieldSchema;
    
    case 'CREATED_TIME':
      return CreatedTimeFieldSchema;
    
    case 'MODIFIER':
      return ModifierFieldSchema;
    
    case 'UPDATED_TIME':
      return UpdatedTimeFieldSchema;
    
    case 'STATUS':
      return StatusFieldSchema;
    
    case 'STATUS_ASSIGNEE':
      return StatusAssigneeFieldSchema;
    
    case 'CATEGORY':
      return CategoryFieldSchema;
    
    // Special ID fields
    case 'RECORD_ID':
      return RecordIdFieldSchema;
    
    case 'REVISION':
      return RevisionFieldSchema;
    
    // Subtable (special handling)
    case 'SUBTABLE':
      return convertSubtableFormToRecordSchema(formField as SubtableFieldProperties);
    
    // Layout fields (not included in record data)
    case 'GROUP':
      return undefined;
    
    default:
      // Unknown field type
      return undefined;
  }
}

/**
 * Convert subtable form field to record schema
 * 
 * @param subtableField - Subtable field properties from Form Fields API
 * @returns Subtable record schema
 */
function convertSubtableFormToRecordSchema(
  subtableField: SubtableFieldProperties
): Schema.Schema<any> {
  // Convert each field inside the subtable
  const convertedFields: Record<string, Schema.Schema<any>> = {};
  
  for (const [fieldCode, fieldProps] of Object.entries(subtableField.fields)) {
    const recordSchema = convertFormFieldToRecordSchema(fieldProps);
    if (recordSchema) {
      convertedFields[fieldCode] = recordSchema;
    }
  }
  
  // Return subtable schema with converted fields
  return Schema.Struct({
    type: Schema.Literal('SUBTABLE'),
    value: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        value: Schema.Record({
          key: Schema.String,
          value: Schema.Union(...Object.values(convertedFields))
        }),
      })
    ),
  });
}

/**
 * Convert entire form fields response to record schema
 * 
 * @param formFields - Form fields properties object (from GetFormFieldsResponse.properties)
 * @returns Record schema object with field codes as keys
 * 
 * @example
 * ```typescript
 * const formResponse = await client.app.getFormFields({ app: 1 });
 * const recordSchemas = convertFormFieldsToRecordSchema(formResponse.properties);
 * 
 * // Use the generated schemas for validation
 * const recordSchema = Schema.Struct(recordSchemas);
 * const validatedRecord = Schema.decodeUnknownSync(recordSchema)(apiRecord);
 * ```
 */
export function convertFormFieldsToRecordSchema(
  formFields: Record<string, KintoneFieldProperties | SubtableFieldProperties>
): Record<string, Schema.Schema<any>> {
  const recordSchemas: Record<string, Schema.Schema<any>> = {};
  
  for (const [fieldCode, fieldProps] of Object.entries(formFields)) {
    const recordSchema = convertFormFieldToRecordSchema(fieldProps);
    if (recordSchema) {
      recordSchemas[fieldCode] = recordSchema;
    }
  }
  
  return recordSchemas;
}

/**
 * Create a record schema from form fields with custom validation
 * 
 * @param formFields - Form fields properties object
 * @param customValidations - Optional custom validations for specific fields
 * @returns Combined record schema with custom validations
 * 
 * @example
 * ```typescript
 * const recordSchema = createRecordSchemaFromForm(
 *   formResponse.properties,
 *   {
 *     price: Schema.refine(
 *       (field) => field.value !== null && Number(field.value) > 0,
 *       { message: "Price must be positive" }
 *     )
 *   }
 * );
 * ```
 */
export function createRecordSchemaFromForm(
  formFields: Record<string, KintoneFieldProperties | SubtableFieldProperties>,
  customValidations?: Record<string, (schema: Schema.Schema<any>) => Schema.Schema<any>>
): Schema.Schema<any> {
  const recordSchemas = convertFormFieldsToRecordSchema(formFields);
  
  // Apply custom validations if provided
  if (customValidations) {
    for (const [fieldCode, validation] of Object.entries(customValidations)) {
      if (recordSchemas[fieldCode]) {
        recordSchemas[fieldCode] = validation(recordSchemas[fieldCode]);
      }
    }
  }
  
  return Schema.Record({
    key: Schema.String,
    value: Schema.Union(...Object.values(recordSchemas))
  });
}

/**
 * Get field type mapping from form to record
 * 
 * @param formFieldType - Form field type
 * @returns Corresponding record field type or undefined
 */
export function getRecordFieldType(formFieldType: string): string | undefined {
  switch (formFieldType) {
    // Most types are the same
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'NUMBER':
    case 'CALC':
    case 'RADIO_BUTTON':
    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'DROP_DOWN':
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'LINK':
    case 'USER_SELECT':
    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
    case 'FILE':
    case 'RECORD_NUMBER':
    case 'CREATOR':
    case 'CREATED_TIME':
    case 'MODIFIER':
    case 'UPDATED_TIME':
    case 'STATUS':
    case 'STATUS_ASSIGNEE':
    case 'CATEGORY':
    case 'SUBTABLE':
    case 'RECORD_ID':
    case 'REVISION':
      return formFieldType;
    
    // LOOKUP type exists in record schema
    case 'LOOKUP':
      return 'LOOKUP';
    
    // Layout fields don't exist in records
    case 'REFERENCE_TABLE':
    case 'GROUP':
      return undefined;
    
    default:
      return undefined;
  }
}