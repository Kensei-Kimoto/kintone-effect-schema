export type KintoneFieldType =
  | 'SINGLE_LINE_TEXT'
  | 'MULTI_LINE_TEXT'
  | 'RICH_TEXT'
  | 'NUMBER'
  | 'CALC'
  | 'RADIO_BUTTON'
  | 'CHECK_BOX'
  | 'MULTI_SELECT'
  | 'DROP_DOWN'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'LINK'
  | 'USER_SELECT'
  | 'ORGANIZATION_SELECT'
  | 'GROUP_SELECT'
  | 'FILE'
  | 'RECORD_NUMBER'
  | 'CREATOR'
  | 'CREATED_TIME'
  | 'MODIFIER'
  | 'UPDATED_TIME'
  | 'STATUS'
  | 'STATUS_ASSIGNEE'
  | 'CATEGORY'
  | 'LOOKUP'
  | 'RECORD_ID'
  | 'REVISION'
  | 'SUBTABLE'

export interface KintoneUser {
  code: string
  name: string
}

export interface KintoneOrganization {
  code: string
  name: string
}

export interface KintoneGroup {
  code: string
  name: string
}

export interface KintoneFile {
  contentType: string
  fileKey: string
  name: string
  size: string
}