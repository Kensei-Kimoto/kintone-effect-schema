# kintone-effect-schema

Effect-TS を使用した kintone フィールドのスキーマ定義ライブラリです。kintone API の複雑な型定義と空値の扱いを正規化し、型安全な開発を実現します。

## 特徴

- 🔒 **型安全** - TypeScript の型推論を最大限活用
- 🔄 **空値の正規化** - JavaScript API と REST API の違いを吸収
- ✅ **書き込みバリデーション** - 空値を設定できないフィールドを自動検証
- 📦 **全フィールドタイプ対応** - kintone の全フィールドタイプをサポート
- 🎯 **Effect-TS** - 強力なスキーマバリデーション機能

## なぜ Effect-TS Schema なのか？

### 🤔 kintone 開発の悩み

kintone のフィールド型定義は複雑です：

```typescript
// これ、実行時に型が保証されますか？
const record = await client.record.getRecord({ app: 1, id: 1 });
const title = record.record.title.value; // string? undefined? null?
const price = record.record.price.value; // string? number? "123.45"?
```

**答え：保証されません！** 😱

- TypeScript の型定義は**コンパイル時のみ**
- 実行時には `any` と同じ（型情報は消える）
- API レスポンスの型は信用できない
- kintone の仕様変更で壊れる可能性

### 💪 Effect-TS Schema が解決すること

#### 1. **実行時の型検証**

```typescript
import { Schema } from 'effect';
import { NumberFieldSchema } from 'kintone-effect-schema';

// 実行時に型をチェック！
const field = { type: 'NUMBER', value: '123.45' };
const validated = Schema.decodeUnknownSync(NumberFieldSchema)(field);
// ✅ 型が保証される！validated は確実に NumberField 型
```

#### 2. **エラーの詳細な情報**

```typescript
try {
  const invalid = { type: 'NUMBER', value: { nested: 'object' } };
  Schema.decodeUnknownSync(NumberFieldSchema)(invalid);
} catch (error) {
  console.error(Schema.formatError(error));
  // 詳細なエラー情報:
  // └─ ["value"]
  //    └─ Expected string | null, actual {"nested":"object"}
}
```

#### 3. **コンポーザブルなスキーマ定義**

```typescript
// 小さなスキーマを組み合わせて大きなスキーマを作る
const CustomRecordSchema = Schema.Struct({
  title: SingleLineTextFieldSchema,
  price: NumberFieldSchema,
  tags: CheckBoxFieldSchema,
  // 独自のバリデーションも追加可能
  total: Schema.Number.pipe(
    Schema.filter((n) => n >= 0, { message: '合計は0以上である必要があります' })
  ),
});
```

#### 4. **型の導出**

```typescript
// スキーマから TypeScript の型を自動生成
type CustomRecord = Schema.Schema.Type<typeof CustomRecordSchema>;
// 手動で型定義を書く必要なし！
```

### 🚀 他のバリデーションライブラリとの比較

#### Zod との違い

```typescript
// Zod
const schema = z.object({
  type: z.literal('NUMBER'),
  value: z.union([z.string(), z.null()]),
});

// Effect-TS Schema
const schema = Schema.Struct({
  type: Schema.Literal('NUMBER'),
  value: Schema.Union(Schema.String, Schema.Null),
});
```

**Effect-TS の利点：**

- より関数型プログラミング指向
- パイプライン演算子で変換を連鎖
- Effect エコシステムとの統合
- より詳細なエラー情報

#### Yup, Joi との違い

- **型推論**: Effect-TS は TypeScript ファースト
- **パフォーマンス**: コンパイル時の最適化
- **エコシステム**: Effect の他のライブラリと組み合わせ可能

### 🎯 kintone × Effect-TS の相性の良さ

1. **複雑な Union 型の扱い**

   ```typescript
   // kintone のフィールドは 28 種類以上の Union
   const KintoneFieldSchema = Schema.Union(
     SingleLineTextFieldSchema,
     NumberFieldSchema
     // ... 26 種類以上
   );
   ```

2. **段階的な変換**

   ```typescript
   // API レスポンス → 正規化 → バリデーション → ビジネスロジック
   const pipeline = Schema.transform(RawApiResponse, NormalizedRecord, {
     decode: (raw) => normalize(raw),
     encode: (norm) => denormalize(norm),
   });
   ```

3. **エラーハンドリング**
   ```typescript
   // Effect-TS のエラーは構造化されている
   const result = Schema.decodeUnknownEither(schema)(data);
   if (Either.isLeft(result)) {
     // 型安全なエラーハンドリング
     const errors = Schema.formatError(result.left);
   }
   ```

### 📚 まとめ

Effect-TS Schema を使うことで：

- ✅ **実行時の型安全性** - API レスポンスを信頼できる
- ✅ **開発体験の向上** - エラーがどこで起きたか明確
- ✅ **保守性の向上** - スキーマ = ドキュメント = 型定義
- ✅ **拡張性** - 独自のバリデーションルールを追加可能

**kintone の複雑な型システムには、Effect-TS Schema のような強力なツールが必要です！**

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
  type NumberField 
} from 'kintone-effect-schema';

// テキストフィールドのパース
const textField = {
  type: 'SINGLE_LINE_TEXT',
  value: 'Hello, kintone!',
};
const parsedText: SingleLineTextField = Schema.decodeUnknownSync(SingleLineTextFieldSchema)(textField);
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

## 空値の正規化ルール

| フィールドタイプ           | 取得時の空値          | 正規化後 | 更新時に使用 |
| -------------------------- | --------------------- | -------- | ------------ |
| 文字列（1 行/複数行）      | `undefined`           | `""`     | `""`         |
| リンク、ルックアップ       | `undefined`           | `""`     | `""`         |
| 数値、日時                 | `undefined` or `""`   | `null`   | `null`       |
| 日付、時刻                 | `undefined`           | `null`   | `null`       |
| ドロップダウン             | `undefined` or `""`   | `null`   | `null`       |
| ラジオボタン               | `undefined` or `""`   | `null`   | 空値設定不可 |
| チェックボックス等の配列系 | `undefined` or `null` | `[]`     | `[]`         |
| カテゴリー、作業者         | `undefined` or `null` | `[]`     | 空値設定不可 |

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

## サポートしているフィールドタイプ

### 基本フィールド

- `SINGLE_LINE_TEXT` - 文字列（1 行）
- `MULTI_LINE_TEXT` - 文字列（複数行）
- `RICH_TEXT` - リッチエディター
- `NUMBER` - 数値
- `CALC` - 計算
- `RADIO_BUTTON` - ラジオボタン
- `CHECK_BOX` - チェックボックス
- `MULTI_SELECT` - 複数選択
- `DROP_DOWN` - ドロップダウン
- `DATE` - 日付
- `TIME` - 時刻
- `DATETIME` - 日時
- `LINK` - リンク

### 特殊フィールド

- `USER_SELECT` - ユーザー選択
- `ORGANIZATION_SELECT` - 組織選択
- `GROUP_SELECT` - グループ選択
- `CATEGORY` - カテゴリー
- `STATUS` - ステータス
- `STATUS_ASSIGNEE` - 作業者
- `FILE` - 添付ファイル
- `LOOKUP` - ルックアップ

### システムフィールド

- `RECORD_NUMBER` - レコード番号
- `RECORD_ID` - レコード ID ($id)
- `REVISION` - リビジョン ($revision)
- `CREATOR` - 作成者
- `CREATED_TIME` - 作成日時
- `MODIFIER` - 更新者
- `UPDATED_TIME` - 更新日時

### その他

- `SUBTABLE` - テーブル

## API リファレンス

### スキーマ

各フィールドタイプに対応したスキーマ定義：
- `SingleLineTextFieldSchema`, `NumberFieldSchema`, `DateFieldSchema` など
- `KintoneFieldSchema` - 全フィールドタイプの Union
- `KintoneRecordSchema` - レコード全体のスキーマ

### 型定義

スキーマから推論される TypeScript 型：
```typescript
import type { 
  SingleLineTextField, 
  NumberField,
  KintoneField,
  KintoneRecord 
} from 'kintone-effect-schema';

// 個別フィールドの型
type TextField = SingleLineTextField; // { type: 'SINGLE_LINE_TEXT', value: string }
type NumField = NumberField; // { type: 'NUMBER', value: string | null }

// Union 型
type AnyField = KintoneField; // 全28種類のフィールドの Union
```

### デコーダー関数

- `decodeKintoneField(field)` - 単一フィールドを正規化してデコード
- `decodeKintoneRecord(record)` - レコード全体を正規化
- `normalizeFieldValue(field)` - フィールド値のみを正規化

### バリデーション関数

- `validateFieldForWrite(field)` - 書き込み前のフィールドバリデーション
- `validateRecordForWrite(record)` - レコード全体のバリデーション
- `isNonEmptyField(type)` - 空値を許可しないフィールドかチェック
- `getEmptyValueForWrite(type)` - フィールドタイプに応じた空値を取得

### エラークラス

- `KintoneValidationError` - バリデーションエラー（fieldType と message を含む）

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
