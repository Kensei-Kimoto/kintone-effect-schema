/**
 * kintone Form Fields APIレスポンスの処理例
 * 
 * kintone APIは数値系のプロパティを文字列として返すため、
 * スキーマではそのまま文字列として扱います。
 * 必要に応じてアプリケーション側で数値に変換してください。
 */

import { Schema } from 'effect';
import { GetFormFieldsResponseSchema } from '../src/schemas/form/fields.js';

// 実際のkintone APIレスポンスの例
const apiResponse = {
  properties: {
    // システムフィールド
    'レコード番号': {
      type: 'RECORD_NUMBER',
      code: 'レコード番号',
      label: 'レコード番号',
      noLabel: false,
    },
    'ステータス': {
      type: 'STATUS',
      code: 'ステータス',
      label: 'ステータス',
      enabled: true,
    },
    '$id': {
      type: '__ID__',
      code: '$id',
      label: 'レコードID',
    },
    
    // ユーザー定義フィールド
    'phone': {
      type: 'SINGLE_LINE_TEXT',
      code: 'phone',
      label: '電話番号',
      required: true,
      minLength: '10',  // APIは文字列として返す
      maxLength: '15',  // APIは文字列として返す
      defaultValue: '',
    },
    'revenue': {
      type: 'NUMBER',
      code: 'revenue',
      label: '年間売上高',
      required: false,
      minValue: '0',      // APIは文字列として返す
      maxValue: '',       // 空文字列は「設定なし」を意味する
      displayScale: '2',  // APIは文字列として返す
      unit: '円',
      unitPosition: 'AFTER',
    },
    'customerType': {
      type: 'RADIO_BUTTON',
      code: 'customerType',
      label: '顧客タイプ',
      options: {
        'individual': {
          label: '個人',
          index: '0',  // APIは文字列として返す
        },
        'business': {
          label: '法人',
          index: '1',  // APIは文字列として返す
        },
      },
      defaultValue: 'individual',
      align: 'HORIZONTAL',
    },
    
    // サブテーブル
    'relocations': {
      type: 'SUBTABLE',
      code: 'relocations',
      fields: {
        'from_location': {
          type: 'SINGLE_LINE_TEXT',
          code: 'from_location',
          label: '移転元',
          required: true,
          minLength: '',     // 空文字列
          maxLength: '255',  // 文字列
        },
        'to_location': {
          type: 'SINGLE_LINE_TEXT',
          code: 'to_location',
          label: '移転先',
          required: true,
          minLength: '',    // 空文字列
          maxLength: '',    // 空文字列
        },
        'cost': {
          type: 'NUMBER',
          code: 'cost',
          label: '費用',
          minValue: '0',     // 文字列
          maxValue: '',      // 空文字列
          displayScale: '',  // 空文字列
        },
      },
    },
  },
  revision: '42',
};

// バリデーション実行
try {
  const validated = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(apiResponse);
  console.log('✅ バリデーション成功！');
  
  // 数値への変換が必要な場合の例
  const phoneField = validated.properties.phone;
  if (phoneField.type === 'SINGLE_LINE_TEXT' && phoneField.minLength) {
    const minLength = Number(phoneField.minLength);
    console.log(`電話番号の最小文字数: ${minLength}`);
  }
  
  const revenueField = validated.properties.revenue;
  if (revenueField.type === 'NUMBER' && revenueField.minValue) {
    const minValue = Number(revenueField.minValue);
    console.log(`売上高の最小値: ${minValue}`);
  }
  
  // サブテーブル内のフィールドも同様
  const relocationsTable = validated.properties.relocations;
  if (relocationsTable.type === 'SUBTABLE') {
    const fromLocation = relocationsTable.fields.from_location;
    if (fromLocation.type === 'SINGLE_LINE_TEXT' && fromLocation.maxLength) {
      const maxLength = Number(fromLocation.maxLength);
      console.log(`移転元の最大文字数: ${maxLength}`);
    }
  }
  
} catch (error) {
  console.error('❌ バリデーションエラー:', error);
}

/**
 * 空文字列の扱いについて
 * 
 * kintone APIは「設定されていない」ことを空文字列 "" で表現します。
 * これをアプリケーション側でどう扱うかは要件によります：
 * 
 * 1. undefined として扱う
 * 2. null として扱う
 * 3. デフォルト値を設定する
 * 4. そのまま空文字列として扱う
 * 
 * 例：
 */
function normalizeNumericProperty(value: string | undefined): number | undefined {
  if (!value || value === '') {
    return undefined;
  }
  return Number(value);
}

// 使用例
const maxLength = normalizeNumericProperty(apiResponse.properties.revenue.maxValue);
console.log('売上高の最大値:', maxLength); // undefined