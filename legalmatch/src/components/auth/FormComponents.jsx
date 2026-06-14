import React, { useState } from "react";

export function FormField({ label, id, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: "#0F2744" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: "#E24B4A" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ id, type = "text", placeholder, value, onChange, hasError }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all"
      style={{
        borderColor: hasError ? "#E24B4A" : "#CBD5E1",
        backgroundColor: "white",
        color: "#0F172A",
        boxShadow: "none",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = hasError ? "#E24B4A" : "#1D9E75";
        e.target.style.boxShadow = `0 0 0 3px ${hasError ? "#FCEBEB" : "#E1F5EE"}`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = hasError ? "#E24B4A" : "#CBD5E1";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export function PasswordInput({ id, placeholder, value, onChange, hasError }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all pr-10"
        style={{
          borderColor: hasError ? "#E24B4A" : "#CBD5E1",
          backgroundColor: "white",
          color: "#0F172A",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#1D9E75";
          e.target.style.boxShadow = "0 0 0 3px #E1F5EE";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = hasError ? "#E24B4A" : "#CBD5E1";
          e.target.style.boxShadow = "none";
        }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {visible ? (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          ) : (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

export function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all"
      style={{
        backgroundColor: loading ? "#5DCAA5" : "#1D9E75",
        cursor: loading ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = "#0F6E56"; }}
      onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = "#1D9E75"; }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}

export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}
