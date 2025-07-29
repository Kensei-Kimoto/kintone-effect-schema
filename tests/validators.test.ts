import { describe, it, expect } from 'vitest'
import { 
  validateFieldForWrite,
  validateRecordForWrite,
  isNonEmptyField,
  getEmptyValueForWrite,
  KintoneValidationError
} from '../src/validators.js'

describe('Field Validators', () => {
  describe('validateFieldForWrite', () => {
    it('should pass validation for non-empty radio button', () => {
      const field = {
        type: 'RADIO_BUTTON' as const,
        value: 'Option 1',
      }
      
      expect(() => validateFieldForWrite(field)).not.toThrow()
    })

    it('should throw error for empty radio button', () => {
      const field = {
        type: 'RADIO_BUTTON' as const,
        value: null,
      }
      
      expect(() => validateFieldForWrite(field)).toThrow(KintoneValidationError)
      expect(() => validateFieldForWrite(field)).toThrow('RADIO_BUTTONフィールドには空の値を設定できません')
    })

    it('should throw error for empty category', () => {
      const field = {
        type: 'CATEGORY' as const,
        value: [],
      }
      
      expect(() => validateFieldForWrite(field)).toThrow(KintoneValidationError)
      expect(() => validateFieldForWrite(field)).toThrow('CATEGORYフィールドには空の値を設定できません')
    })

    it('should throw error for empty status assignee', () => {
      const field = {
        type: 'STATUS_ASSIGNEE' as const,
        value: [],
      }
      
      expect(() => validateFieldForWrite(field)).toThrow(KintoneValidationError)
      expect(() => validateFieldForWrite(field)).toThrow('STATUS_ASSIGNEEフィールドには空の値を設定できません')
    })

    it('should pass validation for fields that allow empty values', () => {
      const fields = [
        { type: 'SINGLE_LINE_TEXT' as const, value: '' },
        { type: 'NUMBER' as const, value: null },
        { type: 'CHECK_BOX' as const, value: [] },
        { type: 'DROP_DOWN' as const, value: null },
      ]
      
      fields.forEach(field => {
        expect(() => validateFieldForWrite(field)).not.toThrow()
      })
    })
  })

  describe('validateRecordForWrite', () => {
    it('should validate all fields in a record', () => {
      const record = {
        text_field: {
          type: 'SINGLE_LINE_TEXT' as const,
          value: 'Hello',
        },
        radio_field: {
          type: 'RADIO_BUTTON' as const,
          value: 'Option 1',
        },
      }
      
      expect(() => validateRecordForWrite(record)).not.toThrow()
    })

    it('should throw error with field code when validation fails', () => {
      const record = {
        text_field: {
          type: 'SINGLE_LINE_TEXT' as const,
          value: 'Hello',
        },
        radio_field: {
          type: 'RADIO_BUTTON' as const,
          value: null,
        },
      }
      
      expect(() => validateRecordForWrite(record)).toThrow('フィールド "radio_field": RADIO_BUTTONフィールドには空の値を設定できません')
    })
  })

  describe('isNonEmptyField', () => {
    it('should return true for non-empty fields', () => {
      expect(isNonEmptyField('RADIO_BUTTON')).toBe(true)
      expect(isNonEmptyField('CATEGORY')).toBe(true)
      expect(isNonEmptyField('STATUS_ASSIGNEE')).toBe(true)
    })

    it('should return false for fields that allow empty values', () => {
      expect(isNonEmptyField('SINGLE_LINE_TEXT')).toBe(false)
      expect(isNonEmptyField('NUMBER')).toBe(false)
      expect(isNonEmptyField('CHECK_BOX')).toBe(false)
    })
  })

  describe('getEmptyValueForWrite', () => {
    it('should return empty string for text fields', () => {
      expect(getEmptyValueForWrite('SINGLE_LINE_TEXT')).toBe('')
      expect(getEmptyValueForWrite('MULTI_LINE_TEXT')).toBe('')
      expect(getEmptyValueForWrite('LINK')).toBe('')
    })

    it('should return null for nullable fields', () => {
      expect(getEmptyValueForWrite('NUMBER')).toBe(null)
      expect(getEmptyValueForWrite('DATE')).toBe(null)
      expect(getEmptyValueForWrite('DROP_DOWN')).toBe(null)
    })

    it('should return empty array for array fields', () => {
      expect(getEmptyValueForWrite('CHECK_BOX')).toEqual([])
      expect(getEmptyValueForWrite('USER_SELECT')).toEqual([])
      expect(getEmptyValueForWrite('FILE')).toEqual([])
    })

    it('should throw error for non-empty fields', () => {
      expect(() => getEmptyValueForWrite('RADIO_BUTTON')).toThrow(KintoneValidationError)
      expect(() => getEmptyValueForWrite('CATEGORY')).toThrow(KintoneValidationError)
      expect(() => getEmptyValueForWrite('STATUS_ASSIGNEE')).toThrow(KintoneValidationError)
    })
  })
})