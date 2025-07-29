import { describe, it, expect } from 'vitest'
import { Schema } from 'effect'
import {
  KintoneRecordSchema,
  GetRecordResponseSchema,
  SubtableFieldSchema,
} from '../src/schemas/record.js'

describe('Kintone Record Schemas', () => {
  describe('KintoneRecordSchema', () => {
    it('should parse a complete record', () => {
      const input = {
        text_field: {
          type: 'SINGLE_LINE_TEXT',
          value: 'Test Text',
        },
        number_field: {
          type: 'NUMBER',
          value: '100',
        },
        date_field: {
          type: 'DATE',
          value: '2024-01-01',
        },
        user_field: {
          type: 'USER_SELECT',
          value: [
            { code: 'user1', name: 'Test User' },
          ],
        },
      }
      
      const result = Schema.decodeUnknownSync(KintoneRecordSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('SubtableFieldSchema', () => {
    it('should parse subtable field', () => {
      const input = {
        type: 'SUBTABLE',
        value: [
          {
            id: '1',
            value: {
              item_name: {
                type: 'SINGLE_LINE_TEXT',
                value: 'Item 1',
              },
              quantity: {
                type: 'NUMBER',
                value: '10',
              },
            },
          },
          {
            id: '2',
            value: {
              item_name: {
                type: 'SINGLE_LINE_TEXT',
                value: 'Item 2',
              },
              quantity: {
                type: 'NUMBER',
                value: '5',
              },
            },
          },
        ],
      }
      
      const result = Schema.decodeUnknownSync(SubtableFieldSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('GetRecordResponseSchema', () => {
    it('should parse get record response', () => {
      const input = {
        record: {
          $id: {
            type: 'RECORD_NUMBER',
            value: '1',
          },
          title: {
            type: 'SINGLE_LINE_TEXT',
            value: 'Test Record',
          },
          created_time: {
            type: 'CREATED_TIME',
            value: '2024-01-01T00:00:00Z',
          },
          creator: {
            type: 'CREATOR',
            value: {
              code: 'admin',
              name: 'Administrator',
            },
          },
        },
      }
      
      const result = Schema.decodeUnknownSync(GetRecordResponseSchema)(input)
      expect(result).toEqual(input)
    })
  })
})