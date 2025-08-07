# API リファレンス

## スキーマ

### フィールド値スキーマ

各フィールドタイプに対応したスキーマ定義：

- `SingleLineTextFieldSchema`, `NumberFieldSchema`, `DateFieldSchema` など
- `KintoneFieldSchema` - 全フィールドタイプの Union
- `KintoneRecordSchema` - レコード全体のスキーマ

### フォームフィールド設定スキーマ

- `SingleLineTextFieldPropertiesSchema`, `NumberFieldPropertiesSchema` など各フィールドの設定スキーマ
- `SubtableFieldPropertiesSchema` - サブテーブルフィールドの設定スキーマ
- `GetFormFieldsResponseSchema` - フォームフィールド取得 API のレスポンススキーマ
- `KintoneFieldPropertiesSchema` - 全フィールドタイプの設定の Union

## 型定義

スキーマから推論される TypeScript 型：

### フィールド値の型

```typescript
import type {
  SingleLineTextField,
  NumberField,
  KintoneField,
  KintoneRecord,
} from 'kintone-effect-schema';

// 個別フィールドの型
type TextField = SingleLineTextField; // { type: 'SINGLE_LINE_TEXT', value: string }
type NumField = NumberField; // { type: 'NUMBER', value: string | null }

// Union 型
type AnyField = KintoneField; // 全フィールドタイプの Union
```

### フィールド設定の型

```typescript
import type {
  SingleLineTextFieldProperties,
  NumberFieldProperties,
  SubtableFieldProperties,
  GetFormFieldsResponse,
  KintoneFieldProperties,
} from 'kintone-effect-schema';

// 個別フィールド設定の型
type TextFieldProps = SingleLineTextFieldProperties;
type NumberFieldProps = NumberFieldProperties;

// APIレスポンスの型
type FormFields = GetFormFieldsResponse;
```

## デコーダー関数

### `decodeKintoneField(field)`

単一フィールドを正規化してデコード。

```typescript
import { decodeKintoneField } from 'kintone-effect-schema';

const field = { type: 'SINGLE_LINE_TEXT', value: undefined };
const normalized = decodeKintoneField(field);
// 結果: { type: 'SINGLE_LINE_TEXT', value: '' }
```

### `decodeKintoneRecord(record)`

レコード全体を正規化。

```typescript
import { decodeKintoneRecord } from 'kintone-effect-schema';

const record = {
  title: { type: 'SINGLE_LINE_TEXT', value: undefined },
  price: { type: 'NUMBER', value: '' }
};
const normalized = decodeKintoneRecord(record);
// 結果: {
//   title: { type: 'SINGLE_LINE_TEXT', value: '' },
//   price: { type: 'NUMBER', value: null }
// }
```

### `normalizeFieldValue(field)`

フィールド値のみを正規化。

```typescript
import { normalizeFieldValue } from 'kintone-effect-schema';

const field = { type: 'NUMBER', value: '' };
const normalized = normalizeFieldValue(field);
// 結果: { type: 'NUMBER', value: null }
```

## バリデーション関数

### `validateFieldForWrite(field)`

書き込み前のフィールドバリデーション。

```typescript
import { validateFieldForWrite } from 'kintone-effect-schema';

const field = { type: 'RADIO_BUTTON', value: null };
validateFieldForWrite(field); // KintoneValidationError をスロー
```

### `validateRecordForWrite(record)`

レコード全体のバリデーション。

```typescript
import { validateRecordForWrite } from 'kintone-effect-schema';

const record = {
  status: { type: 'RADIO_BUTTON', value: null },
  title: { type: 'SINGLE_LINE_TEXT', value: '' }
};
validateRecordForWrite(record); // ラジオボタンのエラーをスロー
```

### `isNonEmptyField(type)`

空値を許可しないフィールドかチェック。

```typescript
import { isNonEmptyField } from 'kintone-effect-schema';

isNonEmptyField('RADIO_BUTTON'); // true
isNonEmptyField('SINGLE_LINE_TEXT'); // false
```

### `getEmptyValueForWrite(type)`

フィールドタイプに応じた空値を取得。

```typescript
import { getEmptyValueForWrite } from 'kintone-effect-schema';

getEmptyValueForWrite('SINGLE_LINE_TEXT'); // ''
getEmptyValueForWrite('NUMBER'); // null
getEmptyValueForWrite('CHECK_BOX'); // []
```

## エラークラス

### `KintoneValidationError`

バリデーションエラー（fieldType と message を含む）。

```typescript
import { KintoneValidationError } from 'kintone-effect-schema';

try {
  validateFieldForWrite({ type: 'RADIO_BUTTON', value: null });
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.log(error.fieldType); // 'RADIO_BUTTON'
    console.log(error.message); // 'RADIO_BUTTONフィールドには空の値を設定できません'
  }
}
```

## コード生成関数

### `fieldConfigToTypeScriptCode(fieldConfig, fieldCode?)`

単一のフィールド設定をTypeScriptコードに変換。

```typescript
import { fieldConfigToTypeScriptCode } from 'kintone-effect-schema';

const fieldConfig = {
  type: 'SINGLE_LINE_TEXT',
  code: 'title',
  label: 'タイトル',
  required: true
};

const code = fieldConfigToTypeScriptCode(fieldConfig);
// 結果: export const titleField: SingleLineTextFieldProperties = { ... };
```

### `fieldsConfigToTypeScriptCode(fieldsConfig)`

複数のフィールド設定をTypeScriptコードに変換。

```typescript
import { fieldsConfigToTypeScriptCode } from 'kintone-effect-schema';

const fieldsConfig = {
  title: { type: 'SINGLE_LINE_TEXT', ... },
  price: { type: 'NUMBER', ... }
};

const code = fieldsConfigToTypeScriptCode(fieldsConfig);
// 結果: インポートと型定義を含む完全なTypeScriptコード
```