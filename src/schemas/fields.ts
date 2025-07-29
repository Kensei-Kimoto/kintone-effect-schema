import { Schema } from 'effect'
import { KintoneUserSchema, KintoneOrganizationSchema, KintoneGroupSchema, KintoneFileSchema } from './common.js'

// 基本的なフィールドスキーマの定義
export const SingleLineTextFieldSchema = Schema.Struct({
  type: Schema.Literal('SINGLE_LINE_TEXT'),
  value: Schema.String,
})

export const MultiLineTextFieldSchema = Schema.Struct({
  type: Schema.Literal('MULTI_LINE_TEXT'),
  value: Schema.String,
})

export const RichTextFieldSchema = Schema.Struct({
  type: Schema.Literal('RICH_TEXT'),
  value: Schema.String,
})

export const NumberFieldSchema = Schema.Struct({
  type: Schema.Literal('NUMBER'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const CalcFieldSchema = Schema.Struct({
  type: Schema.Literal('CALC'),
  value: Schema.String,
})

export const RadioButtonFieldSchema = Schema.Struct({
  type: Schema.Literal('RADIO_BUTTON'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const CheckBoxFieldSchema = Schema.Struct({
  type: Schema.Literal('CHECK_BOX'),
  value: Schema.Array(Schema.String),
})

export const MultiSelectFieldSchema = Schema.Struct({
  type: Schema.Literal('MULTI_SELECT'),
  value: Schema.Array(Schema.String),
})

export const DropDownFieldSchema = Schema.Struct({
  type: Schema.Literal('DROP_DOWN'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const DateFieldSchema = Schema.Struct({
  type: Schema.Literal('DATE'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const TimeFieldSchema = Schema.Struct({
  type: Schema.Literal('TIME'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const DateTimeFieldSchema = Schema.Struct({
  type: Schema.Literal('DATETIME'),
  value: Schema.Union(Schema.String, Schema.Null),
})

export const LinkFieldSchema = Schema.Struct({
  type: Schema.Literal('LINK'),
  value: Schema.String,
})

export const UserSelectFieldSchema = Schema.Struct({
  type: Schema.Literal('USER_SELECT'),
  value: Schema.Array(KintoneUserSchema),
})

export const OrganizationSelectFieldSchema = Schema.Struct({
  type: Schema.Literal('ORGANIZATION_SELECT'),
  value: Schema.Array(KintoneOrganizationSchema),
})

export const GroupSelectFieldSchema = Schema.Struct({
  type: Schema.Literal('GROUP_SELECT'),
  value: Schema.Array(KintoneGroupSchema),
})

export const FileFieldSchema = Schema.Struct({
  type: Schema.Literal('FILE'),
  value: Schema.Array(KintoneFileSchema),
})

export const RecordNumberFieldSchema = Schema.Struct({
  type: Schema.Literal('RECORD_NUMBER'),
  value: Schema.String,
})

export const CreatorFieldSchema = Schema.Struct({
  type: Schema.Literal('CREATOR'),
  value: KintoneUserSchema,
})

export const CreatedTimeFieldSchema = Schema.Struct({
  type: Schema.Literal('CREATED_TIME'),
  value: Schema.String,
})

export const ModifierFieldSchema = Schema.Struct({
  type: Schema.Literal('MODIFIER'),
  value: KintoneUserSchema,
})

export const UpdatedTimeFieldSchema = Schema.Struct({
  type: Schema.Literal('UPDATED_TIME'),
  value: Schema.String,
})

export const StatusFieldSchema = Schema.Struct({
  type: Schema.Literal('STATUS'),
  value: Schema.String,
})

export const StatusAssigneeFieldSchema = Schema.Struct({
  type: Schema.Literal('STATUS_ASSIGNEE'),
  value: Schema.Array(KintoneUserSchema),
})

export const CategoryFieldSchema = Schema.Struct({
  type: Schema.Literal('CATEGORY'),
  value: Schema.Array(Schema.String),
})

export const LookupFieldSchema = Schema.Struct({
  type: Schema.Literal('LOOKUP'),
  value: Schema.String,
})

export const RecordIdFieldSchema = Schema.Struct({
  type: Schema.Literal('RECORD_ID'),
  value: Schema.String,
})

export const RevisionFieldSchema = Schema.Struct({
  type: Schema.Literal('REVISION'),
  value: Schema.String,
})

// 全フィールドタイプのUnion
export const KintoneFieldSchema = Schema.Union(
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
)