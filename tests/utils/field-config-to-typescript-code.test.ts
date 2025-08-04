import { describe, it, expect } from 'vitest'
import { 
  fieldConfigToTypeScriptCode,
  fieldsConfigToTypeScriptCode
} from '../../src/utils/field-config-to-typescript-code.js'
import type { SingleLineTextFieldProperties, NumberFieldProperties, SubtableFieldProperties } from '../../src/schemas/form/fields.js'

describe('field-config-to-typescript-code', () => {
  describe('fieldConfigToTypeScriptCode', () => {
    it('should generate code for a simple text field', () => {
      const fieldConfig: SingleLineTextFieldProperties = {
        type: 'SINGLE_LINE_TEXT',
        code: 'company_name',
        label: '会社名',
        required: true,
        unique: true,
        maxLength: '100',
        defaultValue: ''
      }
      
      const result = fieldConfigToTypeScriptCode(fieldConfig)
      expect(result).toContain('export const company_nameField: SingleLineTextFieldProperties =')
      expect(result).toContain('type: "SINGLE_LINE_TEXT"')
      expect(result).toContain('code: "company_name"')
      expect(result).toContain('label: "会社名"')
      expect(result).toContain('required: true')
    })

    it('should handle Japanese field codes', () => {
      const fieldConfig: SingleLineTextFieldProperties = {
        type: 'SINGLE_LINE_TEXT',
        code: '会社名',
        label: '会社名',
        required: true
      }
      
      const result = fieldConfigToTypeScriptCode(fieldConfig)
      expect(result).toContain('export const 会社名Field: SingleLineTextFieldProperties')
      expect(result).toContain('code: "会社名"')
    })

    it('should handle field codes with special characters', () => {
      const fieldConfig: SingleLineTextFieldProperties = {
        type: 'SINGLE_LINE_TEXT',
        code: 'field-name_123',
        label: 'Field Name',
        required: false
      }
      
      const result = fieldConfigToTypeScriptCode(fieldConfig)
      expect(result).toContain('export const field_name_123Field: SingleLineTextFieldProperties')
      expect(result).toContain('code: "field-name_123"')
    })

    it('should skip undefined values in the output', () => {
      const fieldConfig: SingleLineTextFieldProperties = {
        type: 'SINGLE_LINE_TEXT',
        code: 'test_field',
        label: 'Test Field',
        required: false,
        unique: undefined,
        defaultValue: undefined
      }
      
      const result = fieldConfigToTypeScriptCode(fieldConfig)
      expect(result).not.toContain('unique')
      expect(result).not.toContain('defaultValue')
    })

    it('should properly escape string values', () => {
      const fieldConfig: SingleLineTextFieldProperties = {
        type: 'SINGLE_LINE_TEXT',
        code: 'test_field',
        label: 'Test "Field" with \'quotes\'',
        defaultValue: 'Line 1\nLine 2\tTabbed'
      }
      
      const result = fieldConfigToTypeScriptCode(fieldConfig)
      expect(result).toContain('label: "Test \\"Field\\" with \'quotes\'"')
      expect(result).toContain('defaultValue: "Line 1\\nLine 2\\tTabbed"')
    })
  })

  describe('fieldsConfigToTypeScriptCode', () => {
    it('should generate code for multiple fields', () => {
      const fieldsConfig = {
        company_name: {
          type: 'SINGLE_LINE_TEXT',
          code: 'company_name',
          label: '会社名',
          required: true,
          unique: true,
          maxLength: '100',
          defaultValue: ''
        } as SingleLineTextFieldProperties,
        revenue: {
          type: 'NUMBER',
          code: 'revenue',
          label: '年間売上高',
          required: false,
          defaultValue: '0',
          unit: '円',
          unitPosition: 'AFTER',
          digit: true
        } as NumberFieldProperties
      }
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      
      // Check imports
      expect(result).toContain('import type {')
      expect(result).toContain('SingleLineTextFieldProperties')
      expect(result).toContain('NumberFieldProperties')
      expect(result).toContain('} from \'kintone-effect-schema\';')
      
      // Check field definitions
      expect(result).toContain('export const company_nameField: SingleLineTextFieldProperties =')
      expect(result).toContain('export const revenueField: NumberFieldProperties =')
      
      // Check app config
      expect(result).toContain('export const appFieldsConfig = {')
      expect(result).toContain('properties: {')
      expect(result).toContain('company_name: company_nameField')
      expect(result).toContain('revenue: revenueField')
    })

    it('should handle fields with Japanese codes', () => {
      const fieldsConfig = {
        '会社名': {
          type: 'SINGLE_LINE_TEXT',
          code: '会社名',
          label: '会社名',
          required: true
        } as SingleLineTextFieldProperties,
        '売上高': {
          type: 'NUMBER',
          code: '売上高',
          label: '売上高',
          required: false
        } as NumberFieldProperties
      }
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      
      // Check field names are preserved
      expect(result).toContain('export const 会社名Field: SingleLineTextFieldProperties')
      expect(result).toContain('export const 売上高Field: NumberFieldProperties')
      
      // Check app config uses quoted keys
      expect(result).toContain('"会社名": 会社名Field')
      expect(result).toContain('"売上高": 売上高Field')
    })

    it('should handle subtable fields', () => {
      const fieldsConfig = {
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
            }
          }
        } as SubtableFieldProperties
      }
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      
      // Check imports
      expect(result).toContain('SubtableFieldProperties')
      
      // Check subtable structure
      expect(result).toContain('type: "SUBTABLE"')
      expect(result).toContain('fields: {')
      expect(result).toContain('product_name: {')
      expect(result).toContain('quantity: {')
    })

    it('should handle complex subtable with multiple field types', () => {
      const fieldsConfig = {
        orderItems: {
          type: 'SUBTABLE',
          code: 'orderItems',
          fields: {
            '商品コード': {
              type: 'SINGLE_LINE_TEXT',
              code: '商品コード',
              label: '商品コード',
              required: true
            },
            '単価': {
              type: 'NUMBER',
              code: '単価',
              label: '単価',
              defaultValue: '0',
              unit: '円',
              unitPosition: 'AFTER'
            },
            '数量': {
              type: 'NUMBER',
              code: '数量',
              label: '数量',
              defaultValue: '1'
            },
            '割引率': {
              type: 'DROP_DOWN',
              code: '割引率',
              label: '割引率',
              options: {
                '0%': { label: '0%' },
                '10%': { label: '10%' },
                '20%': { label: '20%' }
              }
            }
          }
        } as SubtableFieldProperties
      }
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      
      // Check imports for all field types
      expect(result).toContain('SubtableFieldProperties')
      expect(result).toContain('SingleLineTextFieldProperties')
      expect(result).toContain('NumberFieldProperties')
      expect(result).toContain('DropDownFieldProperties')
      
      // Check Japanese field codes are preserved
      expect(result).toContain('"商品コード": {')
      expect(result).toContain('"単価": {')
      expect(result).toContain('"数量": {')
      expect(result).toContain('"割引率": {')
      
      // Check nested field properties
      expect(result).toContain('unit: "円"')
      expect(result).toContain('unitPosition: "AFTER"')
      expect(result).toContain('options: {')
    })

    it('should handle empty fields config', () => {
      const fieldsConfig = {}
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      expect(result).toBe('// No fields to generate')
    })

    it('should handle reserved words as field codes', () => {
      const fieldsConfig = {
        'class': {
          type: 'SINGLE_LINE_TEXT',
          code: 'class',
          label: 'Class',
          required: false
        } as SingleLineTextFieldProperties
      }
      
      const result = fieldsConfigToTypeScriptCode(fieldsConfig)
      
      // Should use quoted key in app config
      expect(result).toContain('"class": classField')
    })
  })
})