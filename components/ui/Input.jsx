// flowdesk-frontend/components/ui/Input.jsx

import { useState, forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    hint,
    icon,
    iconRight,
    disabled = false,
    readOnly = false,
    autoComplete,
    autoFocus,
    maxLength,
    onKeyDown,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    style: extraStyle = {},
    inputStyle = {},
    size = "md",
    required,
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  const sizes = {
    sm: { padding: "5px 10px", fontSize: 12, height: 30 },
    md: { padding: "8px 12px", fontSize: 13, height: 38 },
    lg: { padding: "11px 14px", fontSize: 14, height: 46 },
  };
  const s = sizes[size] || sizes.md;
  const paddingLeft = icon ? ${parseInt(s.padding) + 26}px : s.padding.split(" ")[1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...extraStyle }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#8b949e",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
          {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}

      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: focused ? "#818cf8" : "#6e7681",
              pointerEvents: "none",
              transition: "color 0.2s",
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          required={required}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            setFocused(true);
            onFocusProp?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlurProp?.(e);
          }}
          style={{
            width: "100%",
            boxSizing: "border-box",
            height: s.height,
            padding: s.padding,
            paddingLeft: icon ? 32 : s.padding.split(" ")[1],
            paddingRight: iconRight ? 32 : s.padding.split(" ")[1],
            fontSize: s.fontSize,
            background: disabled || readOnly ? "rgba(255,255,255,0.03)" : "#161622",
            border: 1px solid ${error ? "#ef4444" : focused ? "#4f46e5" : "#2d2d3f"},
            borderRadius: 8,
            color: disabled ? "#6e7681" : "#e6edf3",
            outline: "none",
            fontFamily: "inherit",
            cursor: disabled ? "not-allowed" : readOnly ? "default" : "text",
            transition: "border-color 0.2s",
            ...inputStyle,
          }}
        />

        {iconRight && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: "#6e7681",
              pointerEvents: "none",
            }}
          >
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
          <span>⚠</span> {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: "#6e7681" }}>{hint}</div>
      )}
    </div>
  );
});

export default Input;
