/**
 * Convert kintone field configurations to TypeScript code
 */

import type { KintoneFieldProperties } from '../schemas/form/fields.js';

// Define subtable structure locally since it's not in the main union
type SubtableFieldProperties = {
  type: 'SUBTABLE';
  code: string;
  fields: Record<string, {
    type: string;
    code: string;
    label: string;
    [key: string]: unknown;
  }>;
};

type AllFieldProperties = KintoneFieldProperties | SubtableFieldProperties;

// Field type to TypeScript type name mapping
const FIELD_TYPE_TO_TS_TYPE: Record<string, string> = {
  SINGLE_LINE_TEXT: 'SingleLineTextFieldProperties',
  MULTI_LINE_TEXT: 'MultiLineTextFieldProperties',
  RICH_TEXT: 'RichTextFieldProperties',
  NUMBER: 'NumberFieldProperties',
  CALC: 'CalcFieldProperties',
  RADIO_BUTTON: 'RadioButtonFieldProperties',
  CHECK_BOX: 'CheckBoxFieldProperties',
  MULTI_SELECT: 'MultiSelectFieldProperties',
  DROP_DOWN: 'DropDownFieldProperties',
  DATE: 'DateFieldProperties',
  TIME: 'TimeFieldProperties',
  DATETIME: 'DateTimeFieldProperties',
  LINK: 'LinkFieldProperties',
  USER_SELECT: 'UserSelectFieldProperties',
  ORGANIZATION_SELECT: 'OrganizationSelectFieldProperties',
  GROUP_SELECT: 'GroupSelectFieldProperties',
  FILE: 'FileFieldProperties',
  REFERENCE_TABLE: 'ReferenceTableFieldProperties',
  RECORD_NUMBER: 'RecordNumberFieldProperties',
  CREATOR: 'CreatorFieldProperties',
  CREATED_TIME: 'CreatedTimeFieldProperties',
  MODIFIER: 'ModifierFieldProperties',
  UPDATED_TIME: 'UpdatedTimeFieldProperties',
  STATUS: 'StatusFieldProperties',
  STATUS_ASSIGNEE: 'StatusAssigneeFieldProperties',
  CATEGORY: 'CategoryFieldProperties',
  SUBTABLE: 'SubtableFieldProperties',
  GROUP: 'GroupFieldProperties',
  RECORD_ID: 'RecordIdFieldProperties',
  REVISION: 'RevisionFieldProperties',
  __ID__: 'SystemIdFieldProperties',
  __REVISION__: 'SystemRevisionFieldProperties',
  SPACER: 'SpacerFieldProperties',
  LABEL: 'LabelFieldProperties',
};

/**
 * Check if a field is a subtable
 * @param fieldConfig Field configuration object
 * @returns true if the field is a subtable
 */
function isSubtableField(fieldConfig: AllFieldProperties): fieldConfig is SubtableFieldProperties {
  return fieldConfig.type === 'SUBTABLE' && 'fields' in fieldConfig;
}

/**
 * Convert field code to a valid TypeScript variable name
 * @param code Field code
 * @returns Valid TypeScript variable name
 */
function toVariableName(code: string): string {
  // JavaScript/TypeScript actually supports Unicode identifiers including Japanese characters
  // The spec allows: ID_Start (including Japanese) at the beginning, and ID_Continue for the rest
  // We'll keep the original field code as much as possible
  
  // Special handling for system fields starting with $
  // $id -> $idField, $revision -> $revisionField
  if (code.startsWith('$')) {
    // $ is valid in JavaScript identifiers, so we can keep it
    return code + 'Field';
  }
  
  // Check if it starts with a number (not allowed in JS identifiers)
  if (/^[0-9]/.test(code)) {
    // Prefix with underscore if starts with number
    return '_' + code + 'Field';
  }
  
  // Check if it contains characters that are not allowed in JS identifiers
  // Allowed: Letters (including Japanese), digits, $, _
  // Not allowed: -, space, and other special characters
  if (/^[\p{L}\p{Nl}$_][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}$]*$/u.test(code)) {
    // Valid identifier, just add Field suffix
    return code + 'Field';
  }
  
  // For codes with invalid characters (like hyphens), we need to sanitize
  // Replace invalid characters with underscores
  let varName = code.replace(/[^\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}$_]/gu, '_');
  
  // Remove consecutive underscores
  varName = varName.replace(/_+/g, '_');
  
  // Remove leading/trailing underscores (but preserve $ at the beginning)
  varName = varName.replace(/^_+|_+$/g, '');
  
  // If empty or starts with number, prefix with 'field'
  if (!varName || /^[0-9]/.test(varName)) {
    varName = 'field_' + (varName || 'generated');
  }
  
  return varName + 'Field';
}

/**
 * Convert a JavaScript value to TypeScript code representation
 * @param value The value to convert
 * @param indent Current indentation level
 * @returns TypeScript code string
 */
function valueToCode(value: unknown, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  
  if (value === null) {
    return 'null';
  }
  
  // Skip undefined values in generated code
  if (value === undefined) {
    return 'undefined';
  }
  
  if (typeof value === 'string') {
    // Use JSON.stringify for proper escaping
    return JSON.stringify(value);
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map(item => valueToCode(item, indent + 1));
    if (items.every(item => item.length < 40) && items.join(', ').length < 60) {
      // Short arrays on one line
      return `[${items.join(', ')}]`;
    }
    // Long arrays on multiple lines
    return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
  }
  
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, val]) => val !== undefined); // Skip undefined values
    
    if (entries.length === 0) {
      return '{}';
    }
    
    const props = entries.map(([key, val]) => {
      // Check if key needs quoting
      const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) || isReservedWord(key);
      const keyStr = needsQuotes ? JSON.stringify(key) : key;
      const valStr = valueToCode(val, indent + 1);
      return `${spaces}  ${keyStr}: ${valStr}`;
    });
    
    return `{\n${props.join(',\n')}\n${spaces}}`;
  }
  
  // Fallback for unknown types
  return JSON.stringify(value);
}

/**
 * Check if a string is a JavaScript reserved word
 * @param word The word to check
 * @returns true if reserved word
 */
function isReservedWord(word: string): boolean {
  const reserved = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'enum', 'implements', 'interface', 'let', 'package', 'private', 'protected',
    'public', 'static', 'await', 'abstract', 'boolean', 'byte', 'char', 'double',
    'final', 'float', 'goto', 'int', 'long', 'native', 'short', 'synchronized',
    'throws', 'transient', 'volatile'
  ]);
  return reserved.has(word);
}

/**
 * Convert a single field configuration to TypeScript code
 * @param fieldConfig Field configuration object
 * @param fieldCode Field code (used as variable name base)
 * @param isSubtableChild Whether this field is inside a subtable
 * @returns TypeScript code string
 */
export function fieldConfigToTypeScriptCode(
  fieldConfig: AllFieldProperties,
  fieldCode?: string,
  isSubtableChild: boolean = false
): string {
  const fieldType = fieldConfig.type;
  const tsType = FIELD_TYPE_TO_TS_TYPE[fieldType as string];
  
  if (!tsType) {
    throw new Error(`Unknown field type: ${fieldType}`);
  }
  
  // Use field code from config or provided fieldCode
  const code = fieldCode || ('code' in fieldConfig ? fieldConfig.code : fieldCode) || 'field';
  const varName = toVariableName(code);
  
  // Generate the field configuration code
  let configCode = valueToCode(fieldConfig, 0);
  
  // Handle subtable fields specially
  if (isSubtableField(fieldConfig)) {
    const subtableConfig = fieldConfig; // Now properly typed as SubtableFieldProperties
    const fieldsEntries = Object.entries(subtableConfig.fields || {});
    
    if (fieldsEntries.length > 0) {
      // Create a new config object with fields handled specially
      const configToSerialize = {
        ...subtableConfig,
        fields: '<<FIELDS_PLACEHOLDER>>'
      };
      
      // Generate base config
      configCode = valueToCode(configToSerialize, 0);
      
      // Generate subtable fields object with proper indentation
      const subtableFieldsCode = fieldsEntries.map(([fieldCode, fieldDef]) => {
        const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(fieldCode) || isReservedWord(fieldCode);
        const key = needsQuotes ? JSON.stringify(fieldCode) : fieldCode;
        const value = valueToCode(fieldDef, 2);
        return `    ${key}: ${value}`;
      }).join(',\n');
      
      // Replace the placeholder with actual fields
      configCode = configCode.replace(
        '"<<FIELDS_PLACEHOLDER>>"',
        `{\n${subtableFieldsCode}\n  }`
      );
    }
  }
  
  // No need for comments anymore since we keep the original field code
  const exportKeyword = isSubtableChild ? 'const' : 'export const';
  return `${exportKeyword} ${varName}: ${tsType} = ${configCode};`;
}

/**
 * Convert multiple field configurations to TypeScript code
 * @param fieldsConfig Object containing field configurations (field code as key)
 * @returns TypeScript code string with imports and all field definitions
 */
export function fieldsConfigToTypeScriptCode(
  fieldsConfig: Record<string, AllFieldProperties>
): string {
  const fieldEntries = Object.entries(fieldsConfig);
  
  if (fieldEntries.length === 0) {
    return '// No fields to generate';
  }
  
  // Collect unique type names for imports
  const typeNames = new Set<string>();
  const fieldDefinitions: string[] = [];
  const fieldVariables: Array<{ code: string; varName: string }> = [];
  
  // Generate field definitions
  for (const [fieldCode, fieldConfig] of fieldEntries) {
    const fieldType = fieldConfig.type;
    const tsType = FIELD_TYPE_TO_TS_TYPE[fieldType as string];
    
    if (tsType) {
      typeNames.add(tsType);
      
      // Handle subtable fields
      if (isSubtableField(fieldConfig)) {
        const subtableConfig = fieldConfig;
        const subtableFields = subtableConfig.fields || {};
        
        // Add type names for subtable child fields
        for (const subFieldConfig of Object.values(subtableFields)) {
          const subFieldType = subFieldConfig.type;
          const subTsType = FIELD_TYPE_TO_TS_TYPE[subFieldType];
          if (subTsType) {
            typeNames.add(subTsType);
          }
        }
      }
      
      const varName = toVariableName(fieldCode);
      const fieldDef = fieldConfigToTypeScriptCode(fieldConfig, fieldCode);
      fieldDefinitions.push(fieldDef);
      fieldVariables.push({ code: fieldCode, varName });
    }
  }
  
  // Generate imports
  const sortedTypes = Array.from(typeNames).sort();
  const imports = `import type {\n  ${sortedTypes.join(',\n  ')}\n} from 'kintone-effect-schema';`;
  
  // Generate app fields config object
  const configEntries = fieldVariables.map(({ code, varName }) => {
    // Quote if: starts with $, contains invalid characters, or is a reserved word
    const needsQuotes = code.startsWith('$') || !/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(code) || isReservedWord(code);
    const key = needsQuotes ? JSON.stringify(code) : code;
    return `    ${key}: ${varName}`;
  });
  
  const appConfig = `export const appFieldsConfig = {
  properties: {
${configEntries.join(',\n')}
  }
};`;
  
  // Combine all parts
  return [
    imports,
    '',
    ...fieldDefinitions,
    '',
    appConfig
  ].join('\n');
}