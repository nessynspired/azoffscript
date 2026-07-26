"use client";

import { useState, useEffect } from "react";

/**
 * DropdownOrOther — a dropdown of preset options with an "Other" choice
 * that reveals a free-text input when selected.
 *
 * Usage:
 *   <DropdownOrOther
 *     label="Public title"
 *     value={publicTitle}
 *     onChange={setPublicTitle}
 *     options={PUBLIC_TITLE_OPTIONS}
 *     placeholder="Pick a title or write your own"
 *   />
 */
interface DropdownOrOtherProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  textarea?: boolean;
}

const OTHER = "__other__";

export function DropdownOrOther({
  label,
  value,
  onChange,
  options,
  placeholder = "Pick one or write your own",
  className = "",
  textarea = false,
}: DropdownOrOtherProps) {
  const isPreset = value && options.includes(value as any);
  const [mode, setMode] = useState<"dropdown" | "other">(isPreset ? "dropdown" : value ? "other" : "dropdown");
  const [otherText, setOtherText] = useState(isPreset ? "" : value);

  // If value changes externally (e.g. loaded from DB), sync the mode
  useEffect(() => {
    if (value && options.includes(value as any)) {
      setMode("dropdown");
    } else if (value) {
      setMode("other");
      setOtherText(value);
    }
  }, [value, options]);

  function handleDropdownChange(v: string) {
    if (v === OTHER) {
      setMode("other");
      // Keep the current value until they type something new
    } else {
      onChange(v);
    }
  }

  function handleOtherChange(v: string) {
    setOtherText(v);
    onChange(v);
  }

  return (
    <div className={className}>
      {label && <p className="label">{label}</p>}
      <select
        className="field"
        value={mode === "other" ? OTHER : value}
        onChange={(e) => handleDropdownChange(e.target.value)}
      >
        <option value="">{mode === "other" ? "✏️ Writing my own…" : "Select…"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={OTHER}>✏️ Write my own…</option>
      </select>
      {mode === "other" && (
        textarea ? (
          <textarea
            className="field min-h-[80px] mt-2"
            value={otherText}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input
            className="field mt-2"
            value={otherText}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      )}
    </div>
  );
}
