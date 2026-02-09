# Flexbox Axes Diagram

## Row Direction (default)

```
flex-direction: row

Main Axis (horizontal) →
┌──────────────────────────────────────────────┐
│                                              │
│  ┌─────┐  ┌─────┐  ┌─────┐                 │  ↕
│  │  1  │  │  2  │  │  3  │                 │  
│  └─────┘  └─────┘  └─────┘                 │  Cross Axis
│                                              │  (vertical)
│                                              │  ↕
└──────────────────────────────────────────────┘

justify-content: controls main axis (→)
align-items: controls cross axis (↕)
```

## Column Direction

```
flex-direction: column

┌────────────┐
│            │
│  ┌─────┐  │  ↕
│  │  1  │  │  
│  └─────┘  │  Main Axis
│            │  (vertical)
│  ┌─────┐  │  
│  │  2  │  │  ↕
│  └─────┘  │
│            │
│  ┌─────┐  │
│  │  3  │  │
│  └─────┘  │
│            │
└────────────┘
    ↔
  Cross Axis
 (horizontal)

justify-content: controls main axis (↕)
align-items: controls cross axis (↔)
```

## Justify Content Examples

```
flex-start (default)
┌──────────────────────┐
│ [1] [2] [3]         │
└──────────────────────┘

flex-end
┌──────────────────────┐
│          [1] [2] [3]│
└──────────────────────┘

center
┌──────────────────────┐
│      [1] [2] [3]    │
└──────────────────────┘

space-between
┌──────────────────────┐
│ [1]      [2]     [3]│
└──────────────────────┘

space-around
┌──────────────────────┐
│  [1]    [2]    [3]  │
└──────────────────────┘

space-evenly
┌──────────────────────┐
│   [1]   [2]   [3]   │
└──────────────────────┘
```

## Align Items Examples

```
stretch (default)
┌──────────────┐
│ ┌──┐ ┌──┐ ┌──┐ │
│ │  │ │  │ │  │ │
│ │  │ │  │ │  │ │
│ └──┘ └──┘ └──┘ │
└──────────────┘

flex-start
┌──────────────┐
│ ┌─┐  ┌─┐  ┌─┐  │
│ └─┘  └─┘  └─┘  │
│              │
└──────────────┘

flex-end
┌──────────────┐
│              │
│ ┌─┐  ┌─┐  ┌─┐  │
│ └─┘  └─┘  └─┘  │
└──────────────┘

center
┌──────────────┐
│              │
│ ┌─┐  ┌─┐  ┌─┐  │
│ └─┘  └─┘  └─┘  │
│              │
└──────────────┘
```
