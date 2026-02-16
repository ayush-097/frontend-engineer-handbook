import React, { useMemo } from "react";

interface ListProps<T> {
  /** Source array — T is inferred from this */
  items: T[];
  /** Return a stable key for each item */
  keyExtractor: (item: T, index: number) => string | number;
  /** Render a single item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Predicate — only items where filter returns true are shown */
  filter?: (item: T) => boolean;
  /** Comparator for sorting — same signature as Array.prototype.sort */
  sort?: (a: T, b: T) => number;
  /** Rendered when no items pass the filter (or the list is empty) */
  renderEmpty?: () => React.ReactNode;
  /** Optional header above the list */
  renderHeader?: () => React.ReactNode;
  /** Optional footer below the list */
  renderFooter?: () => React.ReactNode;
  /** Class applied to the outer wrapper div */
  className?: string;
  /** Style applied to each <li> */
  itemStyle?: React.CSSProperties;
}

/**
 * List<T>
 *
 * A generic, filter-and-sort capable list component.
 * All callbacks (filter, sort, renderItem, keyExtractor) receive the
 * correct T type — inferred from the `items` prop.
 *
 * @example
 * ```tsx
 * <List
 *   items={products}
 *   keyExtractor={(p) => p.sku}
 *   filter={(p) => p.inStock}
 *   sort={(a, b) => a.price - b.price}
 *   renderItem={(p, i) => <ProductCard product={p} rank={i + 1} />}
 *   renderEmpty={() => <p>No products in stock</p>}
 * />
 * ```
 */
export function List<T>({
  items,
  keyExtractor,
  renderItem,
  filter,
  sort,
  renderEmpty = () => <p style={{ color: "#6b7280", textAlign: "center" }}>No items</p>,
  renderHeader,
  renderFooter,
  className,
  itemStyle,
}: ListProps<T>): React.ReactElement {
  const processedItems = useMemo(() => {
    let result = [...items];
    if (filter) result = result.filter(filter);
    if (sort) result = result.sort(sort);
    return result;
  }, [items, filter, sort]);

  return (
    <div className={className}>
      {renderHeader?.()}

      {processedItems.length === 0 ? (
        renderEmpty()
      ) : (
        <ul
          role="list"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {processedItems.map((item, index) => (
            <li
              key={keyExtractor(item, index)}
              role="listitem"
              style={itemStyle}
            >
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}

      {renderFooter?.()}
    </div>
  );
}
