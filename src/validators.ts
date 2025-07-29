import type { KintoneFieldType } from './types/kintone.js'

export class KintoneValidationError extends Error {
  constructor(
    public fieldType: KintoneFieldType,
    message: string
  ) {
    super(message)
    this.name = 'KintoneValidationError'
  }
}

/**
 * 書き込み時のフィールドバリデーション
 * 空の値を設定できないフィールドタイプをチェック
 */
export const validateFieldForWrite = (field: { type: KintoneFieldType; value: unknown }): void => {
  const { type, value } = field
  
  // 空値を設定できないフィールドタイプ
  const nonEmptyFields: KintoneFieldType[] = ['RADIO_BUTTON', 'CATEGORY', 'STATUS_ASSIGNEE']
  
  if (nonEmptyFields.includes(type)) {
    let isEmpty = false
    
    switch (type) {
      case 'RADIO_BUTTON':
        // ラジオボタンは null または空文字列を許可しない
        isEmpty = value === null || value === ''
        break
        
      case 'CATEGORY':
      case 'STATUS_ASSIGNEE':
        // カテゴリーと作業者は空配列を許可しない
        isEmpty = Array.isArray(value) && value.length === 0
        break
    }
    
    if (isEmpty) {
      throw new KintoneValidationError(
        type,
        `${type}フィールドには空の値を設定できません`
      )
    }
  }
}

/**
 * レコード全体の書き込みバリデーション
 */
export const validateRecordForWrite = (record: Record<string, { type: KintoneFieldType; value: unknown }>): void => {
  for (const [fieldCode, field] of Object.entries(record)) {
    try {
      validateFieldForWrite(field)
    } catch (error) {
      if (error instanceof KintoneValidationError) {
        // フィールドコードを含めてエラーを再スロー
        throw new KintoneValidationError(
          error.fieldType,
          `フィールド "${fieldCode}": ${error.message}`
        )
      }
      throw error
    }
  }
}

/**
 * 空値を設定できないフィールドかどうかを判定
 */
export const isNonEmptyField = (type: KintoneFieldType): boolean => {
  return ['RADIO_BUTTON', 'CATEGORY', 'STATUS_ASSIGNEE'].includes(type)
}

/**
 * フィールドタイプに応じた適切な空値を返す
 * （書き込み用）
 */
export const getEmptyValueForWrite = (type: KintoneFieldType): string | null | never[] => {
  switch (type) {
    // 文字列系
    case 'SINGLE_LINE_TEXT':
    case 'MULTI_LINE_TEXT':
    case 'RICH_TEXT':
    case 'LINK':
    case 'LOOKUP':
      return ''
    
    // null を使用する系
    case 'NUMBER':
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'DROP_DOWN':
      return null
    
    // 配列系
    case 'CHECK_BOX':
    case 'MULTI_SELECT':
    case 'USER_SELECT':
    case 'ORGANIZATION_SELECT':
    case 'GROUP_SELECT':
    case 'FILE':
      return []
    
    // 空値を設定できない
    case 'RADIO_BUTTON':
    case 'CATEGORY':
    case 'STATUS_ASSIGNEE':
      throw new KintoneValidationError(
        type,
        `${type}フィールドには空の値を設定できません`
      )
    
    // その他（通常は読み取り専用）
    default:
      return ''
  }
}