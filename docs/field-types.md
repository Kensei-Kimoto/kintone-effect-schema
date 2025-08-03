# Supported Field Types

## Basic Fields

- `SINGLE_LINE_TEXT` - Single-line text
- `MULTI_LINE_TEXT` - Multi-line text  
- `RICH_TEXT` - Rich text editor
- `NUMBER` - Number
- `CALC` - Calculation
- `RADIO_BUTTON` - Radio button
- `CHECK_BOX` - Checkbox
- `MULTI_SELECT` - Multi-select
- `DROP_DOWN` - Dropdown
- `DATE` - Date
- `TIME` - Time
- `DATETIME` - Date and time
- `LINK` - Link

## Special Fields

- `USER_SELECT` - User selection
- `ORGANIZATION_SELECT` - Organization selection
- `GROUP_SELECT` - Group selection
- `CATEGORY` - Category
- `STATUS` - Status
- `STATUS_ASSIGNEE` - Status assignee
- `FILE` - Attachment
- `LOOKUP` - Lookup
- `REFERENCE_TABLE` - Related records list

## System Fields

- `RECORD_NUMBER` - Record number
- `RECORD_ID` - Record ID ($id)
- `REVISION` - Revision ($revision)
- `CREATOR` - Creator
- `CREATED_TIME` - Created time
- `MODIFIER` - Modifier
- `UPDATED_TIME` - Updated time

## Layout Fields

- `SUBTABLE` - Table
- `GROUP` - Group

## Empty Value Normalization Rules

| Field Type | Empty Value on Retrieval | After Normalization | Used for Updates |
|------------|-------------------------|-------------------|------------------|
| Text (Single/Multi-line) | `undefined` | `""` | `""` |
| Link, Lookup | `undefined` | `""` | `""` |
| Number, DateTime | `undefined` or `""` | `null` | `null` |
| Date, Time | `undefined` | `null` | `null` |
| Dropdown | `undefined` or `""` | `null` | `null` |
| Radio Button | `undefined` or `""` | `null` | Cannot be empty |
| Array types (Checkbox, etc.) | `undefined` or `null` | `[]` | `[]` |
| Category, Status Assignee | `undefined` or `null` | `[]` | Cannot be empty |

## Important Notes

### Fields That Don't Allow Empty Values

The following field types cannot be set to empty values when updating records:

- **Radio Button** - Must have a selected value
- **Category** - Must have at least one category
- **Status Assignee** - Must have at least one assignee

### Subtable Constraints

Only the following field types can be used inside subtables:

- Single-line text, Multi-line text, Rich text
- Number, Calculation
- Checkbox, Radio button, Dropdown, Multi-select
- Date, Time, DateTime
- Link

### Field Code Validation

kintone field codes have specific constraints:

- **Allowed characters**: Hiragana, Katakana, Kanji, alphanumeric, underscore, middle dot, currency symbols
- **Reserved words**: `ステータス`, `作業者`, `カテゴリー`, `__ROOT__`, `not` are not allowed
- **Cannot start with**: Numbers