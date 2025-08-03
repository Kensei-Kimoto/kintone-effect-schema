# なぜ Effect-TS Schema なのか？

## 🤔 kintone 開発の悩み

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

## 💪 Effect-TS Schema が解決すること

### 1. **実行時の型検証**

```typescript
import { Schema } from 'effect';
import { NumberFieldSchema } from 'kintone-effect-schema';

// 実行時に型をチェック！
const field = { type: 'NUMBER', value: '123.45' };
const validated = Schema.decodeUnknownSync(NumberFieldSchema)(field);
// ✅ 型が保証される！validated は確実に NumberField 型
```

### 2. **エラーの詳細な情報**

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

### 3. **コンポーザブルなスキーマ定義**

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

### 4. **型の導出**

```typescript
// スキーマから TypeScript の型を自動生成
type CustomRecord = Schema.Schema.Type<typeof CustomRecordSchema>;
// 手動で型定義を書く必要なし！
```

## 🚀 他のバリデーションライブラリとの比較

### Zod との違い

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

### Yup, Joi との違い

- **型推論**: Effect-TS は TypeScript ファースト
- **パフォーマンス**: コンパイル時の最適化
- **エコシステム**: Effect の他のライブラリと組み合わせ可能

## 🎯 kintone × Effect-TS の相性の良さ

### 1. **複雑な Union 型の扱い**

```typescript
// kintone のフィールドは 28 種類以上の Union
const KintoneFieldSchema = Schema.Union(
  SingleLineTextFieldSchema,
  NumberFieldSchema
  // ... 26 種類以上
);
```

### 2. **段階的な変換**

```typescript
// API レスポンス → 正規化 → バリデーション → ビジネスロジック
const pipeline = Schema.transform(RawApiResponse, NormalizedRecord, {
  decode: (raw) => normalize(raw),
  encode: (norm) => denormalize(norm),
});
```

### 3. **エラーハンドリング**

```typescript
// Effect-TS のエラーは構造化されている
const result = Schema.decodeUnknownEither(schema)(data);
if (Either.isLeft(result)) {
  // 型安全なエラーハンドリング
  const errors = Schema.formatError(result.left);
}
```

## 📚 まとめ

Effect-TS Schema を使うことで：

- ✅ **実行時の型安全性** - API レスポンスを信頼できる
- ✅ **開発体験の向上** - エラーがどこで起きたか明確
- ✅ **保守性の向上** - スキーマ = ドキュメント = 型定義
- ✅ **拡張性** - 独自のバリデーションルールを追加可能

**kintone の複雑な型システムには、Effect-TS Schema のような強力なツールが必要です！**