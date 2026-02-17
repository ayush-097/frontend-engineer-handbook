# Lab: Compound Components

Build three compound component families that share state through context. Each must be fully typed, accessible (ARIA), and tested.

## Components to Build

### 1. `Tabs` — Keyboard-navigable tab panel
- `<Tabs defaultTab="...">` — root, manages active tab state
- `<Tabs.List>` — wraps all triggers, handles arrow key navigation
- `<Tabs.Trigger tab="...">` — clickable tab button
- `<Tabs.Panel tab="...">` — content panel (rendered lazily on first activation)

### 2. `Accordion` — Collapsible sections
- `<Accordion>` — root, manages open items
- `<Accordion.Item id="...">` — individual section wrapper
- `<Accordion.Trigger itemId="...">` — toggle button
- `<Accordion.Panel itemId="...">` — collapsible content

### 3. `Select` — Accessible custom dropdown
- `<Select value={...} onChange={...}>` — root with controlled value
- `<Select.Trigger>` — opens/closes the listbox
- `<Select.Listbox>` — option container
- `<Select.Option value="...">` — selectable option

## Key Requirements
- All state managed in root component via context
- ARIA attributes correct (role, aria-selected, aria-expanded, aria-controls)
- Keyboard navigation: arrow keys, Enter, Space, Escape, Tab
- TypeScript: sub-components attached as static properties with types
- No `any`

## Time Estimate: 4–5 hours
