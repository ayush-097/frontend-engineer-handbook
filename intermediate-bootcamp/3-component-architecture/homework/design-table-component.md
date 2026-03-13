# Homework: Design Table Component

Design a flexible DataTable component API that supports infinite use cases without bloating the props interface.

## Requirements

Your DataTable must support:
1. Sortable columns
2. Filterable columns
3. Row selection (single or multi)
4. Expandable rows
5. Custom cell rendering
6. Pagination
7. Loading states
8. Empty states
9. Sticky header
10. Resizable columns

## Constraints

- **No more than 10 top-level props**
- Must use composition patterns
- Type-safe with TypeScript
- Accessible (ARIA attributes)

## Example Usage

```tsx
<DataTable data={users}>
  <DataTable.Column field="name" sortable>
    Name
  </DataTable.Column>
  <DataTable.Column field="email">
    Email
  </DataTable.Column>
  <DataTable.Column>
    {(user) => <Button onClick={() => edit(user)}>Edit</Button>}
  </DataTable.Column>
  <DataTable.Pagination pageSize={10} />
</DataTable>
```

## Deliverables
1. TypeScript interface definitions
2. Example usage code (5+ scenarios)
3. Justification document (500 words)

## Grading: 100 pts
