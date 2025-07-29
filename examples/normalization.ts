import { 
  decodeKintoneField,
  decodeKintoneRecord,
  validateFieldForWrite,
  KintoneValidationError
} from '../src/index.js'

console.log('=== 正規化デコーダーの使用例 ===\n')

// 1. JavaScript APIから取得した空値の正規化
console.log('1. 空値の正規化:')

const jsApiTextField = {
  type: 'SINGLE_LINE_TEXT' as const,
  value: undefined, // JavaScript APIではundefinedで返ってくる
}

const normalizedTextField = decodeKintoneField(jsApiTextField)
console.log('テキストフィールド:', normalizedTextField)
// => { type: 'SINGLE_LINE_TEXT', value: '' }

const jsApiNumberField = {
  type: 'NUMBER' as const,
  value: '', // 空の数値フィールド
}

const normalizedNumberField = decodeKintoneField(jsApiNumberField)
console.log('数値フィールド:', normalizedNumberField)
// => { type: 'NUMBER', value: null }

const jsApiRadioField = {
  type: 'RADIO_BUTTON' as const,
  value: undefined, // JavaScript APIでundefined
}

const normalizedRadioField = decodeKintoneField(jsApiRadioField)
console.log('ラジオボタン:', normalizedRadioField)
// => { type: 'RADIO_BUTTON', value: null }

// 2. レコード全体の正規化
console.log('\n2. レコード全体の正規化:')

const jsApiRecord = {
  title: {
    type: 'SINGLE_LINE_TEXT' as const,
    value: undefined,
  },
  price: {
    type: 'NUMBER' as const,
    value: '',
  },
  category: {
    type: 'CATEGORY' as const,
    value: null,
  },
  assignee: {
    type: 'STATUS_ASSIGNEE' as const,
    value: undefined,
  },
}

const normalizedRecord = decodeKintoneRecord(jsApiRecord)
console.log('正規化されたレコード:', JSON.stringify(normalizedRecord, null, 2))

// 3. 書き込み時のバリデーション
console.log('\n3. 書き込み時のバリデーション:')

// 空値を設定できないフィールドの検証
try {
  const emptyRadioButton = {
    type: 'RADIO_BUTTON' as const,
    value: null,
  }
  validateFieldForWrite(emptyRadioButton)
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.log('ラジオボタンのエラー:', error.message)
  }
}

try {
  const emptyCategory = {
    type: 'CATEGORY' as const,
    value: [],
  }
  validateFieldForWrite(emptyCategory)
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.log('カテゴリーのエラー:', error.message)
  }
}

// 正常なデータは通過
const validRadioButton = {
  type: 'RADIO_BUTTON' as const,
  value: 'Option 1',
}

try {
  validateFieldForWrite(validRadioButton)
  console.log('ラジオボタンの検証: OK')
} catch (error) {
  console.log('エラー:', error)
}