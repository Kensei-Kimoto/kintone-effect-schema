# Why Effect-TS Schema?

## 🤔 The Problem with kintone Development

kintone field type definitions are complex:

```typescript
// Are these types guaranteed at runtime?
const record = await client.record.getRecord({ app: 1, id: 1 });
const title = record.record.title.value; // string? undefined? null?
const price = record.record.price.value; // string? number? "123.45"?
```

**Answer: No!** 😱

- TypeScript types only exist at **compile time**
- At runtime, they're just `any` (type information is erased)
- API response types cannot be trusted
- Breaking changes in kintone specifications

## 💪 What Effect-TS Schema Solves

### 1. **Runtime Type Validation**

```typescript
import { Schema } from 'effect';
import { NumberFieldSchema } from 'kintone-effect-schema';

// Type checking at runtime!
const field = { type: 'NUMBER', value: '123.45' };
const validated = Schema.decodeUnknownSync(NumberFieldSchema)(field);
// ✅ Type is guaranteed! validated is definitely NumberField type
```

### 2. **Detailed Error Information**

```typescript
try {
  const invalid = { type: 'NUMBER', value: { nested: 'object' } };
  Schema.decodeUnknownSync(NumberFieldSchema)(invalid);
} catch (error) {
  console.error(Schema.formatError(error));
  // Detailed error info:
  // └─ ["value"]
  //    └─ Expected string | null, actual {"nested":"object"}
}
```

### 3. **Composable Schema Definitions**

```typescript
// Combine small schemas to create larger ones
const CustomRecordSchema = Schema.Struct({
  title: SingleLineTextFieldSchema,
  price: NumberFieldSchema,
  tags: CheckBoxFieldSchema,
  // Add custom validation
  total: Schema.Number.pipe(
    Schema.filter((n) => n >= 0, { message: 'Total must be non-negative' })
  ),
});
```

### 4. **Type Inference**

```typescript
// Automatically generate TypeScript types from schemas
type CustomRecord = Schema.Schema.Type<typeof CustomRecordSchema>;
// No need to write type definitions manually!
```

## 🚀 Comparison with Other Validation Libraries

### Zod vs Effect-TS

```typescript
// Zod
const schema = z.object({
  type: z.literal('NUMBER'),
  value: z.union([z.string(), z.null()]),
});

// Effect-TS Schema
const schema = Schema.Struct({
  type: Schema.Literal('NUMBER'),
  value: Schema.Union(Schema.String, Schema.Null),
});
```

**Effect-TS Advantages:**
- More functional programming oriented
- Pipeline operators for chaining transformations
- Integration with Effect ecosystem
- More detailed error information

### Yup, Joi vs Effect-TS

- **Type Inference**: Effect-TS is TypeScript-first
- **Performance**: Compile-time optimizations
- **Ecosystem**: Combinable with other Effect libraries

## 🎯 kintone × Effect-TS Compatibility

### 1. **Complex Union Types**

```typescript
// kintone has 28+ field types in a union
const KintoneFieldSchema = Schema.Union(
  SingleLineTextFieldSchema,
  NumberFieldSchema
  // ... 26+ more types
);
```

### 2. **Progressive Transformations**

```typescript
// API response → Normalization → Validation → Business logic
const pipeline = Schema.transform(RawApiResponse, NormalizedRecord, {
  decode: (raw) => normalize(raw),
  encode: (norm) => denormalize(norm),
});
```

### 3. **Error Handling**

```typescript
// Effect-TS errors are structured
const result = Schema.decodeUnknownEither(schema)(data);
if (Either.isLeft(result)) {
  // Type-safe error handling
  const errors = Schema.formatError(result.left);
}
```

## 📚 Summary

Effect-TS Schema provides:

- ✅ **Runtime type safety** - API responses can be trusted
- ✅ **Better developer experience** - Clear error messages
- ✅ **Maintainability** - Schema = Documentation = Type definitions
- ✅ **Extensibility** - Add custom validation rules

**For kintone's complex type system, Effect-TS Schema is the powerful tool you need!**