import { Schema } from 'effect';
import {
  GetFormFieldsResponseSchema,
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  SubtableFieldPropertiesSchema,
  type GetFormFieldsResponse,
  type SingleLineTextFieldProperties,
} from '../src/schemas/form/fields.js';

// フォームフィールド取得APIのレスポンスをパース
async function parseFormFieldsResponse(response: unknown) {
  try {
    const parsed = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(response);
    console.log('フォームフィールド情報:', parsed);
    
    // 型安全にアクセス
    Object.entries(parsed.properties).forEach(([fieldCode, fieldProps]) => {
      console.log(`フィールドコード: ${fieldCode}`);
      console.log(`フィールドタイプ: ${fieldProps.type}`);
      
      if (fieldProps.type === 'SUBTABLE') {
        console.log('サブテーブル内のフィールド:');
        Object.entries(fieldProps.fields).forEach(([subFieldCode, subFieldProps]) => {
          console.log(`  - ${subFieldCode}: ${subFieldProps.type}`);
        });
      }
    });
    
    return parsed;
  } catch (error) {
    console.error('パースエラー:', error);
    throw error;
  }
}

// 新しいフィールドプロパティの作成
function createSingleLineTextField(): SingleLineTextFieldProperties {
  const fieldProps = {
    type: 'SINGLE_LINE_TEXT' as const,
    code: '会社名',
    label: '会社名',
    required: true,
    unique: true,
    minLength: '1',
    maxLength: '100',
    defaultValue: '',
  };
  
  // バリデーション
  return Schema.decodeUnknownSync(SingleLineTextFieldPropertiesSchema)(fieldProps);
}

// サブテーブルフィールドの作成
function createSubtableField() {
  const subtableProps = {
    type: 'SUBTABLE',
    code: '商品リスト',
    fields: {
      product_name: {
        type: 'SINGLE_LINE_TEXT',
        code: 'product_name',
        label: '商品名',
        required: true,
      },
      quantity: {
        type: 'NUMBER',
        code: 'quantity',
        label: '数量',
        defaultValue: '1',
        minValue: '1',
      },
      unit_price: {
        type: 'NUMBER',
        code: 'unit_price',
        label: '単価',
        unit: '円',
        unitPosition: 'AFTER',
        digit: true,
      },
    },
  };
  
  return Schema.decodeUnknownSync(SubtableFieldPropertiesSchema)(subtableProps);
}

// 実際のAPIレスポンスの例
const sampleApiResponse = {
  properties: {
    会社名: {
      type: 'SINGLE_LINE_TEXT',
      code: '会社名',
      label: '会社名',
      noLabel: false,
      required: true,
      unique: true,
      minLength: '1',
      maxLength: '100',
      defaultValue: '',
      expression: '',
      hideExpression: false,
    },
    売上金額: {
      type: 'NUMBER',
      code: '売上金額',
      label: '売上金額',
      noLabel: false,
      required: false,
      unique: false,
      minValue: '0',
      maxValue: '999999999',
      defaultValue: '0',
      digit: true,
      displayScale: '0',
      unit: '円',
      unitPosition: 'AFTER',
    },
    商品テーブル: {
      type: 'SUBTABLE',
      code: '商品テーブル',
      fields: {
        商品名: {
          type: 'SINGLE_LINE_TEXT',
          code: '商品名',
          label: '商品名',
          required: true,
        },
        数量: {
          type: 'NUMBER',
          code: '数量',
          label: '数量',
          defaultValue: '1',
        },
      },
    },
  },
  revision: '5',
};

// 使用例
parseFormFieldsResponse(sampleApiResponse)
  .then((result) => {
    console.log('パース成功！');
    console.log(`リビジョン: ${result.revision}`);
  })
  .catch((error) => {
    console.error('エラー:', error);
  });