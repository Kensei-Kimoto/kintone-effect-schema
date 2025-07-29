# Contributing to kintone-effect-schema

Thank you for your interest in contributing to kintone-effect-schema! 

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes
4. Run tests:
   ```bash
   npm test
   ```
5. Check types:
   ```bash
   npm run typecheck
   ```
6. Run linter:
   ```bash
   npm run lint
   ```

## Pull Request Process

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Add tests for any new functionality
4. Ensure all tests pass
5. Update the README if needed
6. Update the CHANGELOG.md
7. Submit a pull request

## Adding New Field Types

When kintone adds new field types:

1. Add the type to `src/types/kintone.ts`
2. Create the schema in `src/schemas/fields.ts`
3. Add normalization rules in `src/decoders.ts`
4. Add validation rules in `src/validators.ts` if needed
5. Export the new schema and type from `src/index.ts`
6. Add tests in the `tests/` directory
7. Update the README with the new field type

## Code Style

- Use TypeScript strict mode
- Follow the existing code style
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## Questions?

Feel free to open an issue for any questions!