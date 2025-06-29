# VibeLux Testing Suite

This directory contains comprehensive automated tests for the VibeLux application.

## Test Structure

```
src/__tests__/
├── setup.ts                 # Global test configuration
├── utils/
│   └── test-helpers.ts      # Common utilities and mock data
├── lib/                     # Unit tests for core libraries
│   ├── db.test.ts           # Database layer tests
│   └── fixture-search-engine.test.ts  # Search engine tests
├── api/                     # API endpoint tests
│   └── fixtures/
│       └── search.test.ts   # Fixture search API tests
├── hooks/                   # React hooks tests
│   └── useWebSocket.test.ts # WebSocket hook tests
├── components/              # React component tests
├── integration/             # Integration tests
│   └── websocket-integration.test.ts  # WebSocket server integration
└── e2e/                    # End-to-end tests
```

## Test Categories

### 1. Unit Tests (`lib/`, `hooks/`, `components/`)
- Test individual functions, components, and hooks in isolation
- Fast execution, comprehensive coverage
- Mock external dependencies

### 2. API Tests (`api/`)
- Test REST API endpoints
- Validate request/response formats
- Test authentication and authorization
- Error handling and edge cases

### 3. Integration Tests (`integration/`)
- Test component interactions
- WebSocket server and client communication
- Database operations with real data flow
- End-to-end feature workflows

### 4. End-to-End Tests (`e2e/`)
- Full user journey testing
- Browser automation
- Real environment testing

## Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Categories
```bash
npm run test:unit        # Unit tests only
npm run test:api         # API tests only
npm run test:hooks       # React hooks tests
npm run test:components  # Component tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
```

### CI/CD
```bash
npm run test:ci          # Optimized for continuous integration
```

## Test Configuration

### Jest Configuration
- **Environment**: jsdom for React component testing
- **Test Match**: `**/*.test.{ts,tsx}`
- **Module Mapping**: `@/*` → `src/*`
- **Setup**: Automatic test environment setup
- **Coverage**: 70% threshold for branches, functions, lines, statements

### Mock Strategy
- **External APIs**: Mocked to prevent network calls
- **Authentication**: Clerk authentication mocked
- **Database**: Prisma client mocked with test data
- **WebSocket**: Native WebSocket API mocked
- **File System**: Node.js fs operations mocked

## Key Testing Utilities

### Test Helpers (`utils/test-helpers.ts`)
- **Mock Data**: Fixtures, users, projects, sensor readings
- **Request Builders**: Authenticated/unauthenticated requests
- **Database Mocks**: Complete CRUD operation mocks
- **Custom Matchers**: Domain-specific assertions
- **Async Utilities**: Wait functions, timeout handling

### Setup (`setup.ts`)
- **Environment Variables**: Test-specific configurations
- **Global Mocks**: Next.js, Clerk, WebSocket APIs
- **Console Management**: Suppress noise in test output
- **DOM APIs**: ResizeObserver, IntersectionObserver mocks

## Test Data

### Mock Fixtures
- Complete DLC fixture specifications
- Realistic pricing and performance data
- Various manufacturers and types
- Spectrum and efficiency ranges

### Mock Users
- Different roles and permissions
- Subscription levels
- Authentication states

### Mock Projects
- Multiple project configurations
- Room layouts and fixture assignments
- Settings and preferences

## Coverage Goals

### Current Thresholds (70%)
- **Branches**: 70%
- **Functions**: 70% 
- **Lines**: 70%
- **Statements**: 70%

### Critical Areas (>90% target)
- Database operations
- Authentication/authorization
- WebSocket communication
- Fixture search algorithms
- Cost calculations

### Lower Priority (<50% acceptable)
- UI styling components
- Development utilities
- Configuration files

## Best Practices

### Writing Tests
1. **Descriptive Names**: Clear test descriptions
2. **Single Responsibility**: One assertion per test
3. **Arrange-Act-Assert**: Structured test flow
4. **Mock Isolation**: Prevent external dependencies
5. **Error Cases**: Test failure scenarios

### Test Organization
1. **Logical Grouping**: Related tests in same describe block
2. **Setup/Teardown**: Use beforeEach/afterEach consistently
3. **Mock Management**: Clear mocks between tests
4. **Async Handling**: Proper async/await usage

### Performance
1. **Fast Execution**: Unit tests < 100ms
2. **Parallel Execution**: Safe concurrent test runs
3. **Resource Cleanup**: Prevent memory leaks
4. **Selective Testing**: Run relevant tests only

## Debugging Tests

### Common Issues
1. **Timeout Errors**: Increase test timeout for slow operations
2. **Mock Conflicts**: Clear mocks between tests
3. **Async Race Conditions**: Use waitFor utilities
4. **Environment Differences**: Check NODE_ENV settings

### Debug Commands
```bash
# Verbose output
VERBOSE_TESTS=true npm run test

# Debug specific test
npm run test -- --testNamePattern="specific test name"

# Run single test file
npm run test -- path/to/test.test.ts

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No critical security vulnerabilities
- Performance benchmarks met

## Test Maintenance

### Regular Tasks
1. **Update Mock Data**: Keep test data realistic
2. **Review Coverage**: Identify gaps in testing
3. **Performance Monitoring**: Watch for slow tests
4. **Dependency Updates**: Keep testing libraries current

### Refactoring
1. **Extract Common Patterns**: Reduce duplication
2. **Update Test Utilities**: Improve helper functions
3. **Mock Improvements**: More realistic mocks
4. **Documentation**: Keep this README current

## Contributing

### Adding New Tests
1. Follow existing patterns and structure
2. Use appropriate test category
3. Include both success and failure cases
4. Add to coverage reporting
5. Update documentation if needed

### Test Review Checklist
- [ ] Tests are deterministic
- [ ] Mocks are properly isolated
- [ ] Edge cases are covered
- [ ] Performance is acceptable
- [ ] Documentation is updated