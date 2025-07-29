import { describe, it, expect } from 'vitest'
import { 
  normalizeFieldValue, 
  decodeKintoneField,
  decodeKintoneRecord 
} from '../src/decoders.js'

describe('Field Value Normalization', () => {
  describe('normalizeFieldValue', () => {
    it('should normalize undefined to empty string for text fields', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'SINGLE_LINE_TEXT',
        value: '',
      })
    })

    it('should normalize undefined to null for number fields', () => {
      const input = {
        type: 'NUMBER',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'NUMBER',
        value: null,
      })
    })

    it('should normalize empty string to null for number fields', () => {
      const input = {
        type: 'NUMBER',
        value: '',
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'NUMBER',
        value: null,
      })
    })

    it('should normalize undefined to null for date fields', () => {
      const input = {
        type: 'DATE',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'DATE',
        value: null,
      })
    })

    it('should normalize undefined to null for dropdown fields', () => {
      const input = {
        type: 'DROP_DOWN',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'DROP_DOWN',
        value: null,
      })
    })

    it('should normalize undefined to null for radio button fields', () => {
      const input = {
        type: 'RADIO_BUTTON',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'RADIO_BUTTON',
        value: null,
      })
    })

    it('should normalize undefined to empty array for checkbox fields', () => {
      const input = {
        type: 'CHECK_BOX',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'CHECK_BOX',
        value: [],
      })
    })

    it('should normalize undefined to empty array for category fields', () => {
      const input = {
        type: 'CATEGORY',
        value: undefined,
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual({
        type: 'CATEGORY',
        value: [],
      })
    })

    it('should not change rich text field value', () => {
      const input = {
        type: 'RICH_TEXT',
        value: '<p>Hello</p>',
      }
      
      const result = normalizeFieldValue(input)
      expect(result).toEqual(input)
    })
  })

  describe('decodeKintoneField', () => {
    it('should decode and normalize a text field with undefined value', () => {
      const input = {
        type: 'SINGLE_LINE_TEXT',
        value: undefined,
      }
      
      const result = decodeKintoneField(input)
      expect(result).toEqual({
        type: 'SINGLE_LINE_TEXT',
        value: '',
      })
    })

    it('should decode and normalize a number field with empty string', () => {
      const input = {
        type: 'NUMBER',
        value: '',
      }
      
      const result = decodeKintoneField(input)
      expect(result).toEqual({
        type: 'NUMBER',
        value: null,
      })
    })
  })

  describe('decodeKintoneRecord', () => {
    it('should normalize all fields in a record', () => {
      const input = {
        text_field: {
          type: 'SINGLE_LINE_TEXT',
          value: undefined,
        },
        number_field: {
          type: 'NUMBER',
          value: '',
        },
        radio_field: {
          type: 'RADIO_BUTTON',
          value: undefined,
        },
        checkbox_field: {
          type: 'CHECK_BOX',
          value: null,
        },
      }
      
      const result = decodeKintoneRecord(input)
      expect(result).toEqual({
        text_field: {
          type: 'SINGLE_LINE_TEXT',
          value: '',
        },
        number_field: {
          type: 'NUMBER',
          value: null,
        },
        radio_field: {
          type: 'RADIO_BUTTON',
          value: null,
        },
        checkbox_field: {
          type: 'CHECK_BOX',
          value: [],
        },
      })
    })
  })
})