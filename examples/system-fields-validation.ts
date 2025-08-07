/**
 * システムフィールドのバリデーション例
 * 
 * kintone APIレスポンスに含まれるシステムフィールドを正しくバリデーションする方法を示します
 */

import { Schema } from 'effect';
import { GetFormFieldsResponseSchema } from '../src/schemas/form/fields.js';

// 実際のkintone APIレスポンスの例
const apiResponse = {
  properties: {
    // システムフィールド（予約語と同じフィールドコード）
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
    // 特殊なシステムフィールド
    '$id': {
      type: '__ID__',
      code: '$id',
      label: 'レコードID',
    },
    '$revision': {
      type: '__REVISION__',
      code: '$revision',
      label: 'リビジョン',
    },
    // ユーザー定義フィールド
    '会社名': {
      type: 'SINGLE_LINE_TEXT',
      code: '会社名',
      label: '会社名',
      required: true,
      unique: true,
    },
    '売上高': {
      type: 'NUMBER',
      code: '売上高',
      label: '売上高（円）',
      unit: '円',
      unitPosition: 'AFTER',
    },
  },
  revision: '42',
};

// バリデーション実行
try {
  const validated = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(apiResponse);
  console.log('✅ バリデーション成功！');
  console.log('システムフィールド数:', Object.keys(validated.properties).filter(key => 
    ['レコード番号', 'ステータス', '作業者', '作成者', '作成日時', '更新者', '更新日時', 'カテゴリー', '$id', '$revision'].includes(key)
  ).length);
  console.log('ユーザー定義フィールド数:', Object.keys(validated.properties).filter(key => 
    !['レコード番号', 'ステータス', '作業者', '作成者', '作成日時', '更新者', '更新日時', 'カテゴリー', '$id', '$revision'].includes(key)
  ).length);
} catch (error) {
  console.error('❌ バリデーションエラー:', error);
}

// 個別のフィールドコードバリデーション例
import { SystemFieldCodeSchema, UserFieldCodeSchema } from '../src/schemas/form/fields.js';

console.log('\n--- フィールドコードバリデーション例 ---');

// システムフィールドコード（予約語OK）
const systemCodes = ['ステータス', '作業者', 'レコード番号', '$id', '$revision'];
systemCodes.forEach(code => {
  try {
    Schema.decodeUnknownSync(SystemFieldCodeSchema)(code);
    console.log(`✅ "${code}" はシステムフィールドコードとして有効`);
  } catch {
    console.log(`❌ "${code}" はシステムフィールドコードとして無効`);
  }
});

console.log('');

// ユーザー定義フィールドコード（予約語NG）
const userCodes = ['会社名', '売上高', 'ステータス', 'custom_field_123'];
userCodes.forEach(code => {
  try {
    Schema.decodeUnknownSync(UserFieldCodeSchema)(code);
    console.log(`✅ "${code}" はユーザー定義フィールドコードとして有効`);
  } catch {
    console.log(`❌ "${code}" はユーザー定義フィールドコードとして無効（予約語）`);
  }
});