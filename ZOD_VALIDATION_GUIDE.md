# 🔒 Zod Validation Guide

## Overview
Zod fornece **type-safe runtime validation** para dados do app.

---

## Quick Start

### Install
```bash
npm install zod
```

### Import Schemas
```typescript
import { taskSchema, goalSchema, themeSchema } from '@/schemas/validation';
```

---

## Usage Examples

### Validate Task
```typescript
import { taskSchema, safeParse } from '@/schemas/validation';

const createTask = (formData: unknown) => {
  // Safe validation
  const result = safeParse(taskSchema, formData);
  
  if (!result.success) {
    console.error('Validation failed:', result.error);
    return;
  }
  
  // Type-safe data
  const task = result.data;
  await supabase.from('tasks').insert(task);
};
```

### Validate with Throw
```typescript
import { validate, taskSchema } from '@/schemas/validation';

const createTask = (formData: unknown) => {
  try {
    const task = validate(taskSchema, formData);
    await supabase.from('tasks').insert(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = getErrorMessages(error);
      toast.error(messages.join(', '));
    }
  }
};
```

### Form Validation
```typescript
import { taskSchema } from '@/schemas/validation';

const TaskForm = () => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const result = safeParse(taskSchema, {
      title: formData.get('title'),
      summary: formData.get('summary'),
      priority: formData.get('priority'),
    });
    
    if (!result.success) {
      setErrors(getErrorMessages(result.error));
      return;
    }
    
    // Submit valid data
    submitTask(result.data);
  };
};
```

---

## Available Schemas

### Task
```typescript
taskSchema.parse({
  title: 'Study React',
  summary: 'Learn hooks',
  priority: 'high',
  due_date: '2026-01-10T10:00:00Z'
});
```

### Goal
```typescript
goalSchema.parse({
  title: 'Complete course',
  category: 'Education',
  deadline: '2026-12-31T23:59:59Z'
});
```

### Theme
```typescript
themeSchema.parse({
  title: 'Programming',
  color: '#3b82f6',
  icon: 'Code'
});
```

### Project
```typescript
projectSchema.parse({
  title: 'New App',
  status: 'planning',
  progress: 0
});
```

---

## Validation Rules

### Task
- title: 1-200 chars (required)
- summary: max 1000 chars
- priority: 'low' | 'medium' | 'high'
- dates: ISO datetime format

### Goal
- title: 1-200 chars (required)
- category: max 100 chars
- dates: ISO datetime format

### Theme
- title: 1-100 chars (required)
- color: hex format (#RRGGBB)
- icon: max 50 chars

### Project
- title: 1-200 chars (required)
- description: max 2000 chars
- status: 'planning' | 'active' | 'completed' | 'archived'
- progress: 0-100

---

## Error Handling

### Get Error Messages
```typescript
import { getErrorMessages } from '@/schemas/validation';

const result = safeParse(taskSchema, invalidData);
if (!result.success) {
  const messages = getErrorMessages(result.error);
  // ['Título é obrigatório', 'Título muito longo']
}
```

### Display Errors
```typescript
const [errors, setErrors] = useState<string[]>([]);

const validate = (data: unknown) => {
  const result = safeParse(taskSchema, data);
  if (!result.success) {
    setErrors(getErrorMessages(result.error));
  }
};

// In JSX
{errors.map(error => (
  <p className="text-red-500">{error}</p>
))}
```

---

## Best Practices

### ✅ DO
```typescript
// Validate user input
const result = safeParse(taskSchema, userInput);

// Use safeParse for expected failures
if (!result.success) {
  handleError(result.error);
}

// Type inference
type Task = z.infer<typeof taskSchema>;
```

### ❌ DON'T
```typescript
// Don't skip validation
await supabase.from('tasks').insert(userInput); // ❌

// Don't trust client data
const isValid = userInput.title?.length > 0; // ❌
```

---

## Integration Examples

### With React Hook Form
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const TaskForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema)
  });
  
  const onSubmit = (data) => {
    // Data is already validated!
    submitTask(data);
  };
};
```

### With API Routes
```typescript
export async function createTask(req, res) {
  const result = safeParse(taskSchema, req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      errors: getErrorMessages(result.error) 
    });
  }
  
  const task = await db.tasks.create(result.data);
  res.json(task);
}
```

---

## Custom Schemas

### Create Custom Schema
```typescript
import { z } from 'zod';

const customSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  website: z.string().url().optional()
});
```

### Extend Existing Schema
```typescript
const extendedTaskSchema = taskSchema.extend({
  customField: z.string().optional()
});
```

---

## Testing

### Test Validation
```typescript
import { taskSchema } from '@/schemas/validation';

describe('taskSchema', () => {
  it('validates correct data', () => {
    const valid = { title: 'Test' };
    expect(() => taskSchema.parse(valid)).not.toThrow();
  });
  
  it('rejects invalid data', () => {
    const invalid = { title: '' };
    expect(() => taskSchema.parse(invalid)).toThrow();
  });
});
```

---

**Type-safe validation! 🔒**
