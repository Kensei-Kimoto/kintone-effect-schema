import { Schema } from 'effect'
import { KintoneFieldSchema } from './fields.js'

// サブテーブルのスキーマ
export const SubtableFieldSchema = Schema.Struct({
  type: Schema.Literal('SUBTABLE'),
  value: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      value: Schema.Record({
        key: Schema.String,
        value: KintoneFieldSchema
      }),
    })
  ),
})

// レコードのスキーマ
export const KintoneRecordSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Union(KintoneFieldSchema, SubtableFieldSchema)
})

// レコード取得時のレスポンススキーマ
export const GetRecordResponseSchema = Schema.Struct({
  record: KintoneRecordSchema,
})

// レコード一覧取得時のレスポンススキーマ
export const GetRecordsResponseSchema = Schema.Struct({
  records: Schema.Array(KintoneRecordSchema),
  totalCount: Schema.Union(Schema.String, Schema.Null),
})

// レコード追加/更新用のスキーマ（valueのみを持つ）
export const KintoneRecordForWriteSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    value: Schema.Unknown,
  })
})