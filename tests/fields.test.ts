import { describe, it, expect } from 'vitest'
import { Schema } from 'effect'
import {
  SingleLineTextFieldSchema,
  NumberFieldSchema,
  CheckBoxFieldSchema,
  UserSelectFieldSchema,
  DateFieldSchema,
} from '../src/schemas/fields.js'

describe('Kintone Field Schemas', () => {
  describe('SingleLineTextFieldSchema', () => {
    it('should parse valid single line text field', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        value: 'Hello, World!',
      }
      
      const result = Schema.decodeUnknownSync(SingleLineTextFieldSchema)(input)
      expect(result).toEqual(input)
    })

    it('should fail with invalid type', () => {
      const input = {
        type: 'INVALID_TYPE',
        value: 'Hello, World!',
      }
      
      expect(() => Schema.decodeUnknownSync(SingleLineTextFieldSchema)(input)).toThrow()
    })
  })

  describe('NumberFieldSchema', () => {
    it('should parse number field with string value', () => {
      const input = {
        type: 'NUMBER',
        value: '123.45',
      }
      
      const result = Schema.decodeUnknownSync(NumberFieldSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse number field with null value', () => {
      const input = {
        type: 'NUMBER',
        value: null,
      }
      
      const result = Schema.decodeUnknownSync(NumberFieldSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('CheckBoxFieldSchema', () => {
    it('should parse checkbox field with multiple values', () => {
      const input = {
        type: 'CHECK_BOX',
        value: ['Option 1', 'Option 2', 'Option 3'],
      }
      
      const result = Schema.decodeUnknownSync(CheckBoxFieldSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse checkbox field with empty array', () => {
      const input = {
        type: 'CHECK_BOX',
        value: [],
      }
      
      const result = Schema.decodeUnknownSync(CheckBoxFieldSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('UserSelectFieldSchema', () => {
    it('should parse user select field', () => {
      const input = {
        type: 'USER_SELECT',
        value: [
          { code: 'user1', name: 'User One' },
          { code: 'user2', name: 'User Two' },
        ],
      }
      
      const result = Schema.decodeUnknownSync(UserSelectFieldSchema)(input)
      expect(result).toEqual(input)
    })
  })

  describe('DateFieldSchema', () => {
    it('should parse date field with value', () => {
      const input = {
        type: 'DATE',
        value: '2024-01-01',
      }
      
      const result = Schema.decodeUnknownSync(DateFieldSchema)(input)
      expect(result).toEqual(input)
    })

    it('should parse date field with null value', () => {
      const input = {
        type: 'DATE',
        value: null,
      }
      
      const result = Schema.decodeUnknownSync(DateFieldSchema)(input)
      expect(result).toEqual(input)
    })
  })
})