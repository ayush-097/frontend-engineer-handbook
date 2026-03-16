# Virtualization

## The Problem

```tsx
// 10,000 items × 50px each = 500,000px tall list
// Browser must:
// - Create 10,000 DOM nodes
// - Paint 10,000 items
// - Keep 10,000 nodes in memory
// Result: Slow initial render, laggy scrolling

<ul>
  {items.map(item => (
    <li key={item.id}>{item.text}</li>
  ))}
</ul>
```

## The Solution: Virtualization

Only render what's visible + small buffer:

```tsx
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}           // Container height
  itemCount={10000}      // Total items
  itemSize={50}          // Each item height
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>{items[index].text}</div>
  )}
</FixedSizeList>

// Now:
// - Only ~15 DOM nodes (visible items + buffer)
// - Instant render
// - Smooth 60fps scrolling
```

## Variable Height Items

```tsx
import { VariableSizeList } from "react-window";

const getItemSize = (index) => {
  // Return height for each item
  return items[index].isExpanded ? 200 : 50;
};

<VariableSizeList
  height={600}
  itemCount={items.length}
  itemSize={getItemSize}
  width="100%"
>
  {Row}
</VariableSizeList>
```

## Infinite Scroll

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteLoader from "react-window-infinite-loader";

function InfiniteList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  });

  const items = data?.pages.flatMap(page => page.posts) ?? [];

  return (
    <InfiniteLoader
      isItemLoaded={index => index < items.length}
      itemCount={hasNextPage ? items.length + 1 : items.length}
      loadMoreItems={fetchNextPage}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={600}
          itemCount={items.length}
          itemSize={50}
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```
