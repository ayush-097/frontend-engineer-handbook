# CSS Grid Layout Diagram

## Basic Grid Structure

```
grid-template-columns: 1fr 1fr 1fr
grid-template-rows: 100px auto 100px

     Column 1    Column 2    Column 3
    ┌──────────┬──────────┬──────────┐
    │          │          │          │
Row 1│  Cell 1  │  Cell 2  │  Cell 3  │ 100px
    │          │          │          │
    ├──────────┼──────────┼──────────┤
    │          │          │          │
Row 2│  Cell 4  │  Cell 5  │  Cell 6  │ auto
    │          │          │          │
    ├──────────┼──────────┼──────────┤
    │          │          │          │
Row 3│  Cell 7  │  Cell 8  │  Cell 9  │ 100px
    │          │          │          │
    └──────────┴──────────┴──────────┘
       1fr        1fr        1fr
```

## Grid Lines

```
        Line 1   Line 2   Line 3   Line 4
           ↓        ↓        ↓        ↓
Line 1 →   ┌────────┬────────┬────────┐
           │        │        │        │
Line 2 →   ├────────┼────────┼────────┤
           │        │        │        │
Line 3 →   ├────────┼────────┼────────┤
           │        │        │        │
Line 4 →   └────────┴────────┴────────┘

/* Span from line 1 to line 3 (2 columns) */
grid-column: 1 / 3;

/* Span 2 columns */
grid-column: span 2;
```

## Named Grid Areas

```
grid-template-areas:
  "header  header  header"
  "sidebar main    main  "
  "footer  footer  footer";

┌─────────────────────────────┐
│         HEADER              │
├──────────┬──────────────────┤
│ SIDEBAR  │      MAIN        │
│          │                  │
├──────────┴──────────────────┤
│         FOOTER              │
└─────────────────────────────┘

header  { grid-area: header; }
sidebar { grid-area: sidebar; }
main    { grid-area: main; }
footer  { grid-area: footer; }
```

## Auto-Fill vs Auto-Fit

```
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

[────200px────][────200px────][────200px────][empty][empty]
  Item 1         Item 2         Item 3      (ghost) (ghost)

grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

[────────────][────────────][────────────]
   Item 1         Item 2         Item 3
(Items expand to fill available space)
```

## Grid Gap

```
gap: 20px;
(or row-gap: 20px; column-gap: 20px;)

┌────┐ 20px ┌────┐ 20px ┌────┐
│ 1  │ ──→  │ 2  │ ──→  │ 3  │
└────┘      └────┘      └────┘
  ↓ 20px      ↓ 20px      ↓ 20px
┌────┐      ┌────┐      ┌────┐
│ 4  │      │ 5  │      │ 6  │
└────┘      └────┘      └────┘
```
