import { Schema } from 'effect';

// kintone APIは数値プロパティを文字列として返す：
// - 設定なし: ""（空文字列）
// - 設定あり: "100"（数値文字列）
// ユーザー作成フィールドでは必ず存在し、システムフィールドでは省略される
const NumericStringSchema = Schema.String;


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
// - 半角の「$」（ドル記号） - システムフィールド用（$id, $revision など）
//
// 制限事項:
// - 予約語（ステータス、作業者、カテゴリー、__ROOT__、not）は使用不可
// - 先頭に半角数字は使用不可（保存時に「_」が自動付与される）
// - フォーム内での重複は不可（保存時に「_通し番号」が自動付与される）

// 予約語のリスト
const RESERVED_FIELD_CODES = new Set([
  'ステータス',
  '作業者',
  'カテゴリー',
  '__ROOT__',
  'not',
  'レコード番号',
  '作成者',
  '作成日時',
  '更新者',
  '更新日時',
]);

// システムフィールド用のフィールドコードスキーマ（予約語チェックなし）
const SystemFieldCodeSchema = Schema.String.pipe(
  Schema.pattern(
    /^[$ぁ-ん\u30A0-\u30FF\u3040-\u309F\u4E00-\u9FAF\uFF66-\uFF9FＡ-Ｚａ-ｚ０-９A-Za-z0-9_＿･・＄￥€￡￦¥]+$/
  ),
  Schema.minLength(1),
  Schema.filter((value) => !/^[0-9]/.test(value))
);

// ユーザー定義フィールド用のフィールドコードスキーマ（予約語チェックあり）
const UserFieldCodeSchema = SystemFieldCodeSchema.pipe(
  Schema.filter((value) => !RESERVED_FIELD_CODES.has(value))
);


// 基本的なフィールド設定プロパティ
const BaseFieldPropertiesSchema = Schema.Struct({
  type: Schema.String,
  code: UserFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  required: Schema.optional(Schema.Boolean),
});

// オプション定義
const OptionSchema = Schema.Struct({
  label: Schema.String,
  index: NumericStringSchema,
});

// エンティティ定義（ユーザー・組織・グループ選択用）
const EntitySchema = Schema.Struct({
  type: Schema.Literal('USER', 'ORGANIZATION', 'GROUP'),
  code: UserFieldCodeSchema,
});

// ルックアップ設定
const LookupSettingSchema = Schema.Struct({
  relatedApp: Schema.Struct({
    app: Schema.String,
    code: Schema.optional(Schema.String),
  }),
  relatedKeyField: Schema.String,
  fieldMappings: Schema.optional(
    Schema.Union(
      Schema.Array(
        Schema.Struct({
          field: Schema.String,
          relatedField: Schema.String,
        })
      ),
      Schema.Literal("")
    )
  ),
  lookupPickerFields: Schema.optional(
    Schema.Union(
      Schema.Array(Schema.String),
      Schema.Literal("")
    )
  ),
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
  size: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
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
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    unique: Schema.optional(Schema.Boolean),
    minLength: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    maxLength: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    expression: Schema.optional(Schema.String),
    hideExpression: Schema.optional(Schema.Boolean),
    lookup: Schema.optional(LookupSettingSchema),
  })
);

export const MultiLineTextFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_LINE_TEXT'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
  })
);

export const RichTextFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RICH_TEXT'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
  })
);

export const NumberFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('NUMBER'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    unique: Schema.optional(Schema.Boolean),
    minValue: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    maxValue: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    digit: Schema.optional(Schema.Boolean),
    displayScale: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    unit: Schema.String,  // kintone APIで空文字列として返される（必須）
    unitPosition: Schema.optional(Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'))),
    lookup: Schema.optional(LookupSettingSchema),
  })
);

export const CalcFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CALC'),
    expression: Schema.optional(Schema.String),
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
    displayScale: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    hideExpression: Schema.optional(Schema.Boolean),
    unit: Schema.String,  // kintone APIで空文字列として返される（必須）
    unitPosition: Schema.optional(Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'))),
  })
);

export const RadioButtonFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RADIO_BUTTON'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    align: Schema.optional(Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'))),
  })
);

export const CheckBoxFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CHECK_BOX'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.Array(Schema.String),  // kintone APIで空配列として返される（必須）
    align: Schema.optional(Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'))),
  })
);

export const MultiSelectFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_SELECT'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.Array(Schema.String),  // kintone APIで空配列として返される（必須）
  })
);

export const DropDownFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DROP_DOWN'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
  })
);

export const DateFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATE'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    unique: Schema.optional(Schema.Boolean),
    defaultNowValue: Schema.optional(Schema.Boolean),
    lookup: Schema.optional(LookupSettingSchema),
  })
);

export const TimeFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('TIME'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    defaultNowValue: Schema.optional(Schema.Boolean),
  })
);

export const DateTimeFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATETIME'),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    unique: Schema.optional(Schema.Boolean),
    defaultNowValue: Schema.optional(Schema.Boolean),
    lookup: Schema.optional(LookupSettingSchema),
  })
);

export const LinkFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('LINK'),
    protocol: Schema.Union(Schema.Literal('WEB'), Schema.Literal('CALL'), Schema.Literal('MAIL')),
    defaultValue: Schema.String,  // kintone APIで空文字列として返される（必須）
    unique: Schema.optional(Schema.Boolean),
    minLength: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
    maxLength: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
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
          code: UserFieldCodeSchema,
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
          code: UserFieldCodeSchema,
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
          code: UserFieldCodeSchema,
        })
      )
    ),
  })
);

export const FileFieldPropertiesSchema = Schema.extend(
  BaseFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('FILE'),
    thumbnailSize: NumericStringSchema,  // kintone APIで空文字列として返される（必須）
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
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const CreatorFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CREATOR'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const CreatedTimeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CREATED_TIME'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const ModifierFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('MODIFIER'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const UpdatedTimeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('UPDATED_TIME'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
});

export const StatusFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('STATUS'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

export const StatusAssigneeFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('STATUS_ASSIGNEE'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

export const CategoryFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('CATEGORY'),
  code: SystemFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  enabled: Schema.optional(Schema.Boolean),
});

// サブテーブル専用フィールドスキーマ
// サブテーブル内では空値を空文字列として返すため、通常フィールドとは異なるスキーマが必要

// サブテーブル用の基本フィールドプロパティ
const BaseSubtableFieldPropertiesSchema = Schema.Struct({
  type: Schema.String,
  code: UserFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.Boolean,  // 必ず存在
  required: Schema.Boolean, // 必ず存在
});

// サブテーブル用SINGLE_LINE_TEXT
export const SubtableSingleLineTextFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('SINGLE_LINE_TEXT'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
    unique: Schema.Boolean,       // 必ず存在
    minLength: NumericStringSchema,  // 空文字列または数値文字列（必ず存在）
    maxLength: NumericStringSchema,  // 空文字列または数値文字列（必ず存在）
    expression: Schema.String,       // 空文字列または式（必ず存在）
    hideExpression: Schema.Boolean,  // 必ず存在
  })
);

// サブテーブル用MULTI_LINE_TEXT
export const SubtableMultiLineTextFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_LINE_TEXT'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
  })
);

// サブテーブル用RICH_TEXT
export const SubtableRichTextFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RICH_TEXT'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
  })
);

// サブテーブル用NUMBER
export const SubtableNumberFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('NUMBER'),
    defaultValue: Schema.String,     // 空文字列または値（必ず存在）
    unique: Schema.Boolean,          // 必ず存在
    minValue: NumericStringSchema,   // 空文字列または数値文字列（必ず存在）
    maxValue: NumericStringSchema,   // 空文字列または数値文字列（必ず存在）
    digit: Schema.Boolean,           // 必ず存在
    displayScale: NumericStringSchema, // 空文字列または数値文字列（必ず存在）
    unit: Schema.String,             // 空文字列または値（必ず存在）
    unitPosition: Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'), Schema.Literal('')), // 必ず存在
  })
);

// サブテーブル用CALC
export const SubtableCalcFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CALC'),
    expression: Schema.String,  // 空文字列または式（必ず存在）
    format: Schema.Union(
      Schema.Literal('NUMBER'),
      Schema.Literal('NUMBER_DIGIT'),
      Schema.Literal('DATETIME'),
      Schema.Literal('DATE'),
      Schema.Literal('TIME'),
      Schema.Literal('HOUR_MINUTE'),
      Schema.Literal('DAY_HOUR_MINUTE'),
      Schema.Literal('')
    ), // 必ず存在
    displayScale: NumericStringSchema, // 空文字列または数値文字列（必ず存在）
    hideExpression: Schema.Boolean,    // 必ず存在
    unit: Schema.String,               // 空文字列または値（必ず存在）
    unitPosition: Schema.Union(Schema.Literal('BEFORE'), Schema.Literal('AFTER'), Schema.Literal('')), // 必ず存在
  })
);

// サブテーブル用RADIO_BUTTON
export const SubtableRadioButtonFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('RADIO_BUTTON'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
    align: Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'), Schema.Literal('')), // 必ず存在
  })
);

// サブテーブル用CHECK_BOX
export const SubtableCheckBoxFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('CHECK_BOX'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.Array(Schema.String), // 配列（必ず存在、空配列の場合もある）
    align: Schema.Union(Schema.Literal('HORIZONTAL'), Schema.Literal('VERTICAL'), Schema.Literal('')), // 必ず存在
  })
);

// サブテーブル用MULTI_SELECT
export const SubtableMultiSelectFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('MULTI_SELECT'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.Array(Schema.String), // 配列（必ず存在、空配列の場合もある）
  })
);

// サブテーブル用DROP_DOWN
export const SubtableDropDownFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DROP_DOWN'),
    options: Schema.Record({ key: Schema.String, value: OptionSchema }),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
  })
);

// サブテーブル用DATE
export const SubtableDateFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATE'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
    unique: Schema.Boolean,       // 必ず存在
    defaultNowValue: Schema.Boolean, // 必ず存在
  })
);

// サブテーブル用TIME
export const SubtableTimeFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('TIME'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
    defaultNowValue: Schema.Boolean, // 必ず存在
  })
);

// サブテーブル用DATETIME
export const SubtableDateTimeFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('DATETIME'),
    defaultValue: Schema.String,  // 空文字列または値（必ず存在）
    unique: Schema.Boolean,       // 必ず存在
    defaultNowValue: Schema.Boolean, // 必ず存在
  })
);

// サブテーブル用LINK
export const SubtableLinkFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('LINK'),
    protocol: Schema.Union(Schema.Literal('WEB'), Schema.Literal('CALL'), Schema.Literal('MAIL')),
    defaultValue: Schema.String,     // 空文字列または値
    unique: Schema.Boolean,          // 必ず存在
    minLength: NumericStringSchema,  // 空文字列または数値文字列（必ず存在）
    maxLength: NumericStringSchema,  // 空文字列または数値文字列（必ず存在）
  })
);

// サブテーブル用USER_SELECT
export const SubtableUserSelectFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('USER_SELECT'),
    entities: Schema.Array(EntitySchema), // サブテーブルでは必ず存在（空配列の場合もある）
    defaultValue: Schema.Array(
      Schema.Struct({
        type: Schema.Union(
          Schema.Literal('USER'),
          Schema.Literal('ORGANIZATION'),
          Schema.Literal('GROUP')
        ),
        code: UserFieldCodeSchema,
      })
    ), // サブテーブルでは必ず存在（空配列の場合もある）
  })
);

// サブテーブル用ORGANIZATION_SELECT
export const SubtableOrganizationSelectFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('ORGANIZATION_SELECT'),
    entities: Schema.Array(EntitySchema), // サブテーブルでは必ず存在（空配列の場合もある）
    defaultValue: Schema.Array(
      Schema.Struct({
        type: Schema.Literal('ORGANIZATION'),
        code: UserFieldCodeSchema,
      })
    ), // サブテーブルでは必ず存在（空配列の場合もある）
  })
);

// サブテーブル用GROUP_SELECT
export const SubtableGroupSelectFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('GROUP_SELECT'),
    entities: Schema.Array(EntitySchema), // サブテーブルでは必ず存在（空配列の場合もある）
    defaultValue: Schema.Array(
      Schema.Struct({
        type: Schema.Literal('GROUP'),
        code: UserFieldCodeSchema,
      })
    ), // サブテーブルでは必ず存在（空配列の場合もある）
  })
);

// サブテーブル用FILE
export const SubtableFileFieldPropertiesSchema = Schema.extend(
  BaseSubtableFieldPropertiesSchema,
  Schema.Struct({
    type: Schema.Literal('FILE'),
    thumbnailSize: NumericStringSchema,  // サブテーブルでは必ず存在（空文字列の場合もある）
  })
);

// サブテーブル内で使用可能なフィールドのUnion
export const SubtableFieldSchema = Schema.Union(
  SubtableSingleLineTextFieldPropertiesSchema,
  SubtableMultiLineTextFieldPropertiesSchema,
  SubtableRichTextFieldPropertiesSchema,
  SubtableNumberFieldPropertiesSchema,
  SubtableCalcFieldPropertiesSchema,
  SubtableRadioButtonFieldPropertiesSchema,
  SubtableCheckBoxFieldPropertiesSchema,
  SubtableMultiSelectFieldPropertiesSchema,
  SubtableDropDownFieldPropertiesSchema,
  SubtableDateFieldPropertiesSchema,
  SubtableTimeFieldPropertiesSchema,
  SubtableDateTimeFieldPropertiesSchema,
  SubtableLinkFieldPropertiesSchema,
  SubtableUserSelectFieldPropertiesSchema,
  SubtableOrganizationSelectFieldPropertiesSchema,
  SubtableGroupSelectFieldPropertiesSchema,
  SubtableFileFieldPropertiesSchema
);

// レイアウトフィールド
export const SubtableFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('SUBTABLE'),
  code: UserFieldCodeSchema,
  fields: Schema.Record({
    key: Schema.String,
    value: SubtableFieldSchema,
  }),
});

export const GroupFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('GROUP'),
  code: UserFieldCodeSchema,
  label: Schema.String,
  noLabel: Schema.optional(Schema.Boolean),
  openGroup: Schema.optional(Schema.Boolean),
});

export const RecordIdFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('RECORD_ID'),
  code: UserFieldCodeSchema,
  label: Schema.String,
});

export const RevisionFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('REVISION'),
  code: UserFieldCodeSchema,
  label: Schema.String,
});

// 特殊なシステムフィールド（$id, $revision）
export const SystemIdFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('__ID__'),
  code: Schema.Literal('$id'),
  label: Schema.String,
});

export const SystemRevisionFieldPropertiesSchema = Schema.Struct({
  type: Schema.Literal('__REVISION__'),
  code: Schema.Literal('$revision'),
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
  ReferenceTableFieldPropertiesSchema,
  RecordNumberFieldPropertiesSchema,
  CreatorFieldPropertiesSchema,
  CreatedTimeFieldPropertiesSchema,
  ModifierFieldPropertiesSchema,
  UpdatedTimeFieldPropertiesSchema,
  StatusFieldPropertiesSchema,
  StatusAssigneeFieldPropertiesSchema,
  CategoryFieldPropertiesSchema,
  SubtableFieldPropertiesSchema,
  GroupFieldPropertiesSchema,
  RecordIdFieldPropertiesSchema,
  RevisionFieldPropertiesSchema,
  SystemIdFieldPropertiesSchema,
  SystemRevisionFieldPropertiesSchema,
  SpacerFieldPropertiesSchema,
  LabelFieldPropertiesSchema
);

// フォームフィールド取得APIのレスポンススキーマ
export const GetFormFieldsResponseSchema = Schema.Struct({
  properties: Schema.Record({
    key: Schema.String,
    value: KintoneFieldPropertiesSchema,
  }),
  revision: Schema.optional(Schema.String),
});

// 型定義のエクスポート
export type SingleLineTextFieldProperties = Schema.Schema.Type<
  typeof SingleLineTextFieldPropertiesSchema
>;
export type MultiLineTextFieldProperties = Schema.Schema.Type<
  typeof MultiLineTextFieldPropertiesSchema
>;
export type RichTextFieldProperties = Schema.Schema.Type<typeof RichTextFieldPropertiesSchema>;
export type NumberFieldProperties = Schema.Schema.Type<typeof NumberFieldPropertiesSchema>;
export type CalcFieldProperties = Schema.Schema.Type<typeof CalcFieldPropertiesSchema>;
export type RadioButtonFieldProperties = Schema.Schema.Type<
  typeof RadioButtonFieldPropertiesSchema
>;
export type CheckBoxFieldProperties = Schema.Schema.Type<typeof CheckBoxFieldPropertiesSchema>;
export type MultiSelectFieldProperties = Schema.Schema.Type<
  typeof MultiSelectFieldPropertiesSchema
>;
export type DropDownFieldProperties = Schema.Schema.Type<typeof DropDownFieldPropertiesSchema>;
export type DateFieldProperties = Schema.Schema.Type<typeof DateFieldPropertiesSchema>;
export type TimeFieldProperties = Schema.Schema.Type<typeof TimeFieldPropertiesSchema>;
export type DateTimeFieldProperties = Schema.Schema.Type<typeof DateTimeFieldPropertiesSchema>;
export type LinkFieldProperties = Schema.Schema.Type<typeof LinkFieldPropertiesSchema>;
export type UserSelectFieldProperties = Schema.Schema.Type<typeof UserSelectFieldPropertiesSchema>;
export type OrganizationSelectFieldProperties = Schema.Schema.Type<
  typeof OrganizationSelectFieldPropertiesSchema
>;
export type GroupSelectFieldProperties = Schema.Schema.Type<
  typeof GroupSelectFieldPropertiesSchema
>;
export type FileFieldProperties = Schema.Schema.Type<typeof FileFieldPropertiesSchema>;
export type ReferenceTableFieldProperties = Schema.Schema.Type<
  typeof ReferenceTableFieldPropertiesSchema
>;
export type RecordNumberFieldProperties = Schema.Schema.Type<
  typeof RecordNumberFieldPropertiesSchema
>;
export type CreatorFieldProperties = Schema.Schema.Type<typeof CreatorFieldPropertiesSchema>;
export type CreatedTimeFieldProperties = Schema.Schema.Type<
  typeof CreatedTimeFieldPropertiesSchema
>;
export type ModifierFieldProperties = Schema.Schema.Type<typeof ModifierFieldPropertiesSchema>;
export type UpdatedTimeFieldProperties = Schema.Schema.Type<
  typeof UpdatedTimeFieldPropertiesSchema
>;
export type StatusFieldProperties = Schema.Schema.Type<typeof StatusFieldPropertiesSchema>;
export type StatusAssigneeFieldProperties = Schema.Schema.Type<
  typeof StatusAssigneeFieldPropertiesSchema
>;
export type CategoryFieldProperties = Schema.Schema.Type<typeof CategoryFieldPropertiesSchema>;
export type SubtableFieldProperties = Schema.Schema.Type<typeof SubtableFieldPropertiesSchema>;
export type GroupFieldProperties = Schema.Schema.Type<typeof GroupFieldPropertiesSchema>;
export type RecordIdFieldProperties = Schema.Schema.Type<typeof RecordIdFieldPropertiesSchema>;
export type RevisionFieldProperties = Schema.Schema.Type<typeof RevisionFieldPropertiesSchema>;
export type SystemIdFieldProperties = Schema.Schema.Type<typeof SystemIdFieldPropertiesSchema>;
export type SystemRevisionFieldProperties = Schema.Schema.Type<typeof SystemRevisionFieldPropertiesSchema>;
export type SpacerFieldProperties = Schema.Schema.Type<typeof SpacerFieldPropertiesSchema>;
export type LabelFieldProperties = Schema.Schema.Type<typeof LabelFieldPropertiesSchema>;
export type KintoneFieldProperties = Schema.Schema.Type<typeof KintoneFieldPropertiesSchema>;
export type GetFormFieldsResponse = Schema.Schema.Type<typeof GetFormFieldsResponseSchema>;

// フィールドコードスキーマのエクスポート
export { SystemFieldCodeSchema, UserFieldCodeSchema };
