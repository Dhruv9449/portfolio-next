# Portfolio Architecture Documentation

This document outlines the architecture and organization of the Mac-based portfolio website.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── apps/             # Application components
│   ├── common/           # Common/shared components
│   ├── desktopIcon/      # Desktop icon component
│   ├── dock/             # Dock component
│   ├── topbar/           # Top bar component
│   └── window/           # Window wrapper component
├── config/               # Configuration files
│   ├── browserConfig.ts  # Browser favorites configuration
│   ├── dockConfig.ts     # Dock icons configuration
│   ├── desktopConfig.ts  # Desktop icons configuration
│   └── index.ts          # Central config export
├── constants/            # Application constants
│   └── index.ts          # All constants
├── data/                 # JSON data files
│   ├── experienceData.json
│   ├── projectData.json
│   ├── schoolData.json
│   └── skillsData.json
├── hooks/                # Custom React hooks
│   ├── useWindowManager.ts  # Multi-window management
│   ├── useSingleWindow.ts   # Single window management
│   ├── useResponsive.ts     # Responsive detection
│   └── index.ts             # Central hooks export
├── types/                # TypeScript type definitions
│   └── index.ts          # All type definitions
└── utils/                # Utility functions
    ├── windowHelpers.ts  # Window-related utilities
    └── index.ts          # Central utils export
```

## Key Concepts

### 1. Separation of Concerns

- **Components**: Only contain UI logic and rendering
- **Hooks**: Contain reusable state management logic
- **Config**: Store static configuration and data
- **Types**: Centralized TypeScript definitions
- **Utils**: Pure utility functions with no side effects

### 2. Window Management

Two custom hooks handle window management:

#### `useWindowManager<T>`
Manages multiple instances of the same window type (e.g., Finder windows, File windows).

```typescript
const finderManager = useWindowManager<FinderWindowConfig>();
finderManager.openWindow({ name: "projects", displayName: "Projects" });
finderManager.closeWindow(windowId);
```

#### `useSingleWindow()`
Manages a single instance of a window (e.g., Chrome, Terminal, VSCode).

```typescript
const browser = useSingleWindow(false);
browser.open();
browser.close();
browser.toggle();
```

### 3. Configuration Management

All hard-coded data has been moved to configuration files:

- `browserConfig.ts`: Browser favorites and bookmarks
- `dockConfig.ts`: Dock icon configuration
- `desktopConfig.ts`: Desktop icon layout

This makes it easy to add/remove/modify items without touching component code.

### 4. Type Safety

All interfaces and types are defined in `/src/types/index.ts`, providing:
- Type checking across the application
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

### 5. Constants

Application-wide constants are centralized in `/src/constants/index.ts`:
- Window sizing defaults
- Responsive breakpoints
- API endpoints
- Social links
- User information

## Best Practices

### Adding a New Window Type

1. Define the window config type in `/src/types/index.ts`
2. Use `useSingleWindow()` or `useWindowManager<T>()` in `page.tsx`
3. Create the window component in `/src/components/apps/`
4. Add configuration if needed in `/src/config/`

### Adding Configuration Data

1. Add your data to appropriate config file in `/src/config/`
2. Export it from `/src/config/index.ts`
3. Import and use in components

### Creating Utility Functions

1. Add function to appropriate file in `/src/utils/`
2. Export from `/src/utils/index.ts`
3. Use across components

### Adding Types

1. Define types in `/src/types/index.ts`
2. Use throughout the application
3. Extend base types when needed

## Component Conventions

### Naming
- Components: PascalCase (e.g., `ChromeBrowser`)
- CSS Modules: camelCase classes (e.g., `styles.dockIcon`)
- Files: camelCase (e.g., `chromeBrowser.tsx`)
- Folders: camelCase (e.g., `chromeBrowser/`)

### File Structure
Each component should have:
- `componentName.tsx` - Component logic
- `componentName.module.css` - Component styles

### Props
- Use interfaces for prop types
- Extend base types when applicable (e.g., `BaseWindowProps`)
- Document complex props with JSDoc comments

## Styling Conventions

- Use CSS Modules (`.module.css`) for all component styles
- Use camelCase for class names in CSS modules
- Avoid global styles except in `globals.css`
- Keep component-specific styles in component files

## Import Conventions

Use path aliases for clean imports:
```typescript
import { useWindowManager } from "@/hooks";
import { IconData } from "@/types";
import { desktopIcons } from "@/config";
import { WINDOW_OFFSET } from "@/constants";
import { getIconPath } from "@/utils";
```

## Performance Considerations

1. **Code Splitting**: Components are lazy-loaded when windows open
2. **Memoization**: Consider using `React.memo()` for expensive renders
3. **Window Management**: Only render open windows
4. **Responsive Design**: Mobile users see simplified view

## Future Improvements

- Add error boundaries for better error handling
- Implement window z-index management
- Add keyboard shortcuts
- Implement window minimize functionality
- Add animation libraries for smoother transitions
- Consider state management library (Redux/Zustand) for complex state

