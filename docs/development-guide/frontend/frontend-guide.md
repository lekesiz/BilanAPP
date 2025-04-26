# Frontend Development Guide

## Table of Contents
1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Components](#components)
4. [State Management](#state-management)
5. [Routing](#routing)
6. [Styling](#styling)
7. [API Integration](#api-integration)
8. [Testing](#testing)
9. [Performance](#performance)
10. [Deployment](#deployment)

## Architecture

### Tech Stack
- React 18.x
- TypeScript 5.x
- Redux Toolkit
- React Router 6.x
- Tailwind CSS
- Jest & React Testing Library
- Vite

### Project Setup
```bash
# Create new project
npm create vite@latest bilan-app -- --template react-ts

# Install dependencies
npm install @reduxjs/toolkit react-redux react-router-dom
npm install @headlessui/react @heroicons/react
npm install tailwindcss postcss autoprefixer
npm install axios @tanstack/react-query
npm install jest @testing-library/react @testing-library/jest-dom
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
│   ├── common/      # Shared components
│   ├── layout/      # Layout components
│   └── features/    # Feature-specific components
├── hooks/           # Custom hooks
├── pages/           # Page components
├── services/        # API services
├── store/           # Redux store
├── types/           # TypeScript types
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Components

### Component Structure
```typescript
// components/common/Button.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};
```

### Component Composition
```typescript
// components/features/UserProfile.tsx
import React from 'react';
import { Avatar } from './Avatar';
import { UserInfo } from './UserInfo';
import { UserActions } from './UserActions';

interface UserProfileProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center space-x-4">
        <Avatar src={user.avatar} size="lg" />
        <UserInfo user={user} />
      </div>
      <UserActions user={user} onUpdate={onUpdate} />
    </div>
  );
};
```

## State Management

### Redux Store Setup
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slice Example
```typescript
// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  }
});

export const { setProfile, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
```

## Routing

### Route Configuration
```typescript
// routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { Login } from '../pages/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: 'login',
        element: <Login />
      }
    ]
  }
]);
```

### Protected Route
```typescript
// routes/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

## Styling

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... other shades
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      }
    }
  },
  plugins: []
};
```

### Custom Components
```typescript
// components/common/Card.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={twMerge(
      'bg-white rounded-lg shadow-sm p-6',
      className
    )}>
      {children}
    </div>
  );
};
```

## API Integration

### API Client
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Custom Hook
```typescript
// hooks/useApi.ts
import { useState, useCallback } from 'react';
import api from '../services/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<T>(endpoint);
      setData(response.data);
      options.onSuccess?.(response.data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  return { data, loading, error, fetch };
}
```

## Testing

### Component Test
```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### API Test
```typescript
// services/api.test.ts
import api from './api';
import { vi } from 'vitest';

describe('API', () => {
  it('adds auth token to requests', async () => {
    localStorage.setItem('token', 'test-token');
    const mock = vi.spyOn(api, 'get');
    
    await api.get('/test');
    
    expect(mock).toHaveBeenCalledWith('/test', {
      headers: {
        Authorization: 'Bearer test-token'
      }
    });
  });
});
```

## Performance

### Code Splitting
```typescript
// pages/Dashboard.tsx
import { lazy, Suspense } from 'react';
import { Loading } from '../components/common/Loading';

const DashboardContent = lazy(() => import('./DashboardContent'));

export const Dashboard = () => {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
};
```

### Memoization
```typescript
// components/UserList.tsx
import { memo, useCallback } from 'react';

interface UserListProps {
  users: User[];
  onSelect: (user: User) => void;
}

export const UserList = memo(({ users, onSelect }: UserListProps) => {
  const handleSelect = useCallback((user: User) => {
    onSelect(user);
  }, [onSelect]);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => handleSelect(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
});
```

## Deployment

### Build Configuration
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh
npm run build
aws s3 sync dist/ s3://bilan-app-frontend/
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
``` 