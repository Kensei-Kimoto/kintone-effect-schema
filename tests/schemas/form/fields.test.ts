import { describe, it, expect } from 'vitest'
import { Schema } from 'effect'
import {
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  CheckBoxFieldPropertiesSchema,
  RadioButtonFieldPropertiesSchema,
  DateFieldPropertiesSchema,
  DateTimeFieldPropertiesSchema,
  UserSelectFieldPropertiesSchema,
  SubtableFieldPropertiesSchema,
  GetFormFieldsResponseSchema,
  KintoneFieldPropertiesSchema,
  SpacerFieldPropertiesSchema,
  LabelFieldPropertiesSchema,
  SystemIdFieldPropertiesSchema,
  SystemRevisionFieldPropertiesSchema,
  StatusFieldPropertiesSchema,
  StatusAssigneeFieldPropertiesSchema,
  CategoryFieldPropertiesSchema,
  RecordNumberFieldPropertiesSchema,
  CreatorFieldPropertiesSchema,
  CreatedTimeFieldPropertiesSchema,
  ModifierFieldPropertiesSchema,
  UpdatedTimeFieldPropertiesSchema,
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
          opt1: { label: 'Option 1', index: '0' },
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

    it('should parse response with system fields', () => {
      const input = {
        properties: {
          'レコード番号': {
            type: 'RECORD_NUMBER',
            code: 'レコード番号',
            label: 'レコード番号',
          },
          'ステータス': {
            type: 'STATUS',
            code: 'ステータス',
            label: 'ステータス',
            enabled: true,
          },
          '作業者': {
            type: 'STATUS_ASSIGNEE',
            code: '作業者',
            label: '作業者',
            enabled: true,
          },
          '作成者': {
            type: 'CREATOR',
            code: '作成者',
            label: '作成者',
          },
          '作成日時': {
            type: 'CREATED_TIME',
            code: '作成日時',
            label: '作成日時',
          },
          '更新者': {
            type: 'MODIFIER',
            code: '更新者',
            label: '更新者',
          },
          '更新日時': {
            type: 'UPDATED_TIME',
            code: '更新日時',
            label: '更新日時',
          },
          'カテゴリー': {
            type: 'CATEGORY',
            code: 'カテゴリー',
            label: 'カテゴリー',
            enabled: true,
          },
          custom_field: {
            type: 'SINGLE_LINE_TEXT',
            code: 'custom_field',
            label: 'カスタムフィールド',
          },
        },
        revision: '10',
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

    it('should accept system fields with $ prefix', () => {
      const systemFieldCodes = [
        '$id',
        '$revision',
        '$custom_system_field',
      ]

      systemFieldCodes.forEach((code) => {
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

    it('should reject all reserved words for user fields', () => {
      const reservedWords = [
        'ステータス',
        '作業者',
        'カテゴリー',
        '__ROOT__',
        'not',
        'レコード番号',
        '作成者',
        '作成日時',
        '更新者',
        '更新日時',
      ]

      reservedWords.forEach((code) => {
        const input = {
          type: 'SINGLE_LINE_TEXT',
          code,
          label: 'Test',
        }
        expect(() => Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)).toThrow()
      })
    })

    it('should accept reserved words for system fields', () => {
      const systemFields = [
        { type: 'STATUS', code: 'ステータス' },
        { type: 'STATUS_ASSIGNEE', code: '作業者' },
        { type: 'CATEGORY', code: 'カテゴリー' },
        { type: 'RECORD_NUMBER', code: 'レコード番号' },
        { type: 'CREATOR', code: '作成者' },
        { type: 'CREATED_TIME', code: '作成日時' },
        { type: 'MODIFIER', code: '更新者' },
        { type: 'UPDATED_TIME', code: '更新日時' },
      ]

      systemFields.forEach(({ type, code }) => {
        const schemas = {
          STATUS: StatusFieldPropertiesSchema,
          STATUS_ASSIGNEE: StatusAssigneeFieldPropertiesSchema,
          CATEGORY: CategoryFieldPropertiesSchema,
          RECORD_NUMBER: RecordNumberFieldPropertiesSchema,
          CREATOR: CreatorFieldPropertiesSchema,
          CREATED_TIME: CreatedTimeFieldPropertiesSchema,
          MODIFIER: ModifierFieldPropertiesSchema,
          UPDATED_TIME: UpdatedTimeFieldPropertiesSchema,
        }
        
        const schema = schemas[type]
        const input = {
          type,
          code,
          label: 'Test',
        }
        expect(() => Schema.decodeUnknownSync(schema)(input)).not.toThrow()
      })
    })
  })

  describe('SpacerFieldPropertiesSchema', () => {
    it('should parse valid spacer field properties', () => {
      const input = {
        type: 'SPACER',
        elementId: 'spacer_1',
        size: {
          width: 200,
          height: 50,
        },
      }
      
      const result = Schema.decodeUnknownSync(SpacerFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with string size values', () => {
      const input = {
        type: 'SPACER',
        elementId: 'spacer_2',
        size: {
          width: '100%',
          height: '2em',
        },
      }
      
      const result = Schema.decodeUnknownSync(SpacerFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse without height', () => {
      const input = {
        type: 'SPACER',
        elementId: 'spacer_3',
        size: {
          width: 300,
        },
      }
      
      const result = Schema.decodeUnknownSync(SpacerFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should be included in KintoneFieldPropertiesSchema union', () => {
      const input = {
        type: 'SPACER',
        elementId: 'spacer_test',
        size: {
          width: 100,
        },
      }
      
      const result = Schema.decodeUnknownSync(KintoneFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('LabelFieldPropertiesSchema', () => {
    it('should parse valid label field properties', () => {
      const input = {
        type: 'LABEL',
        label: 'セクションタイトル',
        size: {
          width: 500,
        },
      }
      
      const result = Schema.decodeUnknownSync(LabelFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse with string width value', () => {
      const input = {
        type: 'LABEL',
        label: '説明文',
        size: {
          width: '80%',
        },
      }
      
      const result = Schema.decodeUnknownSync(LabelFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should be included in KintoneFieldPropertiesSchema union', () => {
      const input = {
        type: 'LABEL',
        label: 'ラベルテスト',
        size: {
          width: 200,
        },
      }
      
      const result = Schema.decodeUnknownSync(KintoneFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('SystemIdFieldPropertiesSchema', () => {
    it('should parse valid __ID__ field properties', () => {
      const input = {
        type: '__ID__',
        code: '$id',
        label: 'レコードID',
      }
      
      const result = Schema.decodeUnknownSync(SystemIdFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should only accept $id as field code', () => {
      const input = {
        type: '__ID__',
        code: 'other_code', // Should be rejected
        label: 'レコードID',
      }
      
      expect(() => Schema.decodeUnknownSync(SystemIdFieldPropertiesSchema)(input)).toThrow()
    })

    it('should be included in KintoneFieldPropertiesSchema union', () => {
      const input = {
        type: '__ID__',
        code: '$id',
        label: 'ID',
      }
      
      const result = Schema.decodeUnknownSync(KintoneFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('SystemRevisionFieldPropertiesSchema', () => {
    it('should parse valid __REVISION__ field properties', () => {
      const input = {
        type: '__REVISION__',
        code: '$revision',
        label: 'リビジョン',
      }
      
      const result = Schema.decodeUnknownSync(SystemRevisionFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should only accept $revision as field code', () => {
      const input = {
        type: '__REVISION__',
        code: 'other_code', // Should be rejected
        label: 'リビジョン',
      }
      
      expect(() => Schema.decodeUnknownSync(SystemRevisionFieldPropertiesSchema)(input)).toThrow()
    })

    it('should be included in KintoneFieldPropertiesSchema union', () => {
      const input = {
        type: '__REVISION__',
        code: '$revision',
        label: 'Revision',
      }
      
      const result = Schema.decodeUnknownSync(KintoneFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('Lookup functionality', () => {
    it('should parse SINGLE_LINE_TEXT field with lookup configuration', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        code: 'company_name',
        label: '会社名',
        lookup: {
          relatedApp: {
            app: '123',
            code: 'company_master'
          },
          relatedKeyField: 'name',
          fieldMappings: [
            {
              field: 'address',
              relatedField: 'company_address'
            }
          ],
          lookupPickerFields: ['name', 'address'],
          filterCond: 'active = "true"',
          sort: 'name asc'
        }
      }
      
      const result = Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse field with lookup settings having empty strings', () => {
      const input = {
        type: 'NUMBER',
        code: 'amount',
        label: '金額',
        lookup: {
          relatedApp: {
            app: '456'
          },
          relatedKeyField: 'amount',
          fieldMappings: '',
          lookupPickerFields: '',
          filterCond: '',
          sort: ''
        }
      }
      
      const result = Schema.decodeUnknownSync(NumberFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse DATE field with lookup configuration', () => {
      const input = {
        type: 'DATE',
        code: 'start_date',
        label: '開始日',
        lookup: {
          relatedApp: {
            app: '789'
          },
          relatedKeyField: 'project_start'
        }
      }
      
      const result = Schema.decodeUnknownSync(DateFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse DATETIME field with lookup configuration', () => {
      const input = {
        type: 'DATETIME',
        code: 'created_at',
        label: '作成日時',
        lookup: {
          relatedApp: {
            app: '999'
          },
          relatedKeyField: 'timestamp'
        }
      }
      
      const result = Schema.decodeUnknownSync(DateTimeFieldPropertiesSchema)(input)
      expect(result).toEqual(input)
    })
  })
})