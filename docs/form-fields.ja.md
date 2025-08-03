# フォームフィールド設定スキーマ

kintone のフォーム設定 API に対応したスキーマ定義を提供しています。これにより、アプリのフィールド設定情報を型安全に扱えます。

## フィールド設定の取得

```typescript
import { Schema } from 'effect';
import { GetFormFieldsResponseSchema, type GetFormFieldsResponse } from 'kintone-effect-schema';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

// フォームフィールド取得APIのレスポンスをパース
const client = new KintoneRestAPIClient({
  baseUrl: 'https://example.cybozu.com',
  auth: { /* 認証情報 */ }
});

const apiResponse = await client.app.getFormFields({
  app: 1,
}); // 実際のAPI呼び出し
const formFields: GetFormFieldsResponse = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(
  apiResponse
);

// 型安全にフィールド設定にアクセス
Object.entries(formFields.properties).forEach(([fieldCode, fieldProps]) => {
  console.log(`フィールドコード: ${fieldCode}`);
  console.log(`フィールドタイプ: ${fieldProps.type}`);
  console.log(`ラベル: ${fieldProps.label}`);

  // フィールドタイプ別の処理
  switch (fieldProps.type) {
    case 'SINGLE_LINE_TEXT':
      console.log(`最大文字数: ${fieldProps.maxLength}`);
      console.log(`必須: ${fieldProps.required}`);
      break;
    case 'NUMBER':
      console.log(`単位: ${fieldProps.unit}`);
      console.log(`単位の位置: ${fieldProps.unitPosition}`);
      break;
    case 'SUBTABLE':
      // サブテーブル内のフィールド
      Object.entries(fieldProps.fields).forEach(([subCode, subField]) => {
        console.log(`  サブフィールド: ${subCode} - ${subField.type}`);
      });
      break;
  }
});
```

## フィールド設定の型定義

各フィールドタイプに対応した型定義を提供：

```typescript
import type {
  SingleLineTextFieldProperties,
  NumberFieldProperties,
  SubtableFieldProperties,
  // ... その他のフィールドタイプ
} from 'kintone-effect-schema';

// 型安全なフィールド設定の作成
const textFieldProps: SingleLineTextFieldProperties = {
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: '会社名',
  required: true,
  unique: true,
  minLength: '1',
  maxLength: '100',
  defaultValue: '',
};
```

## フィールド設定の更新とデプロイ

型安全にフィールド設定を更新し、デプロイする例：

```typescript
import { Schema } from 'effect';
import { 
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  type SingleLineTextFieldProperties,
  type NumberFieldProperties 
} from 'kintone-effect-schema';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';

const client = new KintoneRestAPIClient({
  baseUrl: 'https://example.cybozu.com',
  auth: { /* 認証情報 */ }
});

// 1. 新しいフィールドの追加
const newTextField: SingleLineTextFieldProperties = Schema.decodeUnknownSync(
  SingleLineTextFieldPropertiesSchema
)({
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: '会社名',
  required: true,
  unique: true,
  minLength: '1',
  maxLength: '100',
  defaultValue: ''
});

const newNumberField: NumberFieldProperties = Schema.decodeUnknownSync(
  NumberFieldPropertiesSchema
)({
  type: 'NUMBER',
  code: 'annual_revenue',
  label: '年間売上高',
  required: false,
  defaultValue: '0',
  digit: true,
  unit: '円',
  unitPosition: 'AFTER'
});

// 2. フィールド設定の更新
await client.app.updateFormFields({
  app: 1,
  properties: {
    company_name: newTextField,
    annual_revenue: newNumberField
  }
});

// 3. アプリのデプロイ
const { revision } = await client.app.deployApp({
  apps: [{ app: 1 }]
});

console.log(`アプリのデプロイを開始しました。リビジョン: ${revision}`);
```

## フィールド設定のコード生成

kintoneのフィールド設定をTypeScriptコードに変換して、バージョン管理や設定管理を行えます。

### 基本的な使い方

```typescript
import { fieldConfigToTypeScriptCode } from 'kintone-effect-schema';

// kintone APIから取得したフィールド設定
const fieldConfig = {
  type: 'SINGLE_LINE_TEXT',
  code: 'company_name',
  label: '会社名',
  required: true,
  unique: true,
  maxLength: '100',
  defaultValue: ''
};

// TypeScriptコードを生成
const tsCode = fieldConfigToTypeScriptCode(fieldConfig);
console.log(tsCode);

// 出力:
// export const companyNameField: SingleLineTextFieldProperties = {
//   type: 'SINGLE_LINE_TEXT',
//   code: 'company_name',
//   label: '会社名',
//   required: true,
//   unique: true,
//   maxLength: '100',
//   defaultValue: ''
// };
```

### 複数フィールドの変換

```typescript
import { fieldsConfigToTypeScriptCode } from 'kintone-effect-schema';

// kintoneからフィールド設定を取得
const formFields = await client.app.getFormFields({ app: 1 });

// 全フィールドのTypeScriptコードを生成
const tsCode = fieldsConfigToTypeScriptCode(formFields.properties);
console.log(tsCode);

// 出力:
// import type {
//   SingleLineTextFieldProperties,
//   NumberFieldProperties,
//   SubtableFieldProperties
// } from 'kintone-effect-schema';
//
// export const companyNameField: SingleLineTextFieldProperties = {
//   type: 'SINGLE_LINE_TEXT',
//   code: 'company_name',
//   label: '会社名',
//   required: true,
//   unique: true,
//   maxLength: '100',
//   defaultValue: ''
// };
//
// export const revenueField: NumberFieldProperties = {
//   type: 'NUMBER',
//   code: 'revenue',
//   label: '年間売上高',
//   required: false,
//   defaultValue: '0',
//   unit: '円',
//   unitPosition: 'AFTER',
//   digit: true
// };
//
// export const productsField: SubtableFieldProperties = {
//   type: 'SUBTABLE',
//   code: 'products',
//   fields: {
//     product_name: {
//       type: 'SINGLE_LINE_TEXT',
//       code: 'product_name',
//       label: '商品名',
//       required: true
//     },
//     quantity: {
//       type: 'NUMBER',
//       code: 'quantity',
//       label: '数量',
//       defaultValue: '1'
//     }
//   }
// };
//
// export const appFieldsConfig = {
//   properties: {
//     company_name: companyNameField,
//     revenue: revenueField,
//     products: productsField
//   }
// };
```

### ワークフロー例: kintone ↔ TypeScript

1. **kintoneからエクスポート**
   ```typescript
   // 現在のフィールド設定を取得
   const formFields = await client.app.getFormFields({ app: 1 });
   
   // TypeScriptコードを生成
   const tsCode = fieldsConfigToTypeScriptCode(formFields.properties);
   
   // ファイルに保存
   await fs.writeFile('src/config/app-fields.ts', tsCode);
   ```

2. **TypeScriptで編集**
   ```typescript
   // src/config/app-fields.ts
   export const companyNameField: SingleLineTextFieldProperties = {
     type: 'SINGLE_LINE_TEXT',
     code: 'company_name',
     label: '会社名（必須）', // ラベルを編集
     required: true,
     unique: true,
     maxLength: '200', // 最大文字数を増やす
     defaultValue: '新規会社' // デフォルト値を変更
   };
   ```

3. **kintoneに適用**
   ```typescript
   import { appFieldsConfig } from './config/app-fields';
   
   // フィールド設定を更新
   await client.app.updateFormFields({
     app: 1,
     properties: appFieldsConfig.properties
   });
   
   // 変更をデプロイ
   await client.app.deployApp({
     apps: [{ app: 1 }]
   });
   ```

### メリット

- **バージョン管理**: Gitでフィールド設定の変更を追跡
- **コードレビュー**: 設定変更を適用前にレビュー
- **環境管理**: 開発/ステージング/本番環境の設定を管理
- **型安全**: TypeScriptの型チェックと自動補完
- **ドキュメント化**: フィールド設定がそのままドキュメントになる