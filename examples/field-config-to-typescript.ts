/**
 * Example: Convert kintone field configurations to TypeScript code
 */

import { 
  fieldConfigToTypeScriptCode,
  fieldsConfigToTypeScriptCode
} from '../src/utils/field-config-to-typescript-code.js'

// Example 1: Convert a single field configuration
console.log('=== Example 1: Single Field ===')
const singleField = {
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: '会社名',
  required: true,
  unique: true,
  maxLength: '100',
  defaultValue: ''
}

const singleFieldCode = fieldConfigToTypeScriptCode(singleField)
console.log(singleFieldCode)
console.log('')

// Example 2: Convert field with Japanese code
console.log('=== Example 2: Japanese Field Code ===')
const japaneseField = {
  type: 'NUMBER',
  code: '売上高',
  label: '年間売上高（円）',
  required: false,
  unit: '円',
  unitPosition: 'AFTER' as const,
  digit: true
}

const japaneseFieldCode = fieldConfigToTypeScriptCode(japaneseField)
console.log(japaneseFieldCode)
console.log('')

// Example 3: Convert multiple fields
console.log('=== Example 3: Multiple Fields ===')
const multipleFields = {
  company_name: {
    type: 'SINGLE_LINE_TEXT',
    code: 'company_name',
    label: '会社名',
    required: true,
    unique: true,
    maxLength: '100',
    defaultValue: ''
  },
  '売上高': {
    type: 'NUMBER',
    code: '売上高',
    label: '年間売上高',
    required: false,
    defaultValue: '0',
    unit: '円',
    unitPosition: 'AFTER' as const,
    digit: true
  },
  products: {
    type: 'SUBTABLE',
    code: 'products',
    fields: {
      product_name: {
        type: 'SINGLE_LINE_TEXT',
        code: 'product_name',
        label: '商品名',
        required: true
      },
      quantity: {
        type: 'NUMBER',
        code: 'quantity',
        label: '数量',
        defaultValue: '1'
      },
      price: {
        type: 'NUMBER',
        code: 'price',
        label: '単価',
        defaultValue: '0',
        unit: '円',
        unitPosition: 'AFTER' as const
      }
    }
  },
  status: {
    type: 'STATUS',
    code: 'status',
    label: 'ステータス',
    enabled: true
  }
}

const multipleFieldsCode = fieldsConfigToTypeScriptCode(multipleFields as any)
console.log(multipleFieldsCode)
console.log('')

// Example 4: Special characters and escaping
console.log('=== Example 4: Special Characters ===')
const specialField = {
  type: 'SINGLE_LINE_TEXT',
  code: 'special-field_123',
  label: 'Field with "quotes" and \'apostrophes\'',
  defaultValue: 'Line 1\nLine 2\tTabbed'
}

const specialFieldCode = fieldConfigToTypeScriptCode(specialField)
console.log(specialFieldCode)