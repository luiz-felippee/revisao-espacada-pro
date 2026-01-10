# 🧪 Testing Guide - Study Panel

## Quick Start

### Run Tests
```bash
# Watch mode (development)
npm test

# Run once
npm test -- --run

# With coverage
npm run test:coverage

# UI mode (visual)
npm run test:ui
```

---

## Writing Tests

### Utilities (Pure Functions)
```typescript
// src/utils/__tests__/myUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myUtil';

describe('myFunction', () => {
  it('does something', () => {
    expect(myFunction('input')).toBe('output');
  });

  it('handles edge cases', () => {
    expect(myFunction(null)).toBe(null);
  });
});
```

### Hooks
```typescript
// src/hooks/__tests__/useMyHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('initial');
  });

  it('updates state', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.setValue('new');
    });

    expect(result.current.value).toBe('new');
  });
});
```

### Components
```typescript
// src/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

---

## Coverage Goals

| Category | Target | Priority |
|----------|--------|----------|
| **Utils** | 90%+ | High |
| **Hooks** | 80%+ | High |
| **Components** | 60%+ | Medium |
| **Context** | 50%+ | Low |

### Check Coverage
```bash
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## Best Practices

### ✅ DO
- Test business logic
- Test edge cases
- Test error states
- Mock external deps
- Keep tests simple

### ❌ DON'T
- Test implementation details
- Test third-party libs
- Over-mock
- Skip edge cases

---

## Common Patterns

### Mocking localStorage
```typescript
beforeEach(() => {
  localStorage.clear();
});
```

### Mocking console
```typescript
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
// ... test
spy.mockRestore();
```

### Async tests
```typescript
it('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### User events
```typescript
import userEvent from '@testing-library/user-event';

it('types in input', async () => {
  const user = userEvent.setup();
  render(<Input />);
  
  await user.type(screen.getByRole('textbox'), 'hello');
  expect(screen.getByRole('textbox')).toHaveValue('hello');
});
```

---

## CI Integration

Already configured in `.github/workflows/deploy.yml`:
```yaml
- name: Run tests
  run: npm test -- --run

- name: Check coverage
  run: npm run test:coverage
```

---

## Troubleshooting

### Test not found
- Check file naming: `*.test.ts` or `*.test.tsx`
- Check location: `__tests__` folder or co-located

### Import errors
- Check vitest.config.ts setup
- Verify setupFiles is correct

### Coverage low
- Run with `--coverage` flag
- Check coverage report
- Add tests for uncovered lines

---

## Examples in Codebase

- ✅ `src/utils/__tests__/exportData.test.ts`
- ✅ `src/hooks/__tests__/useLocalStorage.test.ts`
- ✅ `src/components/__tests__/ErrorBoundary.test.tsx`
- ✅ `src/components/__tests__/LoadingSpinner.test.tsx`

---

**Happy Testing! 🧪**
