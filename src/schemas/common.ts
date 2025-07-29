import { Schema } from 'effect'
import type { KintoneUser, KintoneOrganization, KintoneGroup, KintoneFile } from '../types/kintone.js'

export const KintoneUserSchema: Schema.Schema<KintoneUser> = Schema.Struct({
  code: Schema.String,
  name: Schema.String,
})

export const KintoneOrganizationSchema: Schema.Schema<KintoneOrganization> = Schema.Struct({
  code: Schema.String,
  name: Schema.String,
})

export const KintoneGroupSchema: Schema.Schema<KintoneGroup> = Schema.Struct({
  code: Schema.String,
  name: Schema.String,
})

export const KintoneFileSchema: Schema.Schema<KintoneFile> = Schema.Struct({
  contentType: Schema.String,
  fileKey: Schema.String,
  name: Schema.String,
  size: Schema.String,
})