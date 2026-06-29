import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { loginLawyer, registerLawyer } from "./authApi";
import {
  FormField,
  TextInput,
  PasswordInput,
  SubmitButton,
  Divider,
} from "./FormComponents";

function LawyerLoginForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = "Email or LSK number is required.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSuccess(false);
    setLoading(true);
    try {
      const result = await loginLawyer({
        identifier: form.identifier,
        password: form.password,
      });

      if (!result.ok) {
        setLoading(false);
        setErrors({ password: result.error });
        return;
      }
    } catch {
      setLoading(false);
      setErrors({ password: "Unable to reach server. Please try again." });
      return;
    }

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onAuthSuccess?.();
  };

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#E1F5EE", color: "#0F6E56" }}>
          <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L2.25 5.25v4.5c0 4.125 2.9 7.988 6.75 8.925C12.85 17.738 15.75 13.875 15.75 9.75V5.25L9 1.5z"
              fill="currentColor" fillOpacity="0.8" />
          </svg>
          Advocate portal
        </div>
        <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F2744" }}>
          Sign in to your practice
        </h2>
        <p className="text-sm text-gray-500">Use your email address or LSK registration number.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Email or LSK number" id="lawyer-identifier" error={errors.identifier}>
          <TextInput
            id="lawyer-identifier"
            placeholder="advocate@firm.co.ke or LSK/A/XXXX"
            value={form.identifier}
            onChange={set("identifier")}
            hasError={!!errors.identifier}
          />
        </FormField>

        <FormField label="Password" id="lawyer-password" error={errors.password}>
          <PasswordInput
            id="lawyer-password"
            placeholder="Your password"
            value={form.password}
            onChange={set("password")}
            hasError={!!errors.password}
            minLength={8}
          />
        </FormField>

        <div className="flex justify-end -mt-1">
          <button type="button" className="text-xs hover:underline" style={{ color: "#1D9E75" }}>
            Forgot password?
          </button>
        </div>

        <SubmitButton loading={loading}>Sign in</SubmitButton>
        {success && (
          <p className="text-xs text-center -mt-1" style={{ color: "#0F6E56" }}>
            Signed in successfully. Redirecting...
          </p>
        )}
      </form>

      <Divider label="or" />

      <p className="text-center text-sm text-gray-500 mt-2">
        New to LegalMatch?{" "}
        <button
          onClick={() => onSwitch("register")}
          className="font-medium hover:underline"
          style={{ color: "#0F2744" }}
        >
          Register your practice
        </button>
      </p>

      <p className="text-center text-sm text-gray-500 mt-2">
        Looking for legal help?{" "}
        <button
          onClick={() => onSwitch("client-login")}
          className="font-medium hover:underline"
          style={{ color: "#0F2744" }}
        >
          Client sign-in
        </button>
      </p>
    </div>
  );
}

function LawyerRegisterForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    lskNumber: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!form.lskNumber.trim()) errs.lskNumber = "LSK registration number is required.";
    else if (!/^LSK\/[A-Z]\/\d{4,6}$/i.test(form.lskNumber.trim()))
      errs.lskNumber = "Format should be LSK/A/XXXX (e.g. LSK/A/12345).";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.phone && !/^(\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid Kenyan phone number.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSuccess(false);
    setLoading(true);
    try {
      const result = await registerLawyer({
        fullName: form.fullName,
        lskNumber: form.lskNumber,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      if (!result.ok) {
        const field = result.field || "email";
        setLoading(false);
        setErrors((prev) => ({ ...prev, [field]: result.error }));
        return;
      }
    } catch {
      setLoading(false);
      setErrors({ email: "Unable to reach server. Please try again." });
      return;
    }

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onAuthSuccess?.();
  };

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: "#E1F5EE", color: "#0F6E56" }}>
          <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L2.25 5.25v4.5c0 4.125 2.9 7.988 6.75 8.925C12.85 17.738 15.75 13.875 15.75 9.75V5.25L9 1.5z"
              fill="currentColor" fillOpacity="0.8" />
          </svg>
          Advocate portal
        </div>
        <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F2744" }}>
          Register your practice
        </h2>
        <p className="text-sm text-gray-500">
          Your LSK number will be verified before your profile goes live.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Full name" id="lawyer-reg-name" error={errors.fullName}>
          <TextInput
            id="lawyer-reg-name"
            placeholder="Advocate John Kamau"
            value={form.fullName}
            onChange={set("fullName")}
            hasError={!!errors.fullName}
          />
        </FormField>

        <FormField label="LSK registration number" id="lawyer-reg-lsk" error={errors.lskNumber}>
          <TextInput
            id="lawyer-reg-lsk"
            placeholder="LSK/A/12345"
            value={form.lskNumber}
            onChange={set("lskNumber")}
            hasError={!!errors.lskNumber}
          />
          {!errors.lskNumber && (
            <p className="text-xs text-gray-400">
              Found on your LSK practicing certificate.
            </p>
          )}
        </FormField>

        <FormField label="Email address" id="lawyer-reg-email" error={errors.email}>
          <TextInput
            id="lawyer-reg-email"
            type="email"
            placeholder="advocate@firm.co.ke"
            value={form.email}
            onChange={set("email")}
            hasError={!!errors.email}
          />
        </FormField>

        <FormField label="Phone number (optional)" id="lawyer-reg-phone" error={errors.phone}>
          <TextInput
            id="lawyer-reg-phone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={form.phone}
            onChange={set("phone")}
            hasError={!!errors.phone}
          />
        </FormField>

        <FormField label="Password" id="lawyer-reg-password" error={errors.password}>
          <PasswordInput
            id="lawyer-reg-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={set("password")}
            hasError={!!errors.password}
          />
        </FormField>

        <FormField label="Confirm password" id="lawyer-reg-confirm" error={errors.confirmPassword}>
          <PasswordInput
            id="lawyer-reg-confirm"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            hasError={!!errors.confirmPassword}
          />
        </FormField>

        {/* LSK verification notice */}
        <div className="flex gap-2.5 p-3 rounded-lg text-xs" style={{ backgroundColor: "#F1F5F9" }}>
          <svg width="14" height="14" className="shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none"
            stroke="#64748B" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-gray-500">
            Your profile will be reviewed by our admin team before it appears in match results. This typically takes 1–2 business days.
          </p>
        </div>

        <p className="text-xs text-gray-400">
          By registering you agree to our{" "}
          <span className="underline cursor-pointer" style={{ color: "#1D9E75" }}>Terms of Service</span>{" "}
          and{" "}
          <span className="underline cursor-pointer" style={{ color: "#1D9E75" }}>Privacy Policy</span>.
        </p>

        <SubmitButton loading={loading}>Register practice</SubmitButton>
        {success && (
          <p className="text-xs text-center -mt-1" style={{ color: "#0F6E56" }}>
            Practice registered. Redirecting...
          </p>
        )}
      </form>

      <Divider label="or" />

      <p className="text-center text-sm text-gray-500 mt-2">
        Already registered?{" "}
        <button
          onClick={() => onSwitch("login")}
          className="font-medium hover:underline"
          style={{ color: "#0F2744" }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default function LawyerAuth({ onSwitchToClient, onAuthSuccess }) {
  const [view, setView] = useState("login");

  const handleSwitch = (target) => {
    if (target === "client-login") { onSwitchToClient?.(); return; }
    setView(target === "register" ? "register" : "login");
  };

  return (
    <AuthLayout role="lawyer">
      {view === "login" ? (
        <LawyerLoginForm onSwitch={handleSwitch} onAuthSuccess={onAuthSuccess} />
      ) : (
        <LawyerRegisterForm onSwitch={handleSwitch} onAuthSuccess={onAuthSuccess} />
      )}
    </AuthLayout>
  );
}