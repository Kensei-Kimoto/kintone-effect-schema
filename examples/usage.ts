import { Schema } from 'effect'
import {
  SingleLineTextFieldSchema,
  NumberFieldSchema,
  KintoneRecordSchema,
  GetRecordResponseSchema,
} from '../src/index.js'

// 単一フィールドのパース例
const textFieldData = {
  type: 'SINGLE_LINE_TEXT' as const,
  value: 'Hello, kintone!',
}

try {
  const parsed = Schema.decodeUnknownSync(SingleLineTextFieldSchema)(textFieldData)
  console.log('Parsed text field:', parsed)
} catch (error) {
  console.error('Parse error:', error)
}

// レコード全体のパース例
const recordData = {
  title: {
    type: 'SINGLE_LINE_TEXT' as const,
    value: 'サンプルレコード',
  },
  price: {
    type: 'NUMBER' as const,
    value: '1500',
  },
  tags: {
    type: 'CHECK_BOX' as const,
    value: ['タグ1', 'タグ2'],
  },
  assignee: {
    type: 'USER_SELECT' as const,
    value: [
      { code: 'user001', name: '田中太郎' },
    ],
  },
}

try {
  const parsedRecord = Schema.decodeUnknownSync(KintoneRecordSchema)(recordData)
  console.log('Parsed record:', parsedRecord)
} catch (error) {
  console.error('Parse error:', error)
}

// APIレスポンスのパース例
const apiResponse = {
  record: {
    $id: {
      type: 'RECORD_NUMBER' as const,
      value: '100',
    },
    ...recordData,
  },
}

try {
  const parsedResponse = Schema.decodeUnknownSync(GetRecordResponseSchema)(apiResponse)
  console.log('Parsed API response:', parsedResponse)
} catch (error) {
  console.error('Parse error:', error)
}

// エンコード例（型安全なデータ作成）
const createRecord = () => {
  const newRecord = {
    title: {
      type: 'SINGLE_LINE_TEXT' as const,
      value: '新規レコード',
    },
    amount: {
      type: 'NUMBER' as const,
      value: null, // 空の数値フィールド
    },
  }
  
  // 型チェックとバリデーション
  const validated = Schema.decodeUnknownSync(KintoneRecordSchema)(newRecord)
  return validated
}

console.log('Created record:', createRecord())