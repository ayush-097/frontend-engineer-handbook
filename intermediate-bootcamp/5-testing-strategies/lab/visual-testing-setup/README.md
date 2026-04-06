# Lab: Visual Testing Setup

Configure Storybook and Chromatic for visual regression testing.

## Tasks

### 1. Setup Storybook
```bash
npx storybook@latest init
```

### 2. Write Stories
Create stories for Button, Card, Modal components:
```tsx
export const Primary: Story = {
  args: { variant: "primary", children: "Click Me" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};
```

### 3. Configure Chromatic
```bash
npx chromatic --project-token=<token>
```

### 4. Add to CI
```yaml
- name: Visual Tests
  run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

**Time:** 2-3 hours  
**Deliverable:** Storybook + Chromatic configured with 10+ stories
