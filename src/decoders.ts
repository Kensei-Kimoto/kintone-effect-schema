import { Schema } from 'effect'
import { KintoneFieldSchema } from './schemas/fields.js'
import type { KintoneFieldType } from './types/kintone.js'

/**
 * フィールドタイプごとの空値正規化ルール
 * kintoneのAPIは取得時と更新時で空値の扱いが異なるため、
 * 一貫性のある形に正規化する
 */
export const normalizeFieldValue = (field: unknown): unknown => {
  if (!field || typeof field !== 'object') {
    return field
  }
  
  const fieldObj = field as Record<string, unknown>
  const type = fieldObj['type'] as KintoneFieldType
  const value = fieldObj['value']
  
  switch (type) {
    // 文字列系: undefined → ""
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'LINK':
    case 'LOOKUP':
      return { ...fieldObj, value: value === undefined ? '' : value }
    
    // リッチテキスト: 変換不要
    case 'RICH_TEXT':
      return fieldObj
    
    // 数値・日時系: undefined/"" → null
    case 'NUMBER':
    case 'DATETIME':
      return { 
        ...fieldObj, 
        value: (value === undefined || value === '') ? null : value 
      }
    
    // 日付・時刻: undefined → null
    case 'DATE':
    case 'TIME':
      return { ...fieldObj, value: value === undefined ? null : value }
    
    // ドロップダウン: undefined/"" → null
    case 'DROP_DOWN':
      return { 
        ...fieldObj, 
        value: (value === undefined || value === '') ? null : value 
      }
    
    // ラジオボタン: undefined/"" → null
    case 'RADIO_BUTTON':
      return { 
        ...fieldObj, 
        value: (value === undefined || value === '') ? null : value 
      }
    
    // 配列系: undefined/null → []
    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'USER_SELECT':
    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
    case 'FILE':
    case 'CATEGORY':
    case 'STATUS_ASSIGNEE':
      return { 
        ...fieldObj, 
        value: value === undefined || value === null ? [] : value 
      }
    
    // その他のフィールド（CALC, STATUS, CREATOR等）: 変換不要
    default:
      return fieldObj
  }
}

/**
 * kintoneフィールドをデコードし、空値を正規化する
 */
export const decodeKintoneField = (data: unknown): unknown => {
  const normalized = normalizeFieldValue(data)
  return Schema.decodeUnknownSync(KintoneFieldSchema)(normalized)
}

/**
 * kintoneレコード全体をデコードし、各フィールドの空値を正規化する
 */
export const decodeKintoneRecord = (record: Record<string, unknown>): Record<string, unknown> => {
  const normalizedRecord: Record<string, unknown> = {}
  
  for (const [fieldCode, field] of Object.entries(record)) {
    // SubtableやRecordの場合は再帰的に処理が必要だが、
    // ここでは単純化のため基本フィールドのみ対応
    normalizedRecord[fieldCode] = normalizeFieldValue(field)
  }
  
  return normalizedRecord
}