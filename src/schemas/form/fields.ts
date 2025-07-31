import { Schema } from 'effect';

// フィールドコードのバリデーション
// 使用可能な文字:
// - ひらがな
// - カタカナ（半角／全角）
// - 漢字
// - 英数字（半角／全角）
// - 半角の「_」（アンダースコア）
// - 全角の「＿」（アンダースコア）
// - 半角の「･」（中黒）
// - 全角の「・」（中黒）
// - 全角の通貨記号（＄や￥など）
//
// 制限事項:
// - 予約語（ステータス、作業者、カテゴリー、__ROOT__、not）は使用不可
// - 先頭に半角数字は使用不可（保存時に「_」が自動付与される）
// - フォーム内での重複は不可（保存時に「_通し番号」が自動付与される）

// 予約語のリスト
const RESERVED_FIELD_CODES = new Set(['ステータス', '作業者', 'カテゴリー', '__ROOT__', 'not']);

const KintoneFieldCodeSchema = Schema.String.pipe(
  Schema.pattern(
    /^[ぁ-ん\u30A0-\u30FF\u3040-\u309F\u4E00-\u9FAF\uFF66-\uFF9FＡ-Ｚａ-ｚ０-９A-Za-z0-9_＿･・＄￥€￡￦¥]+$/
  ),
  Schema.minLength(1),
  Schema.filter((value) => !RESERVED_FIELD_CODES.has(value)),
  Schema.filter((value) => !/^[0-9]/.test(value))
);

// 基本的なフィールド設定プロパティ
const BaseFieldPropertiesSchema = Schema.Struct({
  type: Schema.String,
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  required: Schema.optional(Schema.Boolean),
});

// オプション定義
const OptionSchema = Schema.Struct({
  label: Schema.String,
  index: Schema.Union(Schema.Number, Schema.String),
});

// エンティティ定義（ユーザー・組織・グループ選択用）
const EntitySchema = Schema.Struct({
  type: Schema.Literal('USER', 'ORGANIZATION', 'GROUP'),
  code: KintoneFieldCodeSchema,
});

// ルックアップ設定
const LookupSettingSchema = Schema.Struct({
  relatedApp: Schema.Struct({
    app: Schema.String,
    code: Schema.optional(Schema.String),
  }),
  relatedKeyField: Schema.String,
  fieldMappings: Schema.Array(
    Schema.Struct({
      field: Schema.String,
      relatedField: Schema.String,
    })
  ),
  lookupPickerFields: Schema.Array(Schema.String),
  filterCond: Schema.optional(Schema.String),
  sort: Schema.optional(Schema.String),
});

// 関連レコード一覧設定
const ReferenceTableSettingSchema = Schema.Struct({
  relatedApp: Schema.Struct({
    app: Schema.String,
    code: Schema.optional(Schema.String),
  }),
  condition: Schema.Struct({
    field: Schema.String,
    relatedField: Schema.String,
  }),
  filterCond: Schema.optional(Schema.String),
  displayFields: Schema.Array(Schema.String),
  sort: Schema.optional(Schema.String),
  size: Schema.optional(Schema.Number),
});

// 各フィールドタイプの設定スキーマ

/**
 * 文字列（1行）フィールドプロパティ
 * @example
 * {
 *   type: 'SINGLE_LINE_TEXT',
 *   code: 'company_name',
 *   label: '会社名',
 *   required: true,
 *   unique: true,
 *   minLength: '1',
 *   maxLength: '100'
 * }
 */
export const SingleLineTextFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('SINGLE_LINE_TEXT'),
    defaultValue: Schema.optional(Schema.String),
    unique: Schema.optional(Schema.Boolean),
    minLength: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    maxLength: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    expression: Schema.optional(Schema.String),
    hideExpression: Schema.optional(Schema.Boolean),
  })
);

export const MultiLineTextFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_LINE_TEXT'),
    defaultValue: Schema.optional(Schema.String),
  })
);

export const RichTextFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RICH_TEXT'),
    defaultValue: Schema.optional(Schema.String),
  })
);

export const NumberFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('NUMBER'),
    defaultValue: Schema.optional(Schema.String),
    unique: Schema.optional(Schema.Boolean),
    minValue: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    maxValue: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    digit: Schema.optional(Schema.Boolean),
    displayScale: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    unit: Schema.optional(Schema.String),
    unitPosition: Schema.optional(Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'))),
  })
);

export const CalcFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CALC'),
    expression: Schema.String,
    format: Schema.optional(
      Schema.Union(
        Schema.Literal('NUMBER'),
        Schema.Literal('NUMBER_DIGIT'),
        Schema.Literal('DATETIME'),
        Schema.Literal('DATE'),
        Schema.Literal('TIME'),
        Schema.Literal('HOUR_MINUTE'),
        Schema.Literal('DAY_HOUR_MINUTE')
      )
    ),
    displayScale: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    hideExpression: Schema.optional(Schema.Boolean),
    unit: Schema.optional(Schema.String),
    unitPosition: Schema.optional(Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'))),
  })
);

export const RadioButtonFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RADIO_BUTTON'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.optional(Schema.String),
    align: Schema.optional(Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'))),
  })
);

export const CheckBoxFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CHECK_BOX'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.optional(Schema.Array(Schema.String)),
    align: Schema.optional(Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'))),
  })
);

export const MultiSelectFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_SELECT'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.optional(Schema.Array(Schema.String)),
  })
);

export const DropDownFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DROP_DOWN'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.optional(Schema.String),
  })
);

export const DateFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATE'),
    defaultValue: Schema.optional(Schema.String),
    unique: Schema.optional(Schema.Boolean),
    defaultNowValue: Schema.optional(Schema.Boolean),
  })
);

export const TimeFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('TIME'),
    defaultValue: Schema.optional(Schema.String),
    defaultNowValue: Schema.optional(Schema.Boolean),
  })
);

export const DateTimeFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATETIME'),
    defaultValue: Schema.optional(Schema.String),
    unique: Schema.optional(Schema.Boolean),
    defaultNowValue: Schema.optional(Schema.Boolean),
  })
);

export const LinkFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('LINK'),
    protocol: Schema.Union(Schema.Literal('WEB'), Schema.Literal('CALL'), Schema.Literal('MAIL')),
    defaultValue: Schema.optional(Schema.String),
    unique: Schema.optional(Schema.Boolean),
    minLength: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
    maxLength: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
  })
);

export const UserSelectFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('USER_SELECT'),
    entities: Schema.optional(Schema.Array(EntitySchema)),
    defaultValue: Schema.optional(
      Schema.Array(
        Schema.Struct({
          type: Schema.Union(
            Schema.Literal('USER'),
            Schema.Literal('ORGANIZATION'),
            Schema.Literal('GROUP')
          ),
          code: KintoneFieldCodeSchema,
        })
      )
    ),
  })
);

export const OrganizationSelectFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('ORGANIZATION_SELECT'),
    entities: Schema.optional(Schema.Array(EntitySchema)),
    defaultValue: Schema.optional(
      Schema.Array(
        Schema.Struct({
          type: Schema.Literal('ORGANIZATION'),
          code: KintoneFieldCodeSchema,
        })
      )
    ),
  })
);

export const GroupSelectFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('GROUP_SELECT'),
    entities: Schema.optional(Schema.Array(EntitySchema)),
    defaultValue: Schema.optional(
      Schema.Array(
        Schema.Struct({
          type: Schema.Literal('GROUP'),
          code: KintoneFieldCodeSchema,
        })
      )
    ),
  })
);

export const FileFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('FILE'),
    thumbnailSize: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
  })
);

export const LookupFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('LOOKUP'),
    lookup: Schema.optional(LookupSettingSchema),
  })
);

export const ReferenceTableFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('REFERENCE_TABLE'),
    referenceTable: Schema.optional(ReferenceTableSettingSchema),
  })
);

// システムフィールド
export const RecordNumberFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('RECORD_NUMBER'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const CreatorFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CREATOR'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const CreatedTimeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CREATED_TIME'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const ModifierFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('MODIFIER'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const UpdatedTimeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('UPDATED_TIME'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const StatusFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('STATUS'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

export const StatusAssigneeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('STATUS_ASSIGNEE'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

export const CategoryFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CATEGORY'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

// サブテーブル内で使用可能なフィールドタイプ
// サブテーブル内では以下のフィールドタイプのみ使用可能:
// - SINGLE_LINE_TEXT（文字列1行）
// - NUMBER（数値）
// - CALC（計算）
// - MULTI_LINE_TEXT（文字列複数行）
// - RICH_TEXT（リッチテキスト）
// - CHECK_BOX（チェックボックス）
// - RADIO_BUTTON（ラジオボタン）
// - DROP_DOWN（ドロップダウン）
// - MULTI_SELECT（複数選択）
// - DATE（日付）
// - TIME（時刻）
// - DATETIME（日時）
// - LINK（リンク）
export const SubtableFieldSchema = Schema.Union(
  SingleLineTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  CalcFieldPropertiesSchema,
  MultiLineTextFieldPropertiesSchema,
  RichTextFieldPropertiesSchema,
  CheckBoxFieldPropertiesSchema,
  RadioButtonFieldPropertiesSchema,
  DropDownFieldPropertiesSchema,
  MultiSelectFieldPropertiesSchema,
  DateFieldPropertiesSchema,
  TimeFieldPropertiesSchema,
  DateTimeFieldPropertiesSchema,
  LinkFieldPropertiesSchema
);

// レイアウトフィールド
export const SubtableFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('SUBTABLE'),
  code: KintoneFieldCodeSchema,
  fields: Schema.Record({
    key: Schema.String,
    value: SubtableFieldSchema,
  }),
});

export const GroupFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('GROUP'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  openGroup: Schema.optional(Schema.Boolean),
});

export const RecordIdFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('RECORD_ID'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
});

export const RevisionFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('REVISION'),
  code: KintoneFieldCodeSchema,
  label: Schema.String,
});

export const SpacerFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('SPACER'),
  elementId: Schema.String,
  size: Schema.Struct({
    width: Schema.Union(Schema.Number, Schema.String),
    height: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
  }),
});

export const LabelFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('LABEL'),
  label: Schema.String,
  size: Schema.Struct({
    width: Schema.Union(Schema.Number, Schema.String),
  }),
});

// 全フィールドタイプのUnion
export const KintoneFieldPropertiesSchema = Schema.Union(
  SingleLineTextFieldPropertiesSchema,
  MultiLineTextFieldPropertiesSchema,
  RichTextFieldPropertiesSchema,
  NumberFieldPropertiesSchema,
  CalcFieldPropertiesSchema,
  RadioButtonFieldPropertiesSchema,
  CheckBoxFieldPropertiesSchema,
  MultiSelectFieldPropertiesSchema,
  DropDownFieldPropertiesSchema,
  DateFieldPropertiesSchema,
  TimeFieldPropertiesSchema,
  DateTimeFieldPropertiesSchema,
  LinkFieldPropertiesSchema,
  UserSelectFieldPropertiesSchema,
  OrganizationSelectFieldPropertiesSchema,
  GroupSelectFieldPropertiesSchema,
  FileFieldPropertiesSchema,
  LookupFieldPropertiesSchema,
  ReferenceTableFieldPropertiesSchema,
  RecordNumberFieldPropertiesSchema,
  CreatorFieldPropertiesSchema,
  CreatedTimeFieldPropertiesSchema,
  ModifierFieldPropertiesSchema,
  UpdatedTimeFieldPropertiesSchema,
  StatusFieldPropertiesSchema,
  StatusAssigneeFieldPropertiesSchema,
  CategoryFieldPropertiesSchema,
  GroupFieldPropertiesSchema,
  RecordIdFieldPropertiesSchema,
  RevisionFieldPropertiesSchema,
  SpacerFieldPropertiesSchema,
  LabelFieldPropertiesSchema
);

// フォームフィールド取得APIのレスポンススキーマ
export const GetFormFieldsResponseSchema = Schema.Struct({
  properties: Schema.Record({
    key: Schema.String,
    value: Schema.Union(KintoneFieldPropertiesSchema, SubtableFieldPropertiesSchema),
  }),
  revision: Schema.optional(Schema.String),
});

// 型定義のエクスポート
export type SingleLineTextFieldProperties = Schema.Schema.Type<typeof SingleLineTextFieldPropertiesSchema>;
export type MultiLineTextFieldProperties = Schema.Schema.Type<typeof MultiLineTextFieldPropertiesSchema>;
export type RichTextFieldProperties = Schema.Schema.Type<typeof RichTextFieldPropertiesSchema>;
export type NumberFieldProperties = Schema.Schema.Type<typeof NumberFieldPropertiesSchema>;
export type CalcFieldProperties = Schema.Schema.Type<typeof CalcFieldPropertiesSchema>;
export type RadioButtonFieldProperties = Schema.Schema.Type<typeof RadioButtonFieldPropertiesSchema>;
export type CheckBoxFieldProperties = Schema.Schema.Type<typeof CheckBoxFieldPropertiesSchema>;
export type MultiSelectFieldProperties = Schema.Schema.Type<typeof MultiSelectFieldPropertiesSchema>;
export type DropDownFieldProperties = Schema.Schema.Type<typeof DropDownFieldPropertiesSchema>;
export type DateFieldProperties = Schema.Schema.Type<typeof DateFieldPropertiesSchema>;
export type TimeFieldProperties = Schema.Schema.Type<typeof TimeFieldPropertiesSchema>;
export type DateTimeFieldProperties = Schema.Schema.Type<typeof DateTimeFieldPropertiesSchema>;
export type LinkFieldProperties = Schema.Schema.Type<typeof LinkFieldPropertiesSchema>;
export type UserSelectFieldProperties = Schema.Schema.Type<typeof UserSelectFieldPropertiesSchema>;
export type OrganizationSelectFieldProperties = Schema.Schema.Type<typeof OrganizationSelectFieldPropertiesSchema>;
export type GroupSelectFieldProperties = Schema.Schema.Type<typeof GroupSelectFieldPropertiesSchema>;
export type FileFieldProperties = Schema.Schema.Type<typeof FileFieldPropertiesSchema>;
export type LookupFieldProperties = Schema.Schema.Type<typeof LookupFieldPropertiesSchema>;
export type ReferenceTableFieldProperties = Schema.Schema.Type<typeof ReferenceTableFieldPropertiesSchema>;
export type RecordNumberFieldProperties = Schema.Schema.Type<typeof RecordNumberFieldPropertiesSchema>;
export type CreatorFieldProperties = Schema.Schema.Type<typeof CreatorFieldPropertiesSchema>;
export type CreatedTimeFieldProperties = Schema.Schema.Type<typeof CreatedTimeFieldPropertiesSchema>;
export type ModifierFieldProperties = Schema.Schema.Type<typeof ModifierFieldPropertiesSchema>;
export type UpdatedTimeFieldProperties = Schema.Schema.Type<typeof UpdatedTimeFieldPropertiesSchema>;
export type StatusFieldProperties = Schema.Schema.Type<typeof StatusFieldPropertiesSchema>;
export type StatusAssigneeFieldProperties = Schema.Schema.Type<typeof StatusAssigneeFieldPropertiesSchema>;
export type CategoryFieldProperties = Schema.Schema.Type<typeof CategoryFieldPropertiesSchema>;
export type SubtableFieldProperties = Schema.Schema.Type<typeof SubtableFieldPropertiesSchema>;
export type GroupFieldProperties = Schema.Schema.Type<typeof GroupFieldPropertiesSchema>;
export type RecordIdFieldProperties = Schema.Schema.Type<typeof RecordIdFieldPropertiesSchema>;
export type RevisionFieldProperties = Schema.Schema.Type<typeof RevisionFieldPropertiesSchema>;
export type SpacerFieldProperties = Schema.Schema.Type<typeof SpacerFieldPropertiesSchema>;
export type LabelFieldProperties = Schema.Schema.Type<typeof LabelFieldPropertiesSchema>;
export type KintoneFieldProperties = Schema.Schema.Type<typeof KintoneFieldPropertiesSchema>;
export type GetFormFieldsResponse = Schema.Schema.Type<typeof GetFormFieldsResponseSchema>;
