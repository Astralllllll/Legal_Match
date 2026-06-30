import React, { useState } from "react";
import StepIndicator from "./StepIndicator";
import { useCaseContext, LEGAL_CATEGORIES, KENYAN_COUNTIES, URGENCY_LEVELS } from "../../context/CaseContext";
import { submitIssue, generateMatches } from "./caseApi";

// ─── Shared field styles ────────────────────────────────────────────────────

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #CBD5E1",
  borderRadius: "8px",
  background: "white",
  color: "#0F172A",
  fontSize: "14px",
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
  fontFamily: "inherit",
};

function Field({ label, hint, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "#0F2744" }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: "11px", color: "#94A3B8" }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontSize: "11px", color: "#E24B4A" }}>{error}</p>
      )}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text", hasError }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: hasError ? "#E24B4A" : "#CBD5E1" }}
      onFocus={(e) => { e.target.style.borderColor = "#1D9E75"; e.target.style.boxShadow = "0 0 0 3px #E1F5EE"; }}
      onBlur={(e) => { e.target.style.borderColor = hasError ? "#E24B4A" : "#CBD5E1"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function StyledSelect({ value, onChange, children, hasError }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, borderColor: hasError ? "#E24B4A" : "#CBD5E1", cursor: "pointer" }}
      onFocus={(e) => { e.target.style.borderColor = "#1D9E75"; e.target.style.boxShadow = "0 0 0 3px #E1F5EE"; }}
      onBlur={(e) => { e.target.style.borderColor = hasError ? "#E24B4A" : "#CBD5E1"; e.target.style.boxShadow = "none"; }}
    >
      {children}
    </select>
  );
}

// ─── Step 1: Category & Title ───────────────────────────────────────────────

function Step1({ onNext }) {
  const { caseData, updateCase } = useCaseContext();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!caseData.legalCategory) errs.legalCategory = "Select a legal category.";
    if (!caseData.title.trim()) errs.title = "Case title is required.";
    else if (caseData.title.trim().length < 10) errs.title = "Title should be at least 10 characters.";
    if (!caseData.jurisdiction) errs.jurisdiction = "Select a county.";
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Field label="Legal category" error={errors.legalCategory}>
        <StyledSelect
          value={caseData.legalCategory}
          onChange={(e) => updateCase({ legalCategory: e.target.value })}
          hasError={!!errors.legalCategory}
        >
          <option value="">Select a category…</option>
          {LEGAL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </StyledSelect>
      </Field>

      <Field
        label="Case title"
        hint="A short summary of your legal issue (e.g. 'Unfair dismissal from employment')."
        error={errors.title}
      >
        <StyledInput
          value={caseData.title}
          onChange={(e) => updateCase({ title: e.target.value })}
          placeholder="Briefly describe your case in one line"
          hasError={!!errors.title}
        />
      </Field>

      <Field label="County / Jurisdiction" error={errors.jurisdiction}>
        <StyledSelect
          value={caseData.jurisdiction}
          onChange={(e) => updateCase({ jurisdiction: e.target.value })}
          hasError={!!errors.jurisdiction}
        >
          <option value="">Select a county…</option>
          {KENYAN_COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </StyledSelect>
      </Field>

      <button
        onClick={handleNext}
        style={{
          width: "100%", padding: "11px", borderRadius: "8px",
          background: "#1D9E75", color: "white", border: "none",
          fontSize: "14px", fontWeight: 500, cursor: "pointer", marginTop: "8px",
        }}
        onMouseEnter={(e) => e.target.style.background = "#0F6E56"}
        onMouseLeave={(e) => e.target.style.background = "#1D9E75"}
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Description & Budget ──────────────────────────────────────────

function Step2({ onNext, onBack }) {
  const { caseData, updateCase } = useCaseContext();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!caseData.description.trim()) errs.description = "Please describe your case.";
    else if (caseData.description.trim().length < 50)
      errs.description = "Please provide more detail — at least 50 characters.";
    if (!caseData.urgencyLevel) errs.urgencyLevel = "Select an urgency level.";
    if (caseData.budgetMin && caseData.budgetMax) {
      if (Number(caseData.budgetMin) >= Number(caseData.budgetMax))
        errs.budgetMax = "Maximum budget must be greater than minimum.";
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Field
        label="Describe your case"
        hint="Include relevant background, what outcome you need, and any key dates. More detail improves your matches."
        error={errors.description}
      >
        <textarea
          value={caseData.description}
          onChange={(e) => updateCase({ description: e.target.value })}
          placeholder="Explain your legal situation in as much detail as you can…"
          rows={5}
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.6,
            borderColor: errors.description ? "#E24B4A" : "#CBD5E1",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#1D9E75"; e.target.style.boxShadow = "0 0 0 3px #E1F5EE"; }}
          onBlur={(e) => { e.target.style.borderColor = errors.description ? "#E24B4A" : "#CBD5E1"; e.target.style.boxShadow = "none"; }}
        />
        <p style={{ fontSize: "11px", color: "#94A3B8", textAlign: "right", marginTop: "-2px" }}>
          {caseData.description.length} characters
        </p>
      </Field>

      <Field label="Urgency level" error={errors.urgencyLevel}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {URGENCY_LEVELS.map((u) => {
            const selected = caseData.urgencyLevel === u.value;
            return (
              <div
                key={u.value}
                onClick={() => updateCase({ urgencyLevel: u.value })}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${selected ? "#1D9E75" : "#CBD5E1"}`,
                  background: selected ? "#E1F5EE" : "white",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all .15s",
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: selected ? "#0F6E56" : "#0F2744", margin: 0 }}>
                    {u.label}
                  </p>
                  <p style={{ fontSize: "11px", color: selected ? "#1D9E75" : "#94A3B8", margin: 0 }}>
                    {u.description}
                  </p>
                </div>
                <div style={{
                  width: "16px", height: "16px", borderRadius: "50%",
                  border: `2px solid ${selected ? "#1D9E75" : "#CBD5E1"}`,
                  background: selected ? "#1D9E75" : "white",
                  flexShrink: 0,
                }} />
              </div>
            );
          })}
        </div>
      </Field>

      <Field
        label="Budget range (KES)"
        hint="Optional. Helps lawyers assess whether they can assist within your means."
        error={errors.budgetMax}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <StyledInput
            type="number"
            value={caseData.budgetMin}
            onChange={(e) => updateCase({ budgetMin: e.target.value })}
            placeholder="Min"
          />
          <span style={{ color: "#94A3B8", fontSize: "13px", flexShrink: 0 }}>to</span>
          <StyledInput
            type="number"
            value={caseData.budgetMax}
            onChange={(e) => updateCase({ budgetMax: e.target.value })}
            placeholder="Max"
            hasError={!!errors.budgetMax}
          />
        </div>
      </Field>

      {/* Privacy notice */}
      <div style={{ display: "flex", gap: "10px", padding: "12px 14px", background: "#F1F5F9", borderRadius: "8px" }}>
        <svg width="14" height="14" style={{ flexShrink: 0, marginTop: "1px" }} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p style={{ fontSize: "11px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
          Your case details are private. They will only be shared with the lawyer you choose to select.
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: "11px", borderRadius: "8px",
            background: "white", color: "#0F2744",
            border: "1px solid #CBD5E1", fontSize: "14px",
            fontWeight: 500, cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.background = "#F8FAFC"}
          onMouseLeave={(e) => e.target.style.background = "white"}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 2, padding: "11px", borderRadius: "8px",
            background: "#1D9E75", color: "white", border: "none",
            fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.background = "#0F6E56"}
          onMouseLeave={(e) => e.target.style.background = "#1D9E75"}
        >
          Review case →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Submit ────────────────────────────────────────────────

function Step3({ onBack, onSubmit, submitting }) {
  const { caseData } = useCaseContext();

  const category = LEGAL_CATEGORIES.find((c) => c.value === caseData.legalCategory);
  const urgency = URGENCY_LEVELS.find((u) => u.value === caseData.urgencyLevel);

  const ReviewRow = ({ label, value }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: "16px",
      padding: "10px 0", borderBottom: "0.5px solid #F1F5F9",
    }}>
      <span style={{ fontSize: "13px", color: "#64748B", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#0F2744", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );

  const budgetDisplay = caseData.budgetMin || caseData.budgetMax
    ? `KES ${Number(caseData.budgetMin || 0).toLocaleString()} – ${Number(caseData.budgetMax || 0).toLocaleString()}`
    : "Not specified";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px" }}>
          Review your case details before submitting. Once submitted, your case will be matched against available advocates.
        </p>

        <div style={{
          border: "1px solid #E2E8F0", borderRadius: "10px",
          padding: "4px 16px", background: "white",
        }}>
          <ReviewRow label="Category" value={category?.label || "—"} />
          <ReviewRow label="Title" value={caseData.title} />
          <ReviewRow label="County" value={caseData.jurisdiction} />
          <ReviewRow label="Urgency" value={urgency?.label || "—"} />
          <ReviewRow label="Budget" value={budgetDisplay} />
        </div>
      </div>

      {/* Description preview */}
      <div>
        <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px" }}>Case description</p>
        <div style={{
          padding: "12px 14px", background: "#F8FAFC",
          border: "1px solid #E2E8F0", borderRadius: "8px",
          fontSize: "13px", color: "#0F2744", lineHeight: 1.6,
          maxHeight: "120px", overflowY: "auto",
        }}>
          {caseData.description}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          onClick={onBack}
          disabled={submitting}
          style={{
            flex: 1, padding: "11px", borderRadius: "8px",
            background: "white", color: "#0F2744",
            border: "1px solid #CBD5E1", fontSize: "14px",
            fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => { if (!submitting) e.target.style.background = "#F8FAFC"; }}
          onMouseLeave={(e) => e.target.style.background = "white"}
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{
            flex: 2, padding: "11px", borderRadius: "8px",
            background: submitting ? "#5DCAA5" : "#1D9E75",
            color: "white", border: "none",
            fontSize: "14px", fontWeight: 500,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {submitting ? (
            <>
              <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity=".3" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Finding matches…
            </>
          ) : "Submit & find lawyers →"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Wizard shell ───────────────────────────────────────────────────────────

export default function PostCaseWizard({ onSubmitSuccess, currentUser }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { caseData, updateCase } = useCaseContext();

  const handleSubmit = async () => {
    setSubmitError("");

    if (!currentUser?.id) {
      setSubmitError("Please sign in again before posting your case.");
      return;
    }

    setSubmitting(true);
    try {
      const budgetRange = (caseData.budgetMin || caseData.budgetMax)
        ? `KES ${Number(caseData.budgetMin || 0).toLocaleString()} - ${Number(caseData.budgetMax || 0).toLocaleString()}`
        : null;

      const issueResult = await submitIssue({
        client_id: currentUser.id,
        issue_title: caseData.title.trim(),
        issue_description: caseData.description.trim(),
        budget_range: budgetRange,
      });

      if (!issueResult.ok) {
        setSubmitError(issueResult.error);
        return;
      }

      const issueId = issueResult.data?.issue?.issue_id;
      if (!issueId) {
        setSubmitError("Issue was created, but no issue ID was returned.");
        return;
      }

      const matchResult = await generateMatches({
        client_id: currentUser.id,
        issue_id: issueId,
        issue_text: `${caseData.title}. ${caseData.description}`,
      });

      if (!matchResult.ok) {
        if (matchResult.status === 404) {
          updateCase({ caseId: issueId, matches: [] });
          onSubmitSuccess(issueId);
          return;
        }
        setSubmitError(matchResult.error);
        return;
      }

      updateCase({
        caseId: issueId,
        matches: matchResult.data?.matches || [],
      });
      onSubmitSuccess(issueId);
    } catch (err) {
      console.error("Case submission failed:", err);
      setSubmitError("Failed to submit your case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    "What type of legal help do you need?",
    "Tell us about your case",
    "Review your case",
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "48px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "6px",
              background: "#0F2744", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 6v4c0 3.5 2.5 6.5 6 7.5C13.5 16.5 16 13.5 16 10V6L9 2z" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "#0F2744", letterSpacing: "-.3px" }}>
              LegalMatch
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0F2744", marginBottom: "6px" }}>
            {stepTitles[step - 1]}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B" }}>
            Step {step} of 3
          </p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Form card */}
        <div style={{
          background: "white", borderRadius: "12px",
          border: "1px solid #E2E8F0", padding: "28px",
        }}>
          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 onBack={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} />}
          {submitError && (
            <p style={{ marginTop: "14px", fontSize: "12px", color: "#E24B4A" }}>
              {submitError}
            </p>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", marginTop: "20px" }}>
          Your information is protected under the Kenya Data Protection Act (2019).
        </p>
      </div>
    </div>
  );
}
