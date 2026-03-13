# Lab: Polymorphic Components

Build type-safe polymorphic components that adapt to different HTML elements while maintaining full TypeScript inference.

## Learning Objectives

- Implement the `as` prop pattern for element polymorphism
- Write TypeScript generics for polymorphic component types
- Forward refs correctly with polymorphic components
- Test polymorphic behavior across different elements

## Components to Build

### 1. Polymorphic Button

```tsx
<Button onClick={...}>Click Me</Button>
// → <button onClick={...}>Click Me</button>

<Button as="a" href="/home">Go Home</Button>
// → <a href="/home">Go Home</a>

<Button as={Link} to="/dashboard">Dashboard</Button>
// → <Link to="/dashboard">Dashboard</Link>
```

**Requirements:**
- Type safety: If `as="a"`, TypeScript requires `href`
- Accepts all props valid for the target element
- Forwards refs correctly
- Maintains button styling regardless of element

### 2. Polymorphic Heading

```tsx
<Heading as="h1">Main Title</Heading>
<Heading as="h2">Subsection</Heading>
<Heading as="h3">Sub-subsection</Heading>
```

**Features:**
- Default to `h2`
- Font size based on heading level
- Optional `variant` prop overrides default size

### 3. Polymorphic Text

```tsx
<Text as="p">Paragraph</Text>
<Text as="span" color="muted">Inline text</Text>
<Text as="label" htmlFor="email">Email</Text>
```

## Implementation Guide

### TypeScript Types

```tsx
// src/types.ts
import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react";

export type PolymorphicProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
}> & ComponentPropsWithoutRef<T>;

// Example usage
function Button<T extends ElementType = "button">({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as || "button";
  return <Component {...props}>{children}</Component>;
}
```

### With Ref Forwarding

```tsx
import { forwardRef, ComponentPropsWithRef, ElementType } from "react";

type PolymorphicRef<T extends ElementType> = ComponentPropsWithRef<T>["ref"];

type PolymorphicPropsWithRef<T extends ElementType> = PolymorphicProps<T> & {
  ref?: PolymorphicRef<T>;
};

export const Button = forwardRef(function Button<T extends ElementType = "button">(
  { as, children, ...props }: PolymorphicProps<T>,
  ref?: PolymorphicRef<T>
) {
  const Component = as || "button";
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
});
```

### With Custom Props

```tsx
type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  
  const classes = clsx(
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && "btn-full-width",
    className
  );
  
  return <Component className={classes} {...props} />;
}
```

## Acceptance Criteria

### Button Component
- [ ] Renders as `<button>` by default
- [ ] Renders as `<a>` when `as="a"` with `href` prop
- [ ] Renders as custom component when `as={Component}`
- [ ] TypeScript errors if wrong props for element type
- [ ] Forwards ref correctly
- [ ] Maintains button styles on all element types
- [ ] Supports `variant`, `size`, `fullWidth` props

### Heading Component
- [ ] Defaults to `h2`
- [ ] Accepts `h1` through `h6` as `as` prop
- [ ] Font size matches heading level
- [ ] Variant prop overrides default styling
- [ ] TypeScript prevents invalid heading levels

### Text Component
- [ ] Works as `p`, `span`, `label`, etc.
- [ ] Color variants: `default`, `muted`, `primary`, `danger`
- [ ] Weight variants: `normal`, `medium`, `bold`
- [ ] All native props of target element work

## File Structure

```
src/
  components/
    Button.tsx
    Heading.tsx
    Text.tsx
  types/
    polymorphic.ts
  App.tsx
```

## Testing

```tsx
// Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders as button by default", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as link when as='a'", () => {
    render(<Button as="a" href="/home">Home</Button>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("accepts button-specific props", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("accepts anchor-specific props", () => {
    render(<Button as="a" href="/" target="_blank">Open</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  it("applies variant classes", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-danger");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

## Example Usage

```tsx
import { Button, Heading, Text } from "./components";
import { Link } from "react-router-dom";

function App() {
  return (
    <div>
      {/* Button as native elements */}
      <Button onClick={() => alert("Clicked")}>
        Click Me
      </Button>
      
      <Button as="a" href="https://example.com" target="_blank">
        External Link
      </Button>
      
      {/* Button as React Router Link */}
      <Button as={Link} to="/dashboard" variant="primary">
        Go to Dashboard
      </Button>
      
      {/* Heading hierarchy */}
      <Heading as="h1">Main Title</Heading>
      <Heading as="h2">Section</Heading>
      <Heading as="h3">Subsection</Heading>
      
      {/* Text with different elements */}
      <Text as="p">This is a paragraph</Text>
      <Text as="span" color="muted">Inline muted text</Text>
      <Text as="label" htmlFor="email" weight="medium">
        Email Address
      </Text>
      
      {/* Polymorphic button in a form */}
      <form>
        <Button type="submit" variant="primary" fullWidth>
          Submit Form
        </Button>
      </form>
    </div>
  );
}
```

## Common Pitfalls

### ❌ Forgetting to spread props
```tsx
// Missing ...props
<Component className={classes}>{children}</Component>
```

### ✅ Always spread
```tsx
<Component className={classes} {...props}>{children}</Component>
```

---

### ❌ Incorrect type constraint
```tsx
// Too loose - accepts any type
type ButtonProps<T> = { as?: T };

// Too strict - only strings
type ButtonProps = { as?: "button" | "a" };
```

### ✅ Correct constraint
```tsx
type ButtonProps<T extends ElementType> = { as?: T };
```

---

### ❌ Props conflict
```tsx
// className from props overwrites our className
<Component className={classes} {...props} />
```

### ✅ Merge classes
```tsx
<Component {...props} className={clsx(classes, props.className)} />
```

## Extensions

After completing the basics:

- [ ] Add loading state with spinner
- [ ] Add icon slots (left/right)
- [ ] Implement disabled styling
- [ ] Add focus-visible styles
- [ ] Support different button shapes (pill, square, circle)
- [ ] Create polymorphic Container component
- [ ] Build polymorphic Stack layout component

## Time Estimate: 3-4 hours

## Deliverables

1. Complete implementation (Button, Heading, Text)
2. Type definitions in separate file
3. Full test suite (15+ tests)
4. Example app demonstrating all use cases
5. README with API documentation

## Resources

- [Polymorphic Components in React](https://blog.logrocket.com/build-strongly-typed-polymorphic-components-react-typescript/)
- [TypeScript Generics Guide](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [React forwardRef](https://react.dev/reference/react/forwardRef)
