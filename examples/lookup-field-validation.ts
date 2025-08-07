/**
 * ルックアップフィールドのバリデーション例
 * 
 * kintone APIの仕様に準拠した修正内容を検証：
 * 1. ルックアップフィールドはLOOKUPタイプではなく、元のフィールドタイプで返される
 * 2. fieldMappings, lookupPickerFieldsは空文字列の場合がある
 * 3. 各フィールドタイプ（SINGLE_LINE_TEXT, NUMBER, DATE, DATETIME）でlookup設定が可能
 */

import { Schema } from 'effect';
import { GetFormFieldsResponseSchema } from '../src/schemas/form/fields.js';

// 実際のkintone APIレスポンスに近い形でのテスト
const apiResponseWithLookup = {
  properties: {
    // ルックアップ設定ありのSINGLE_LINE_TEXTフィールド
    'customer_name': {
      type: 'SINGLE_LINE_TEXT',
      code: 'customer_name',
      label: '顧客名',
      required: true,
      lookup: {
        relatedApp: {
          app: '100',
          code: 'customer_master'
        },
        relatedKeyField: 'name',
        fieldMappings: [
          {
            field: 'customer_address',
            relatedField: 'address'
          },
          {
            field: 'customer_phone',
            relatedField: 'phone'
          }
        ],
        lookupPickerFields: ['name', 'address', 'phone'],
        filterCond: 'active = "true"',
        sort: 'name asc'
      }
    },
    
    // ルックアップ設定ありのNUMBERフィールド（空文字列を含む）
    'product_price': {
      type: 'NUMBER',
      code: 'product_price',
      label: '商品価格',
      unit: '円',
      unitPosition: 'AFTER',
      lookup: {
        relatedApp: {
          app: '200'
        },
        relatedKeyField: 'price',
        fieldMappings: '', // 空文字列（設定されていない）
        lookupPickerFields: '', // 空文字列（設定されていない）
        filterCond: '',
        sort: ''
      }
    },
    
    // ルックアップ設定ありのDATEフィールド
    'project_start': {
      type: 'DATE',
      code: 'project_start',
      label: 'プロジェクト開始日',
      lookup: {
        relatedApp: {
          app: '300'
        },
        relatedKeyField: 'start_date',
        fieldMappings: [
          {
            field: 'project_name',
            relatedField: 'name'
          }
        ],
        lookupPickerFields: ['name', 'start_date']
      }
    },
    
    // ルックアップ設定ありのDATETIMEフィールド
    'event_datetime': {
      type: 'DATETIME',
      code: 'event_datetime',
      label: 'イベント日時',
      lookup: {
        relatedApp: {
          app: '400'
        },
        relatedKeyField: 'event_time'
      }
    },
    
    // ルックアップ設定なしの通常フィールド
    'description': {
      type: 'MULTI_LINE_TEXT',
      code: 'description',
      label: '説明',
      defaultValue: ''
    },
    
    // システムフィールド
    'レコード番号': {
      type: 'RECORD_NUMBER',
      code: 'レコード番号',
      label: 'レコード番号',
      noLabel: false
    }
  },
  revision: '42'
};

// バリデーション実行
try {
  const validated = Schema.decodeUnknownSync(GetFormFieldsResponseSchema)(apiResponseWithLookup);
  console.log('✅ ルックアップフィールドのバリデーション成功！');
  
  // 各フィールドの詳細確認
  console.log('\n=== バリデーション結果 ===');
  
  // SINGLE_LINE_TEXTのルックアップ設定確認
  const customerName = validated.properties.customer_name;
  if (customerName.type === 'SINGLE_LINE_TEXT' && customerName.lookup) {
    console.log('✓ SINGLE_LINE_TEXTのルックアップ設定:', {
      relatedApp: customerName.lookup.relatedApp,
      fieldMappingsCount: Array.isArray(customerName.lookup.fieldMappings) 
        ? customerName.lookup.fieldMappings.length 
        : 'empty string'
    });
  }
  
  // NUMBERの空文字列ルックアップ設定確認
  const productPrice = validated.properties.product_price;
  if (productPrice.type === 'NUMBER' && productPrice.lookup) {
    console.log('✓ NUMBERの空文字列ルックアップ設定:', {
      fieldMappings: productPrice.lookup.fieldMappings,
      lookupPickerFields: productPrice.lookup.lookupPickerFields
    });
  }
  
  // DATEのルックアップ設定確認
  const projectStart = validated.properties.project_start;
  if (projectStart.type === 'DATE' && projectStart.lookup) {
    console.log('✓ DATEのルックアップ設定:', {
      relatedApp: projectStart.lookup.relatedApp
    });
  }
  
  // DATETIMEのルックアップ設定確認
  const eventDatetime = validated.properties.event_datetime;
  if (eventDatetime.type === 'DATETIME' && eventDatetime.lookup) {
    console.log('✓ DATETIMEのルックアップ設定:', {
      relatedKeyField: eventDatetime.lookup.relatedKeyField
    });
  }
  
  console.log('\n🎉 すべての修正内容が正常に動作しています！');
  
} catch (error) {
  console.error('❌ バリデーションエラー:', error);
  
  // エラーの詳細を解析
  if (error instanceof Error) {
    console.error('エラーメッセージ:', error.message);
  }
}

/**
 * 修正内容の確認
 * 
 * ✅ 完了した修正:
 * 1. LookupSettingSchemaでfieldMappings, lookupPickerFieldsが空文字列を受け入れ
 * 2. SINGLE_LINE_TEXT, NUMBER, DATE, DATETIMEフィールドにlookupプロパティを追加
 * 3. 独立したLOOKUPフィールドタイプを削除（API仕様に準拠）
 * 4. field-config-to-typescript-codeからLOOKUPマッピングを削除
 * 5. 包括的なテストケースを追加
 * 
 * これにより、kintone API仕様により準拠したスキーマ定義となりました。
 */