import { Schema } from 'effect'
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
  KintoneFieldSchema,
} from './schemas/fields.js'
import {
  SubtableFieldSchema,
  KintoneRecordSchema,
  GetRecordResponseSchema,
  GetRecordsResponseSchema,
  KintoneRecordForWriteSchema,
} from './schemas/record.js'

// 型定義のエクスポート
export type {
  KintoneFieldType,
  KintoneUser,
  KintoneOrganization,
  KintoneGroup,
  KintoneFile,
} from './types/kintone.js'

// 共通スキーマのエクスポート
export {
  KintoneUserSchema,
  KintoneOrganizationSchema,
  KintoneGroupSchema,
  KintoneFileSchema,
} from './schemas/common.js'

// フィールドスキーマのエクスポート
export {
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
  KintoneFieldSchema,
} from './schemas/fields.js'

// レコードスキーマのエクスポート
export {
  SubtableFieldSchema,
  KintoneRecordSchema,
  GetRecordResponseSchema,
  GetRecordsResponseSchema,
  KintoneRecordForWriteSchema,
} from './schemas/record.js'

// デコーダーのエクスポート
export {
  normalizeFieldValue,
  decodeKintoneField,
  decodeKintoneRecord,
} from './decoders.js'


// バリデーターのエクスポート
export {
  KintoneValidationError,
  validateFieldForWrite,
  validateRecordForWrite,
  isNonEmptyField,
  getEmptyValueForWrite,
} from './validators.js'

// Schemaのre-export（便利のため）
export { Schema } from 'effect'

// スキーマから推論される型定義
export type SingleLineTextField = Schema.Schema.Type<typeof SingleLineTextFieldSchema>
export type MultiLineTextField = Schema.Schema.Type<typeof MultiLineTextFieldSchema>
export type RichTextField = Schema.Schema.Type<typeof RichTextFieldSchema>
export type NumberField = Schema.Schema.Type<typeof NumberFieldSchema>
export type CalcField = Schema.Schema.Type<typeof CalcFieldSchema>
export type RadioButtonField = Schema.Schema.Type<typeof RadioButtonFieldSchema>
export type CheckBoxField = Schema.Schema.Type<typeof CheckBoxFieldSchema>
export type MultiSelectField = Schema.Schema.Type<typeof MultiSelectFieldSchema>
export type DropDownField = Schema.Schema.Type<typeof DropDownFieldSchema>
export type DateField = Schema.Schema.Type<typeof DateFieldSchema>
export type TimeField = Schema.Schema.Type<typeof TimeFieldSchema>
export type DateTimeField = Schema.Schema.Type<typeof DateTimeFieldSchema>
export type LinkField = Schema.Schema.Type<typeof LinkFieldSchema>
export type UserSelectField = Schema.Schema.Type<typeof UserSelectFieldSchema>
export type OrganizationSelectField = Schema.Schema.Type<typeof OrganizationSelectFieldSchema>
export type GroupSelectField = Schema.Schema.Type<typeof GroupSelectFieldSchema>
export type FileField = Schema.Schema.Type<typeof FileFieldSchema>
export type RecordNumberField = Schema.Schema.Type<typeof RecordNumberFieldSchema>
export type CreatorField = Schema.Schema.Type<typeof CreatorFieldSchema>
export type CreatedTimeField = Schema.Schema.Type<typeof CreatedTimeFieldSchema>
export type ModifierField = Schema.Schema.Type<typeof ModifierFieldSchema>
export type UpdatedTimeField = Schema.Schema.Type<typeof UpdatedTimeFieldSchema>
export type StatusField = Schema.Schema.Type<typeof StatusFieldSchema>
export type StatusAssigneeField = Schema.Schema.Type<typeof StatusAssigneeFieldSchema>
export type CategoryField = Schema.Schema.Type<typeof CategoryFieldSchema>
export type LookupField = Schema.Schema.Type<typeof LookupFieldSchema>
export type RecordIdField = Schema.Schema.Type<typeof RecordIdFieldSchema>
export type RevisionField = Schema.Schema.Type<typeof RevisionFieldSchema>
export type SubtableField = Schema.Schema.Type<typeof SubtableFieldSchema>

// Union型
export type KintoneField = Schema.Schema.Type<typeof KintoneFieldSchema>

// レコード型
export type KintoneRecord = Schema.Schema.Type<typeof KintoneRecordSchema>
export type GetRecordResponse = Schema.Schema.Type<typeof GetRecordResponseSchema>
export type GetRecordsResponse = Schema.Schema.Type<typeof GetRecordsResponseSchema>
export type KintoneRecordForWrite = Schema.Schema.Type<typeof KintoneRecordForWriteSchema>

// 便利な型エイリアス
export type KintoneRecordData = Record<string, KintoneField | SubtableField>
export type KintoneRecordWriteData = Record<string, { value: unknown }>

// フォームフィールド設定スキーマのエクスポート
export * from './schemas/form/index.js'

// フィールド設定からTypeScriptコードへの変換関数
export { 
  fieldConfigToTypeScriptCode,
  fieldsConfigToTypeScriptCode 
} from './utils/field-config-to-typescript-code.js'