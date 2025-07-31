import { describe, it, expect } from 'vitest'
import { Schema } from 'effect'
import {
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  CheckBoxFieldPropertiesSchema,
  RadioButtonFieldPropertiesSchema,
  DateFieldPropertiesSchema,
  UserSelectFieldPropertiesSchema,
  SubtableFieldPropertiesSchema,
  GetFormFieldsResponseSchema,
  KintoneFieldPropertiesSchema,
} from '../../../src/schemas/form/fields.js'

describe('Kintone Form Field Properties Schemas', () => {
  describe('SingleLineTextFieldPropertiesSchema', () => {
    it('should parse valid single line text field properties', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        code: 'text_field_1',
        label: 'テキストフィールド',
        noLabel: false,
        required: true,
        unique: true,
        maxLength: '64',
        minLength: '0',
        defaultValue: 'デフォルト値',
        expression: '',
        hideExpression: false,
      }
      
      const result = Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with optional properties omitted', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        code: 'text_field_2',
        label: 'シンプルテキスト',
      }
      
      const result = Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should reject invalid field code (reserved word)', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        code: 'ステータス', // Reserved word
        label: 'Invalid Field',
      }
      
      expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).toThrow()
    })

    it('should reject field code starting with number', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        code: '123field', // Starts with number
        label: 'Invalid Field',
      }
      
      expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).toThrow()
    })
  })

  describe('NumberFieldPropertiesSchema', () => {
    it('should parse valid number field properties', () => {
      const input = {
        type: 'NUMBER',
        code: '数値フィールド',
        label: '金額',
        noLabel: false,
        required: false,
        unique: false,
        maxValue: '1000000',
        minValue: '0',
        defaultValue: '10000',
        digit: true,
        displayScale: '2',
        unit: '円',
        unitPosition: 'AFTER',
      }
      
      const result = Schema.decodeUnknownSync(NumberFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with unit position BEFORE', () => {
      const input = {
        type: 'NUMBER',
        code: 'price_usd',
        label: 'Price',
        unit: '$',
        unitPosition: 'BEFORE',
      }
      
      const result = Schema.decodeUnknownSync(NumberFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('RadioButtonFieldPropertiesSchema', () => {
    it('should parse valid radio button field properties', () => {
      const input = {
        type: 'RADIO_BUTTON',
        code: 'radio_field',
        label: '選択肢',
        required: true,
        defaultValue: 'option2',
        options: {
          option1: {
            label: 'オプション1',
            index: '0',
          },
          option2: {
            label: 'オプション2',
            index: '1',
          },
          option3: {
            label: 'オプション3',
            index: '2',
          },
        },
        align: 'HORIZONTAL',
      }
      
      const result = Schema.decodeUnknownSync(RadioButtonFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with VERTICAL alignment', () => {
      const input = {
        type: 'RADIO_BUTTON',
        code: 'vertical_radio',
        label: '縦並び選択',
        options: {
          opt1: { label: 'Option 1', index: 0 },
        },
        align: 'VERTICAL',
      }
      
      const result = Schema.decodeUnknownSync(RadioButtonFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('CheckBoxFieldPropertiesSchema', () => {
    it('should parse valid checkbox field properties', () => {
      const input = {
        type: 'CHECK_BOX',
        code: 'checkbox_field',
        label: '複数選択',
        defaultValue: ['opt1', 'opt3'],
        options: {
          opt1: { label: 'オプション1', index: '0' },
          opt2: { label: 'オプション2', index: '1' },
          opt3: { label: 'オプション3', index: '2' },
        },
        align: 'HORIZONTAL',
      }
      
      const result = Schema.decodeUnknownSync(CheckBoxFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('DateFieldPropertiesSchema', () => {
    it('should parse valid date field properties', () => {
      const input = {
        type: 'DATE',
        code: 'date_field',
        label: '日付',
        required: true,
        unique: false,
        defaultValue: '2024-01-01',
        defaultNowValue: false,
      }
      
      const result = Schema.decodeUnknownSync(DateFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with defaultNowValue true', () => {
      const input = {
        type: 'DATE',
        code: 'today_date',
        label: '今日の日付',
        defaultNowValue: true,
      }
      
      const result = Schema.decodeUnknownSync(DateFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('UserSelectFieldPropertiesSchema', () => {
    it('should parse valid user select field properties', () => {
      const input = {
        type: 'USER_SELECT',
        code: 'assignee',
        label: '担当者',
        required: true,
        entities: [
          { type: 'USER', code: 'user1' },
          { type: 'GROUP', code: 'group1' },
          { type: 'ORGANIZATION', code: 'org1' },
        ],
        defaultValue: [
          { type: 'USER', code: 'default_user' },
        ],
      }
      
      const result = Schema.decodeUnknownSync(UserSelectFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('SubtableFieldPropertiesSchema', () => {
    it('should parse valid subtable field properties', () => {
      const input = {
        type: 'SUBTABLE',
        code: 'table1',
        fields: {
          text_in_table: {
            type: 'SINGLE_LINE_TEXT',
            code: 'text_in_table',
            label: 'テーブル内テキスト',
            required: true,
          },
          number_in_table: {
            type: 'NUMBER',
            code: 'number_in_table',
            label: 'テーブル内数値',
            defaultValue: '0',
          },
        },
      }
      
      const result = Schema.decodeUnknownSync(SubtableFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('GetFormFieldsResponseSchema', () => {
    it('should parse complete form fields response', () => {
      const input = {
        properties: {
          text_field: {
            type: 'SINGLE_LINE_TEXT',
            code: 'text_field',
            label: 'テキスト',
            required: true,
          },
          number_field: {
            type: 'NUMBER',
            code: 'number_field',
            label: '数値',
            unit: '円',
            unitPosition: 'AFTER',
          },
          table_field: {
            type: 'SUBTABLE',
            code: 'table_field',
            fields: {
              sub_text: {
                type: 'SINGLE_LINE_TEXT',
                code: 'sub_text',
                label: 'サブテキスト',
              },
            },
          },
        },
        revision: '5',
      }
      
      const result = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse response without revision', () => {
      const input = {
        properties: {
          field1: {
            type: 'DATE',
            code: 'field1',
            label: '日付フィールド',
          },
        },
      }
      
      const result = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('Field code validation', () => {
    it('should accept valid Japanese characters', () => {
      const validCodes = [
        'ひらがな',
        'カタカナ',
        '漢字フィールド',
        'ｶﾀｶﾅ半角',
        '混合_field_123',
        'アンダースコア_使用',
        '全角＿アンダースコア',
        '中黒･使用',
        '全角・中黒',
        '通貨＄記号',
        '円￥記号',
      ]

      validCodes.forEach((code) => {
        const input = {
          type: 'SINGLE_LINE_TEXT',
          code,
          label: 'Test',
        }
        expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).not.toThrow()
      })
    })

    it('should reject invalid characters', () => {
      const invalidCodes = [
        'field-with-hyphen', // Hyphen not allowed
        'field space', // Space not allowed
        'field@email', // @ not allowed
        'field#hash', // # not allowed
      ]

      invalidCodes.forEach((code) => {
        const input = {
          type: 'SINGLE_LINE_TEXT',
          code,
          label: 'Test',
        }
        expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).toThrow()
      })
    })

    it('should reject all reserved words', () => {
      const reservedWords = ['ステータス', '作業者', 'カテゴリー', '__ROOT__', 'not']

      reservedWords.forEach((code) => {
        const input = {
          type: 'SINGLE_LINE_TEXT',
          code,
          label: 'Test',
        }
        expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).toThrow()
      })
    })
  })
})