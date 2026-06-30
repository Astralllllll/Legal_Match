import React, { useState, useEffect } from "react";
import { getLawyerCases, getLawyerProfile } from "../auth/authApi";

// ─── Design tokens (kept consistent with the rest of the app) ─────────────────
const NAVY      = "#0F2744";
const NAVY_SOFT = "#1A3A5C";
const GREEN     = "#1D9E75";
const GREEN_BG  = "#E6F7F1";
const BORDER    = "#E2E8F0";
const BG        = "#F0F4F8";
const TEXT      = "#0F172A";
const MUTED     = "#64748B";
const HINT      = "#94A3B8";
const ERROR     = "#E24B4A";
const WARN_BG   = "#FFF7ED";
const WARN      = "#C2620A";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  requested: { label: "Requested", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  ongoing:   { label: "Ongoing",   bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  completed: { label: "Completed", bg: "#F8FAFC", color: "#475569", dot: "#94A3B8" },
  declined:  { label: "Declined",  bg: WARN_BG,   color: WARN,      dot: "#F97316" },
};

function mapProfile(raw, currentUser) {
  const fallbackName = currentUser?.email
    ? currentUser.email.split("@")[0]
    : "Advocate";

  return {
    fullName: raw?.full_name || fallbackName,
    biography: raw?.biography || "No biography added yet.",
    specializations: raw?.specializations || "General Practice",
    academicQualifications: raw?.academic_qualifications || "—",
    yearsOfExperience: Number(raw?.years_of_experience || 0),
    previousCasesHandled: Number(raw?.previous_cases_handled || 0),
    successRate: Number(raw?.success_rate || 0),
    averageRating: Number(raw?.average_rating || 0),
    totalReviews: Number(raw?.total_reviews || 0),
    priceGuidance: raw?.price_guidance || "—",
    courts: raw?.courts || "—",
    languages: raw?.languages || "—",
    lskNumber: raw?.lsk_registration_number || "—",
    firmName: raw?.firm_name || "",
  };
}

function mapCase(raw) {
  const normalizedStatus = (raw?.status || "requested").toLowerCase();
  const safeStatus = STATUS[normalizedStatus] ? normalizedStatus : "requested";

  return {
    id: raw?.match_id,
    title: raw?.issue_title || "Untitled legal matter",
    category: raw?.legal_category || "General",
    clientName: raw?.client_display_name || raw?.client_email || "Client",
    status: safeStatus,
    updatedAt: raw?.updated_at || raw?.created_at,
    completedAt: raw?.updated_at || raw?.created_at,
    rating: raw?.rating ? Number(raw.rating) : null,
  };
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function Stars({ rating }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: "13px", letterSpacing: "1px" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.requested;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function Divider({ style }) {
  return <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: 0, ...style }} />;
}

function SectionLabel({ children }) {
  return (
    <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", color: HINT, textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: "64px" }}>
      <span style={{ fontSize: "22px", fontWeight: 700, color: NAVY }}>{value}</span>
      <span style={{ fontSize: "10px", color: MUTED, textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

// ─── Profile card ──────────────────────────────────────────────────────────────
function ProfileCard({ profile, onEdit }) {
  const specs = (profile.specializations || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section
      style={{
        background: "white",
        borderRadius: "14px",
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
      }}
    >
      {/* Header band */}
      <div
        style={{
          background: NAVY,
          padding: "24px 24px 20px",
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: GREEN,
            color: "white",
            fontSize: "22px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,.2)",
          }}
        >
          {profile.fullName.charAt(0)}
        </div>

        {/* Name + firm */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "white" }}>{profile.fullName}</p>
          {profile.firmName && (
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,.65)" }}>{profile.firmName}</p>
          )}
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,.5)" }}>{profile.lskNumber}</p>
        </div>

        {/* Edit button — top-right corner */}
        <button
          onClick={onEdit}
          title="Edit profile"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "rgba(255,255,255,.85)",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.1)")}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 1.5a2.121 2.121 0 013 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit profile
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "16px 24px",
          borderBottom: `1px solid ${BORDER}`,
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Stat value={profile.yearsOfExperience} label="Years exp." />
        <div style={{ width: "1px", background: BORDER, alignSelf: "stretch" }} />
        <Stat value={profile.previousCasesHandled} label="Cases handled" />
        <div style={{ width: "1px", background: BORDER, alignSelf: "stretch" }} />
        <Stat value={`${profile.successRate}%`} label="Success rate" />
        <div style={{ width: "1px", background: BORDER, alignSelf: "stretch" }} />
        <Stat value={`${profile.averageRating}★`} label={`${profile.totalReviews} reviews`} />
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Bio */}
        <div>
          <SectionLabel>About</SectionLabel>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: TEXT, lineHeight: 1.6 }}>
            {profile.biography}
          </p>
        </div>

        <Divider />

        {/* Specialisations */}
        <div>
          <SectionLabel>Specialisations</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
            {specs.map((s) => (
              <span
                key={s}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: GREEN_BG,
                  color: GREEN,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <Divider />

        {/* Details grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Qualifications", value: profile.academicQualifications },
            { label: "Courts",         value: profile.courts },
            { label: "Languages",      value: profile.languages },
            { label: "Fee guidance",   value: profile.priceGuidance },
          ].map(({ label, value }) => (
            <div key={label}>
              <SectionLabel>{label}</SectionLabel>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: TEXT }}>{value || "—"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Active case row ───────────────────────────────────────────────────────────
function ActiveCaseRow({ c }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Category stripe */}
      <div
        style={{
          width: "3px",
          alignSelf: "stretch",
          borderRadius: "2px",
          background: c.status === "ongoing" ? GREEN : "#3B82F6",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>{c.title}</p>
          <StatusBadge status={c.status} />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: MUTED }}>{c.category}</span>
          <span style={{ fontSize: "11px", color: HINT }}>Client: {c.clientName}</span>
          <span style={{ fontSize: "11px", color: HINT }}>Updated {fmt(c.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Completed case row ────────────────────────────────────────────────────────
function CompletedCaseRow({ c }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "12px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          width: "3px",
          alignSelf: "stretch",
          borderRadius: "2px",
          background: BORDER,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: TEXT }}>{c.title}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: MUTED }}>{c.category}</span>
          <span style={{ fontSize: "11px", color: HINT }}>Client: {c.clientName}</span>
          <Stars rating={c.rating} />
          <span style={{ fontSize: "11px", color: HINT }}>{fmt(c.completedAt)}</span>
        </div>
      </div>
      <StatusBadge status="completed" />
    </div>
  );
}

// ─── Cases section card ────────────────────────────────────────────────────────
function CasesCard({ title, count, emptyMessage, children }) {
  return (
    <section
      style={{
        background: "white",
        borderRadius: "14px",
        border: `1px solid ${BORDER}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: NAVY }}>{title}</h2>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            background: BG,
            color: MUTED,
            padding: "2px 8px",
            borderRadius: "12px",
            border: `1px solid ${BORDER}`,
          }}
        >
          {count}
        </span>
      </div>

      <div style={{ padding: "0 20px" }}>
        {count === 0 ? (
          <p style={{ padding: "24px 0", textAlign: "center", color: HINT, fontSize: "13px", margin: 0 }}>
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function LawyerDashboard({ currentUser, onEditProfile, onSignOut }) {
  const [profile,   setProfile]   = useState(null);
  const [active,    setActive]    = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!currentUser?.id) {
        setLoading(false);
        setError("Unable to determine current user.");
        return;
      }

      setLoading(true);
      setError("");

      const [profileResult, casesResult] = await Promise.all([
        getLawyerProfile(currentUser.id),
        getLawyerCases(currentUser.id),
      ]);

      if (!profileResult.ok) {
        setError(profileResult.error || "Unable to load profile.");
        setProfile(mapProfile(null, currentUser));
      } else {
        setProfile(mapProfile(profileResult.profile, currentUser));
      }

      if (!casesResult.ok) {
        setError((prev) => prev || casesResult.error || "Unable to load cases.");
        setActive([]);
        setCompleted([]);
      } else {
        const allCases = casesResult.cases.map(mapCase);
        setCompleted(allCases.filter((c) => c.status === "completed"));
        setActive(allCases.filter((c) => c.status !== "completed"));
      }

      setLoading(false);
    }

    loadDashboard();
  }, [currentUser?.id]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: `3px solid ${BORDER}`,
              borderTopColor: GREEN,
              borderRadius: "50%",
              margin: "0 auto 12px",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: MUTED, fontSize: "13px", margin: 0 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const requestedCount = active.filter((c) => c.status === "requested").length;
  const ongoingCount   = active.filter((c) => c.status === "ongoing").length;

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      {/* ── Top nav bar ─────────────────────────────────────────────────── */}
      <nav
        style={{
          background: NAVY,
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "5px",
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L3 6v4c0 3.5 2.5 6.5 6 7.5C13.5 16.5 16 13.5 16 10V6L9 2z" fill="white" fillOpacity=".9" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>LegalMatch</span>
        </div>

        <button
          onClick={onSignOut}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,.2)",
            color: "rgba(255,255,255,.75)",
            borderRadius: "7px",
            padding: "5px 12px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </nav>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          padding: "28px 16px 64px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Page heading + quick stats */}
        <div>
          <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, letterSpacing: ".07em", color: HINT, textTransform: "uppercase" }}>
            Lawyer dashboard
          </p>
          <h1 style={{ margin: "0 0 14px", fontSize: "22px", fontWeight: 700, color: NAVY }}>
            Good day, {profile?.fullName?.split(" ")[0] ?? "Advocate"}
          </h1>

          {/* Summary chips */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Requested", value: requestedCount, color: "#3B82F6", bg: "#EFF6FF" },
              { label: "Ongoing",   value: ongoingCount,   color: GREEN,      bg: GREEN_BG },
              { label: "Completed", value: completed.length, color: MUTED,    bg: "white"  },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: bg,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: 700, color }}>{value}</span>
                <span style={{ fontSize: "12px", color: MUTED }}>{label}</span>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ margin: "10px 0 0", color: ERROR, fontSize: "12px" }}>
              {error}
            </p>
          )}
        </div>

        {/* Profile card */}
        {profile && <ProfileCard profile={profile} onEdit={onEditProfile} />}

        {/* Active cases */}
        <CasesCard
          title="Active cases"
          count={active.length}
          emptyMessage="No active cases yet. You'll appear here once a client selects you."
        >
          {active.map((c) => (
            <ActiveCaseRow key={c.id} c={c} />
          ))}
          {/* remove bottom border on last row */}
          <style>{`.active-last > div:last-child { border-bottom: none; }`}</style>
        </CasesCard>

        {/* Completed cases */}
        <CasesCard
          title="Completed cases"
          count={completed.length}
          emptyMessage="Cases you finish will appear here with client ratings."
        >
          {completed.map((c) => (
            <CompletedCaseRow key={c.id} c={c} />
          ))}
        </CasesCard>
      </div>
    </div>
  );
}
