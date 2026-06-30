import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { loginClient, registerClient } from "./authApi";
import {
  FormField,
  TextInput,
  PasswordInput,
  SubmitButton,
  Divider,
} from "./FormComponents";

function ClientLoginForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address.";
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
    let authenticatedUser = null;
    try {
      const result = await loginClient({
        email: form.email,
        password: form.password,
      });

      if (!result.ok) {
        setLoading(false);
        setErrors({ password: result.error });
        return;
      }
      authenticatedUser = result.user;
    } catch {
      setLoading(false);
      setErrors({ password: "Unable to reach server. Please try again." });
      return;
    }

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onAuthSuccess?.(authenticatedUser);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F2744" }}>
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">Sign in to manage your cases and matches.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Email address" id="client-email" error={errors.email}>
          <TextInput
            id="client-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            hasError={!!errors.email}
          />
        </FormField>

        <FormField label="Password" id="client-password" error={errors.password}>
          <PasswordInput
            id="client-password"
            placeholder="Your password"
            value={form.password}
            onChange={set("password")}
            hasError={!!errors.password}
            minLength={8}
          />
        </FormField>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            className="text-xs hover:underline"
            style={{ color: "#1D9E75" }}
          >
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
        Don't have an account?{" "}
        <button
          onClick={() => onSwitch("register")}
          className="font-medium hover:underline"
          style={{ color: "#0F2744" }}
        >
          Create one
        </button>
      </p>

      <p className="text-center text-sm text-gray-500 mt-2">
        Are you a lawyer?{" "}
        <button
          onClick={() => onSwitch("lawyer-login")}
          className="font-medium hover:underline"
          style={{ color: "#0F2744" }}
        >
          Sign in here
        </button>
      </p>
    </div>
  );
}

function ClientRegisterForm({ onSwitch, onAuthSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
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
    let authenticatedUser = null;
    try {
      const result = await registerClient({
        fullName: form.fullName,
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
      authenticatedUser = result.user;
    } catch {
      setLoading(false);
      setErrors({ email: "Unable to reach server. Please try again." });
      return;
    }

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onAuthSuccess?.(authenticatedUser);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-1" style={{ color: "#0F2744" }}>
          Create your account
        </h2>
        <p className="text-sm text-gray-500">Find qualified advocates for your legal needs.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Full name" id="client-reg-name" error={errors.fullName}>
          <TextInput
            id="client-reg-name"
            placeholder="Jane Mwangi"
            value={form.fullName}
            onChange={set("fullName")}
            hasError={!!errors.fullName}
          />
        </FormField>

        <FormField label="Email address" id="client-reg-email" error={errors.email}>
          <TextInput
            id="client-reg-email"
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={set("email")}
            hasError={!!errors.email}
          />
        </FormField>

        <FormField label="Phone number (optional)" id="client-reg-phone" error={errors.phone}>
          <TextInput
            id="client-reg-phone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={form.phone}
            onChange={set("phone")}
            hasError={!!errors.phone}
          />
        </FormField>

        <FormField label="Password" id="client-reg-password" error={errors.password}>
          <PasswordInput
            id="client-reg-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={set("password")}
            hasError={!!errors.password}
          />
        </FormField>

        <FormField label="Confirm password" id="client-reg-confirm" error={errors.confirmPassword}>
          <PasswordInput
            id="client-reg-confirm"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            hasError={!!errors.confirmPassword}
          />
        </FormField>

        <p className="text-xs text-gray-400 -mt-1">
          By creating an account you agree to our{" "}
          <span className="underline cursor-pointer" style={{ color: "#1D9E75" }}>
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer" style={{ color: "#1D9E75" }}>
            Privacy Policy
          </span>
          .
        </p>

        <SubmitButton loading={loading}>Create account</SubmitButton>
        {success && (
          <p className="text-xs text-center -mt-1" style={{ color: "#0F6E56" }}>
            Account created. Redirecting...
          </p>
        )}
      </form>

      <Divider label="or" />

      <p className="text-center text-sm text-gray-500 mt-2">
        Already have an account?{" "}
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

export default function ClientAuth({ onSwitchToLawyer, onAuthSuccess }) {
  const [view, setView] = useState("login");

  const handleSwitch = (target) => {
    if (target === "lawyer-login") {
      onSwitchToLawyer?.();
      return;
    }
    setView(target === "register" ? "register" : "login");
  };

  return (
    <AuthLayout role="client">
      {view === "login" ? (
        <ClientLoginForm onSwitch={handleSwitch} onAuthSuccess={onAuthSuccess} />
      ) : (
        <ClientRegisterForm onSwitch={handleSwitch} onAuthSuccess={onAuthSuccess} />
      )}
    </AuthLayout>
  );
}