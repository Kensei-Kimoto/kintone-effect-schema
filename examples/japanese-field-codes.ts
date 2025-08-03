/**
 * Example: Japanese field codes are preserved as-is in variable names
 */

import { fieldsConfigToTypeScriptCode } from '../src/utils/field-config-to-typescript-code.js'

// Example with various Japanese field codes
const japaneseFields = {
  会社名: {
    type: 'SINGLE_LINE_TEXT',
    code: '会社名',
    label: '会社名',
    required: true,
    maxLength: '100'
  },
  売上高: {
    type: 'NUMBER',
    code: '売上高',
    label: '年間売上高',
    unit: '円',
    unitPosition: 'AFTER' as const
  },
  取引先リスト: {
    type: 'SUBTABLE',
    code: '取引先リスト',
    fields: {
      取引先名: {
        type: 'SINGLE_LINE_TEXT',
        code: '取引先名',
        label: '取引先名',
        required: true
      },
      取引金額: {
        type: 'NUMBER',
        code: '取引金額',
        label: '取引金額',
        unit: '円',
        unitPosition: 'AFTER' as const
      }
    }
  },
  備考欄: {
    type: 'MULTI_LINE_TEXT',
    code: '備考欄',
    label: '備考'
  }
}

const generatedCode = fieldsConfigToTypeScriptCode(japaneseFields as any)
console.log(generatedCode)

console.log('\n=== Usage Example ===')
console.log(`
// The generated code can be used directly:
import { appFieldsConfig } from './generated-fields.js'

// Access fields with Japanese names
const companyNameField = appFieldsConfig.properties.会社名
const revenueField = appFieldsConfig.properties.売上高
const partnersField = appFieldsConfig.properties.取引先リスト

// These are valid TypeScript/JavaScript identifiers!
console.log(会社名Field.label) // "会社名"
console.log(売上高Field.unit)  // "円"
`)