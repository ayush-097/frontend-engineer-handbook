import React, { useId } from "react";

interface SelectProps<T> {
  /** Options array — T is inferred from this */
  options: T[];
  /** Currently selected value (null = nothing selected) */
  value: T | null;
  /** Called with the full T object (not just the string value) */
  onChange: (value: T | null) => void;
  /** How to display each option in the list */
  getLabel: (option: T) => string;
  /** The underlying <option> value — must produce a unique string or number */
  getValue: (option: T) => string | number;
  /** Placeholder shown when value is null */
  placeholder?: string;
  /** Disable the select */
  disabled?: boolean;
  /** Label text rendered above the select */
  label?: string;
  /** Show a required asterisk */
  required?: boolean;
  /** Error message rendered below the select */
  errorMessage?: string;
  /** class applied to the outer wrapper */
  className?: string;
  /** Native name attribute */
  name?: string;
  /** Native id attribute (auto-generated if not supplied) */
  id?: string;
}

/**
 * Select<T>
 *
 * A type-safe dropdown for any item type.
 * `onChange` receives the full T object — not just a string key —
 * so callers never need to look the item up again.
 *
 * @example
 * ```tsx
 * <Select
 *   options={users}
 *   value={selectedUser}
 *   onChange={(u) => setSelectedUser(u)}   // u: User | null
 *   getLabel={(u) => u.name}
 *   getValue={(u) => u.id}
 *   placeholder="Select a team member…"
 * />
 * ```
 */
export function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Select…",
  disabled = false,
  label,
  required = false,
  errorMessage,
  className,
  name,
  id: propId,
}: SelectProps<T>): React.ReactElement {
  const autoId = useId();
  const id = propId ?? autoId;

  const currentValue = value !== null ? String(getValue(value)) : "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value;

    if (!raw) {
      onChange(null);
      return;
    }

    const found = options.find((opt) => String(getValue(opt)) === raw);
    onChange(found ?? null);
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} style={{ display: "block", marginBottom: 4 }}>
          {label}
          {required && <span aria-hidden> *</span>}
        </label>
      )}

      <select
        id={id}
        name={name}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        style={{ display: "block", width: "100%", padding: "6px 8px" }}
      >
        {/* Placeholder option */}
        {!required && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}

        {options.map((option) => {
          const optValue = String(getValue(option));
          return (
            <option key={optValue} value={optValue}>
              {getLabel(option)}
            </option>
          );
        })}
      </select>

      {errorMessage && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
