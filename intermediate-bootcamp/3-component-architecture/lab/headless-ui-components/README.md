# Lab: Headless UI Components

Build headless (logic-only) UI components that separate behavior from presentation.

## Components to Build

### 1. useSelect Hook
```tsx
const { isOpen, selectedValue, open, close, select, getItemProps } = useSelect({
  items: ["Apple", "Banana", "Orange"],
  onSelect: (item) => console.log(item)
});

return (
  <div>
    <button onClick={open}>{selectedValue || "Select..."}</button>
    {isOpen && (
      <ul>
        {items.map((item, index) => (
          <li {...getItemProps({ item, index })} key={item}>
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

### 2. useDialog Hook
```tsx
const { isOpen, open, close, dialogProps, overlayProps } = useDialog();

return (
  <>
    <button onClick={open}>Open Dialog</button>
    {isOpen && (
      <>
        <div {...overlayProps} />
        <div {...dialogProps}>
          <h2>Dialog Title</h2>
          <button onClick={close}>Close</button>
        </div>
      </>
    )}
  </>
);
```

### 3. useToggle Hook
```tsx
const { on, toggle, setOn, setOff } = useToggle(false);
```

## Features
- Keyboard navigation (Arrow keys, Enter, Escape)
- ARIA attributes
- Focus management
- Click outside detection
- Accessible by default

## Time: 4-5 hours
