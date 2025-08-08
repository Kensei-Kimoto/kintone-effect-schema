import { Schema } from 'effect'
import type { KintoneFieldProperties } from '../schemas/form/fields.js'
import {
  SingleLineTextFieldPropertiesSchema,
  MultiLineTextFieldPropertiesSchema,
  RichTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  CalcFieldPropertiesSchema,
  RadioButtonFieldPropertiesSchema,
  CheckBoxFieldPropertiesSchema,
  MultiSelectFieldPropertiesSchema,
  DropDownFieldPropertiesSchema,
  DateFieldPropertiesSchema,
  TimeFieldPropertiesSchema,
  DateTimeFieldPropertiesSchema,
  LinkFieldPropertiesSchema,
  UserSelectFieldPropertiesSchema,
  OrganizationSelectFieldPropertiesSchema,
  GroupSelectFieldPropertiesSchema,
  FileFieldPropertiesSchema,
  ReferenceTableFieldPropertiesSchema,
  RecordNumberFieldPropertiesSchema,
  CreatorFieldPropertiesSchema,
  CreatedTimeFieldPropertiesSchema,
  ModifierFieldPropertiesSchema,
  UpdatedTimeFieldPropertiesSchema,
  StatusFieldPropertiesSchema,
  StatusAssigneeFieldPropertiesSchema,
  CategoryFieldPropertiesSchema,
  SubtableFieldPropertiesSchema,
  GroupFieldPropertiesSchema,
  RecordIdFieldPropertiesSchema,
  RevisionFieldPropertiesSchema,
  SystemIdFieldPropertiesSchema,
  SystemRevisionFieldPropertiesSchema,
  SpacerFieldPropertiesSchema,
  LabelFieldPropertiesSchema,
} from '../schemas/form/fields.js'

// Local type for SUBTABLE to make typing explicit
type SubtableFieldProperties = {
  type: 'SUBTABLE'
  code: string
  label: string
  fields: Record<string, unknown>
}

type AllFieldProperties = KintoneFieldProperties | SubtableFieldProperties

// Mapping from form field type to its corresponding PropertiesSchema constant
const FIELD_TYPE_TO_PROPERTIES_SCHEMA: Record<string, Schema.Schema<any>> = {
  SINGLE_LINE_TEXT: SingleLineTextFieldPropertiesSchema,
  MULTI_LINE_TEXT: MultiLineTextFieldPropertiesSchema,
  RICH_TEXT: RichTextFieldPropertiesSchema,
  NUMBER: NumberFieldPropertiesSchema,
  CALC: CalcFieldPropertiesSchema,
  RADIO_BUTTON: RadioButtonFieldPropertiesSchema,
  CHECK_BOX: CheckBoxFieldPropertiesSchema,
  MULTI_SELECT: MultiSelectFieldPropertiesSchema,
  DROP_DOWN: DropDownFieldPropertiesSchema,
  DATE: DateFieldPropertiesSchema,
  TIME: TimeFieldPropertiesSchema,
  DATETIME: DateTimeFieldPropertiesSchema,
  LINK: LinkFieldPropertiesSchema,
  USER_SELECT: UserSelectFieldPropertiesSchema,
  ORGANIZATION_SELECT: OrganizationSelectFieldPropertiesSchema,
  GROUP_SELECT: GroupSelectFieldPropertiesSchema,
  FILE: FileFieldPropertiesSchema,
  REFERENCE_TABLE: ReferenceTableFieldPropertiesSchema,
  RECORD_NUMBER: RecordNumberFieldPropertiesSchema,
  CREATOR: CreatorFieldPropertiesSchema,
  CREATED_TIME: CreatedTimeFieldPropertiesSchema,
  MODIFIER: ModifierFieldPropertiesSchema,
  UPDATED_TIME: UpdatedTimeFieldPropertiesSchema,
  STATUS: StatusFieldPropertiesSchema,
  STATUS_ASSIGNEE: StatusAssigneeFieldPropertiesSchema,
  CATEGORY: CategoryFieldPropertiesSchema,
  SUBTABLE: SubtableFieldPropertiesSchema,
  GROUP: GroupFieldPropertiesSchema,
  RECORD_ID: RecordIdFieldPropertiesSchema,
  REVISION: RevisionFieldPropertiesSchema,
  __ID__: SystemIdFieldPropertiesSchema,
  __REVISION__: SystemRevisionFieldPropertiesSchema,
  SPACER: SpacerFieldPropertiesSchema,
  LABEL: LabelFieldPropertiesSchema,
}

/**
 * Returns the Effect Schema for a single form field's properties
 */
export function toFormPropertiesSchema(
  field: AllFieldProperties
): Schema.Schema<any> | undefined {
  return FIELD_TYPE_TO_PROPERTIES_SCHEMA[field.type]
}

/**
 * Builds an Effect Schema that exactly matches the provided form properties object
 *
 * Example shape:
 * Schema.Struct({
 *   properties: Schema.Struct({
 *     [code]: <PropertiesSchema>,
 *     ...
 *   })
 * })
 */
export function buildFormSchemaFromJson(
  properties: Record<string, AllFieldProperties>
) {
  const propsSchemas: Record<string, Schema.Schema<any>> = {}

  for (const [code, field] of Object.entries(properties)) {
    const schema = toFormPropertiesSchema(field)
    if (schema) {
      propsSchemas[code] = schema
    }
  }

  return Schema.Struct({
    properties: Schema.Struct(propsSchemas),
  })
}

