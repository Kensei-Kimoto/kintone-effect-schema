# kintone-effect-schema

Effect-TS を使用した kintone フィールドのスキーマ定義ライブラリです。kintone API の複雑な型定義と空値の扱いを正規化し、型安全な開発を実現します。フォーム設定 API にも対応し、アプリの設定情報も型安全に扱えます。

## 特徴

- 🔒 **型安全** - TypeScript の型推論を最大限活用
- 🔄 **空値の正規化** - JavaScript API と REST API の違いを吸収
- ✅ **書き込みバリデーション** - 空値を設定できないフィールドを自動検証
- 📦 **全フィールドタイプ対応** - kintone の全フィールドタイプをサポート
- 🎯 **Effect-TS** - 強力なスキーマバリデーション機能
- ⚙️ **フォーム設定 API 対応** - アプリのフィールド設定情報も型安全に

## ドキュメント

- [なぜ Effect-TS Schema なのか？](./docs/why-effect.ja.md) - メリットと他ライブラリとの比較
- [サポートしているフィールドタイプ](./docs/field-types.ja.md) - 全フィールドタイプと正規化ルール
- [フォームフィールド設定スキーマ](./docs/form-fields.ja.md) - フィールド設定の管理
- [API リファレンス](./docs/api-reference.ja.md) - 完全な API ドキュメント

## インストール

```bash
npm install kintone-effect-schema effect
```

### TypeScript 設定

Effect-TS を正しく使用するために、以下の TypeScript 設定が必要です：

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true // 推奨: より厳密な型チェック
  }
}
```

## 基本的な使い方

### 1. フィールドの型チェックとパース

```typescript
import { Schema } from 'effect';
import {
  SingleLineTextFieldSchema,
  NumberFieldSchema,
  type SingleLineTextField,
  type NumberField,
} from 'kintone-effect-schema';

// テキストフィールドのパース
const textField = {
  type: 'SINGLE_LINE_TEXT',
  value: 'Hello, kintone!',
};
const parsedText: SingleLineTextField =
  Schema.decodeUnknownSync(SingleLineTextFieldSchema)(textField);
// parsedText.type は 'SINGLE_LINE_TEXT' リテラル型
// parsedText.value は string 型

// 数値フィールドのパース（nullも許容）
const numberField = {
  type: 'NUMBER',
  value: '1234.56', // または null
};
const parsedNumber: NumberField = Schema.decodeUnknownSync(NumberFieldSchema)(numberField);
// parsedNumber.value は string | null 型
```

### 2. 空値の正規化（重要！）

kintone API は取得時と更新時で空値の扱いが異なります。このライブラリは自動的に正規化します。

```typescript
import { decodeKintoneField } from 'kintone-effect-schema';

// JavaScript APIから取得したデータ（undefinedが含まれる）
const jsApiField = {
  type: 'SINGLE_LINE_TEXT',
  value: undefined, // JavaScript APIではundefinedで返ってくる
};

// 自動的に正規化される
const normalized = decodeKintoneField(jsApiField);
console.log(normalized); // { type: 'SINGLE_LINE_TEXT', value: '' }

// 数値フィールドの場合
const numberField = {
  type: 'NUMBER',
  value: '', // 空文字列で返ってくることがある
};
const normalizedNumber = decodeKintoneField(numberField);
console.log(normalizedNumber); // { type: 'NUMBER', value: null }
```

### 3. レコード全体の処理

```typescript
import { decodeKintoneRecord, KintoneRecordSchema } from 'kintone-effect-schema';

// JavaScript APIから取得したレコード
const record = kintone.app.record.get();
const normalizedRecord = decodeKintoneRecord(record.record);

// 型安全にアクセス
const title = normalizedRecord.title as { type: 'SINGLE_LINE_TEXT'; value: string };
console.log(title.value);
```

### 4. 書き込み時のバリデーション

一部のフィールドは空値を設定できません。自動的にチェックされます。

```typescript
import { validateFieldForWrite, KintoneValidationError } from 'kintone-effect-schema';

// ラジオボタンは空値を設定できない
const radioField = {
  type: 'RADIO_BUTTON' as const,
  value: null,
};

try {
  validateFieldForWrite(radioField);
} catch (error) {
  if (error instanceof KintoneValidationError) {
    console.error(error.message);
    // => "RADIO_BUTTONフィールドには空の値を設定できません"
  }
}

// カテゴリーも空配列を設定できない
const categoryField = {
  type: 'CATEGORY' as const,
  value: [],
};
// これもエラーになる
```

## 実践的な使用例

### kintone カスタマイズでの使用

```typescript
import { decodeKintoneRecord, validateRecordForWrite } from 'kintone-effect-schema';

kintone.events.on('app.record.create.submit', (event) => {
  const record = event.record;

  try {
    // 空値を正規化
    const normalizedRecord = decodeKintoneRecord(record);

    // 書き込み前のバリデーション
    validateRecordForWrite(normalizedRecord);

    // 正規化されたレコードを返す
    event.record = normalizedRecord;
    return event;
  } catch (error) {
    event.error = error.message;
    return event;
  }
});
```

### REST API との連携

```typescript
import { decodeKintoneField, getEmptyValueForWrite } from 'kintone-effect-schema';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

// APIから取得したレコードを正規化
const client = new KintoneRestAPIClient({
  baseUrl: 'https://example.cybozu.com',
  auth: {
    /* 認証情報 */
  },
});

const response = await client.record.getRecords({
  app: 1,
  fields: ['title', 'price', 'tags'],
  query: "title = 'test'",
  totalCount: false,
});

// 各レコードを正規化
const normalizedRecords = response.records.map((record) => {
  return decodeKintoneRecord(record);
});

// 正規化後は型安全にアクセス可能
normalizedRecords.forEach((record) => {
  console.log(record.title.value); // 必ず文字列（undefinedが''に正規化される）
  console.log(record.price.value); // null または 文字列
});

// 更新時は適切な空値を設定
const updateData = {
  title: { value: '' }, // 文字列は空文字列
  price: { value: null }, // 数値はnull
  tags: { value: [] }, // 配列は空配列
};
```

## 開発

```bash
# インストール
npm install

# ビルド
npm run build

# 開発モード（ファイル監視）
npm run dev

# テスト実行
npm test

# 型チェック
npm run typecheck

# リント
npm run lint
```

## ライセンス

MIT

## 貢献

Issue や Pull Request は大歓迎です！kintone API の仕様は複雑なので、バグ報告や改善提案をお待ちしています。