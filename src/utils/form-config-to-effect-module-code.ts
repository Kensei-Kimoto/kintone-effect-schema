/**
 * Generate an Effect-TS module that contains:
 * - A concrete app form properties value (from Form API JSON)
 * - A matching Effect Schema built from PropertiesSchemas
 *
 * This gives a round-trip friendly file: humans edit the value, the schema validates it,
 * and the CLI can encode the value back to JSON to apply to kintone.
 */

import type { KintoneFieldProperties } from '../schemas/form/fields.js'

type SubtableFieldProperties = {
  type: 'SUBTABLE'
  code: string
  fields: Record<string, unknown>
}

type AllFieldProperties = KintoneFieldProperties | SubtableFieldProperties

export type FormModuleCodegenOptions = {
  importSource?: string
  valueVarName?: string // default: appForm
  schemaVarName?: string // default: appFormFieldsSchema
}

const FIELD_TYPE_TO_FORM_SCHEMA: Record<string, string> = {
  SINGLE_LINE_TEXT: 'SingleLineTextFieldPropertiesSchema',
  MULTI_LINE_TEXT: 'MultiLineTextFieldPropertiesSchema',
  RICH_TEXT: 'RichTextFieldPropertiesSchema',
  NUMBER: 'NumberFieldPropertiesSchema',
  CALC: 'CalcFieldPropertiesSchema',
  RADIO_BUTTON: 'RadioButtonFieldPropertiesSchema',
  CHECK_BOX: 'CheckBoxFieldPropertiesSchema',
  MULTI_SELECT: 'MultiSelectFieldPropertiesSchema',
  DROP_DOWN: 'DropDownFieldPropertiesSchema',
  DATE: 'DateFieldPropertiesSchema',
  TIME: 'TimeFieldPropertiesSchema',
  DATETIME: 'DateTimeFieldPropertiesSchema',
  LINK: 'LinkFieldPropertiesSchema',
  USER_SELECT: 'UserSelectFieldPropertiesSchema',
  ORGANIZATION_SELECT: 'OrganizationSelectFieldPropertiesSchema',
  GROUP_SELECT: 'GroupSelectFieldPropertiesSchema',
  FILE: 'FileFieldPropertiesSchema',
  REFERENCE_TABLE: 'ReferenceTableFieldPropertiesSchema',
  RECORD_NUMBER: 'RecordNumberFieldPropertiesSchema',
  CREATOR: 'CreatorFieldPropertiesSchema',
  CREATED_TIME: 'CreatedTimeFieldPropertiesSchema',
  MODIFIER: 'ModifierFieldPropertiesSchema',
  UPDATED_TIME: 'UpdatedTimeFieldPropertiesSchema',
  STATUS: 'StatusFieldPropertiesSchema',
  STATUS_ASSIGNEE: 'StatusAssigneeFieldPropertiesSchema',
  CATEGORY: 'CategoryFieldPropertiesSchema',
  SUBTABLE: 'SubtableFieldPropertiesSchema',
  GROUP: 'GroupFieldPropertiesSchema',
  RECORD_ID: 'RecordIdFieldPropertiesSchema',
  REVISION: 'RevisionFieldPropertiesSchema',
  __ID__: 'SystemIdFieldPropertiesSchema',
  __REVISION__: 'SystemRevisionFieldPropertiesSchema',
  SPACER: 'SpacerFieldPropertiesSchema',
  LABEL: 'LabelFieldPropertiesSchema',
}

function isReservedWord(word: string): boolean {
  const reserved = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'enum', 'implements', 'interface', 'let', 'package', 'private', 'protected',
    'public', 'static', 'await', 'abstract', 'boolean', 'byte', 'char', 'double',
    'final', 'float', 'goto', 'int', 'long', 'native', 'short', 'synchronized',
    'throws', 'transient', 'volatile'
  ])
  return reserved.has(word)
}

function valueToCode(value: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent)
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => valueToCode(v, indent + 1))
    if (items.every((i) => i.length < 40) && items.join(', ').length < 60) {
      return `[${items.join(', ')}]`
    }
    return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return '{}'
    const props = entries.map(([key, val]) => {
      const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) || isReservedWord(key)
      const keyStr = needsQuotes ? JSON.stringify(key) : key
      const valStr = valueToCode(val, indent + 1)
      return `${spaces}  ${keyStr}: ${valStr}`
    })
    return `{\n${props.join(',\n')}\n${spaces}}`
  }
  return JSON.stringify(value)
}

export function formConfigToEffectModuleCode(
  properties: Record<string, AllFieldProperties>,
  options?: FormModuleCodegenOptions
): string {
  const entries = Object.entries(properties)
  if (entries.length === 0) {
    return `import { Schema } from '${options?.importSource ?? 'kintone-effect-schema'}';\n\nexport const ${options?.valueVarName ?? 'appForm'} = { properties: {} as const };\nexport const ${options?.schemaVarName ?? 'appFormFieldsSchema'} = Schema.Struct({ properties: Schema.Struct({}) });`
  }

  const importSet = new Set<string>(['Schema'])
  const fieldSchemasForStruct: string[] = []
  const sortedCodes = entries.map(([code]) => code).sort()

  for (const code of sortedCodes) {
    const field = properties[code] as AllFieldProperties
    const schemaConst = FIELD_TYPE_TO_FORM_SCHEMA[field.type as string]
    if (schemaConst) importSet.add(schemaConst)
    const needsQuotes = code.startsWith('$') || !/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(code) || isReservedWord(code)
    const key = needsQuotes ? JSON.stringify(code) : code
    fieldSchemasForStruct.push(`    ${key}: ${schemaConst}`)
  }

  const importSource = options?.importSource ?? 'kintone-effect-schema'
  const imports = `import {\n  ${Array.from(importSet).sort((a, b) => (a === 'Schema' ? -1 : b === 'Schema' ? 1 : a.localeCompare(b))).join(',\n  ')}\n} from '${importSource}';`

  const valueVarName = options?.valueVarName ?? 'appForm'
  const schemaVarName = options?.schemaVarName ?? 'appFormFieldsSchema'

  const valueCode = `export const ${valueVarName} = ${valueToCode({ properties }, 0)} as const;`
  const schemaCode = `export const ${schemaVarName} = Schema.Struct({\n  properties: Schema.Struct({\n${fieldSchemasForStruct.join(',\n')}\n  })\n});`

  return [imports, '', valueCode, '', schemaCode].join('\n')
}
