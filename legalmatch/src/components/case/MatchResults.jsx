import React, { useState, useEffect } from "react";
import { useCaseContext, LEGAL_CATEGORIES } from "../../context/CaseContext";

// ─── Mock data (replace with GET /matches/:caseId) ─────────────────────────

const MOCK_MATCHES = [
  {
    lawyerId: "L001",
    name: "Advocate Grace Wanjiru",
    lskNumber: "LSK/A/14523",
    specializations: ["Employment Law", "Labour Disputes"],
    county: "Nairobi",
    yearsOfExperience: 12,
    similarCasesCount: 8,
    similarCasesSummary: "Handled 8 similar employment dispute cases in Nairobi",
    averageRating: 4.8,
    totalReviews: 34,
    similarityScore: 0.91,
    bio: "Senior advocate specialising in employment and labour law with over a decade of experience representing both employees and employers.",
    verified: true,
  },
  {
    lawyerId: "L002",
    name: "Advocate Peter Omondi",
    lskNumber: "LSK/A/09871",
    specializations: ["Employment Law", "Corporate Law"],
    county: "Nairobi",
    yearsOfExperience: 7,
    similarCasesCount: 5,
    similarCasesSummary: "Handled 5 similar wrongful termination cases in Nairobi",
    averageRating: 4.5,
    totalReviews: 19,
    similarityScore: 0.83,
    bio: "Mid-career advocate with a strong track record in employment disputes and corporate advisory work.",
    verified: true,
  },
  {
    lawyerId: "L003",
    name: "Advocate Amina Hassan",
    lskNumber: "LSK/A/21034",
    specializations: ["Employment Law", "Family Law"],
    county: "Mombasa",
    yearsOfExperience: 9,
    similarCasesCount: 3,
    similarCasesSummary: "Handled 3 similar employment cases in Mombasa",
    averageRating: 4.6,
    totalReviews: 22,
    similarityScore: 0.74,
    bio: "Advocate based in Mombasa with experience across employment and family law matters.",
    verified: true,
  },
  {
    lawyerId: "L004",
    name: "Advocate David Kariuki",
    lskNumber: "LSK/A/33210",
    specializations: ["General Practice"],
    county: "Nakuru",
    yearsOfExperience: 2,
    similarCasesCount: 0,
    similarCasesSummary: null,
    averageRating: null,
    totalReviews: 0,
    similarityScore: 0.41,
    bio: "Junior advocate in general practice, recently admitted to the bar.",
    verified: true,
    noExperienceWarning: true,
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#1D9E75" : pct >= 60 ? "#BA7517" : "#64748B";
  const bg = pct >= 80 ? "#E1F5EE" : pct >= 60 ? "#FAEEDA" : "#F1F5F9";
  return (
    <div style={{
      padding: "3px 10px", borderRadius: "20px",
      background: bg, color, fontSize: "12px", fontWeight: 600,
    }}>
      {pct}% match
    </div>
  );
}

function StarRating({ rating }) {
  if (!rating) return <span style={{ fontSize: "12px", color: "#94A3B8" }}>No reviews yet</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#EF9F27" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span style={{ fontSize: "12px", fontWeight: 500, color: "#0F2744" }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function LawyerCard({ match, rank, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "white", border: `1px solid ${rank === 1 ? "#1D9E75" : "#E2E8F0"}`,
      borderRadius: "12px", padding: "20px",
      position: "relative", transition: "box-shadow .15s",
    }}>
      {/* Top match badge */}
      {rank === 1 && (
        <div style={{
          position: "absolute", top: "-1px", left: "20px",
          background: "#1D9E75", color: "white",
          fontSize: "11px", fontWeight: 500,
          padding: "3px 10px", borderRadius: "0 0 8px 8px",
        }}>
          Top match
        </div>
      )}

      {/* No experience warning */}
      {match.noExperienceWarning && (
        <div style={{
          display: "flex", gap: "8px", padding: "8px 12px",
          background: "#FAEEDA", borderRadius: "8px", marginBottom: "12px",
        }}>
          <svg width="14" height="14" style={{ flexShrink: 0, marginTop: "1px" }} viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={{ fontSize: "11px", color: "#854F0B", margin: 0 }}>
            This advocate has no recorded cases similar to yours. They may still be able to help.
          </p>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: rank === 1 ? "12px" : "0" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Avatar */}
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "#E6F1FB", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "14px", fontWeight: 600, color: "#185FA5",
            flexShrink: 0,
          }}>
            {match.name.split(" ").slice(-2).map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0F2744", margin: 0 }}>{match.name}</p>
              {match.verified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1D9E75">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1D9E75" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>{match.county} · {match.yearsOfExperience} yrs experience</p>
          </div>
        </div>
        <ScoreBadge score={match.similarityScore} />
      </div>

      {/* Specialization tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "12px 0" }}>
        {match.specializations.map((s) => (
          <span key={s} style={{
            padding: "3px 10px", background: "#F1F5F9",
            borderRadius: "20px", fontSize: "11px", color: "#475569", fontWeight: 500,
          }}>{s}</span>
        ))}
      </div>

      {/* Match reason */}
      {match.similarCasesSummary && (
        <div style={{
          display: "flex", gap: "8px", padding: "8px 12px",
          background: "#E1F5EE", borderRadius: "8px", marginBottom: "12px",
        }}>
          <svg width="13" height="13" style={{ flexShrink: 0, marginTop: "1px" }} viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p style={{ fontSize: "12px", color: "#0F6E56", margin: 0 }}>{match.similarCasesSummary}</p>
        </div>
      )}

      {/* Rating + reviews */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <StarRating rating={match.averageRating} />
        {match.totalReviews > 0 && (
          <span style={{ fontSize: "11px", color: "#94A3B8" }}>{match.totalReviews} reviews</span>
        )}
      </div>

      {/* Expandable bio */}
      {expanded && (
        <div style={{
          padding: "10px 12px", background: "#F8FAFC",
          borderRadius: "8px", marginBottom: "12px",
          fontSize: "13px", color: "#475569", lineHeight: 1.6,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 500, color: "#94A3B8" }}>About</p>
          {match.bio}
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#94A3B8" }}>LSK: {match.lskNumber}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            flex: 1, padding: "8px", borderRadius: "8px",
            background: "white", color: "#0F2744",
            border: "1px solid #CBD5E1", fontSize: "13px",
            fontWeight: 500, cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.background = "#F8FAFC"}
          onMouseLeave={(e) => e.target.style.background = "white"}
        >
          {expanded ? "Show less" : "View profile"}
        </button>
        <button
          onClick={() => onSelect(match)}
          style={{
            flex: 2, padding: "8px", borderRadius: "8px",
            background: "#0F2744", color: "white",
            border: "none", fontSize: "13px",
            fontWeight: 500, cursor: "pointer",
          }}
          onMouseEnter={(e) => e.target.style.background = "#1E3A5F"}
          onMouseLeave={(e) => e.target.style.background = "#0F2744"}
        >
          Select this lawyer
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation modal ─────────────────────────────────────────────────────

function ConfirmModal({ lawyer, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,39,68,.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: "16px",
    }}>
      <div style={{
        background: "white", borderRadius: "12px",
        padding: "28px", maxWidth: "400px", width: "100%",
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0F2744", margin: "0 0 8px" }}>
          Confirm your selection
        </h3>
        <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, margin: "0 0 20px" }}>
          You're about to share your full case details with{" "}
          <strong style={{ color: "#0F2744" }}>{lawyer.name}</strong>.
          They will be notified and can review your case.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              background: "white", color: "#0F2744",
              border: "1px solid #CBD5E1", fontSize: "13px",
              fontWeight: 500, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 2, padding: "10px", borderRadius: "8px",
              background: "#1D9E75", color: "white",
              border: "none", fontSize: "13px",
              fontWeight: 500, cursor: "pointer",
            }}
          >
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Match Results page ─────────────────────────────────────────────────────

export default function MatchResults({ onPostNewCase }) {
  const { caseData, resetCase } = useCaseContext();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const category = LEGAL_CATEGORIES.find((c) => c.value === caseData.legalCategory);

  useEffect(() => {
    // TODO: GET /matches/:caseId
    const load = async () => {
      await new Promise((r) => setTimeout(r, 1200));
      setMatches(MOCK_MATCHES);
      setLoading(false);
    };
    load();
  }, [caseData.caseId]);

  const handleConfirm = async () => {
    // TODO: POST /cases/:caseId/select { lawyerId: selectedLawyer.lawyerId }
    await new Promise((r) => setTimeout(r, 800));
    setConfirmed(true);
    setSelectedLawyer(null);
  };

  if (confirmed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F8FAFC",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#E1F5EE", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0F2744", marginBottom: "8px" }}>Lawyer selected</h2>
          <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
            Your case details have been shared with the advocate. You'll be notified when they respond.
          </p>
          <button
            onClick={() => { resetCase(); onPostNewCase(); }}
            style={{
              padding: "10px 24px", borderRadius: "8px",
              background: "#0F2744", color: "white",
              border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            Post another case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "40px 16px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "6px",
              background: "#0F2744", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L3 6v4c0 3.5 2.5 6.5 6 7.5C13.5 16.5 16 13.5 16 10V6L9 2z" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "#0F2744" }}>LegalMatch</span>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0F2744", marginBottom: "6px" }}>
            {loading ? "Finding your matches…" : `${matches.length} advocates found`}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B" }}>
            {category?.label} · {caseData.jurisdiction} · "{caseData.title}"
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                background: "white", borderRadius: "12px",
                border: "1px solid #E2E8F0", padding: "20px", height: "140px",
                animation: "pulse 1.5s ease-in-out infinite",
                opacity: 1 - i * 0.15,
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
          </div>
        ) : (
          <>
            {matches.length === 0 ? (
              <div style={{
                background: "white", borderRadius: "12px",
                border: "1px solid #E2E8F0", padding: "40px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "15px", fontWeight: 500, color: "#0F2744", marginBottom: "8px" }}>
                  No matches found
                </p>
                <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px" }}>
                  No advocates matched your case right now. Try broadening your description or changing the county.
                </p>
                <button
                  onClick={onPostNewCase}
                  style={{
                    padding: "10px 20px", borderRadius: "8px",
                    background: "#0F2744", color: "white",
                    border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  }}
                >
                  Edit my case
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {matches.map((match, i) => (
                  <LawyerCard
                    key={match.lawyerId}
                    match={match}
                    rank={i + 1}
                    onSelect={setSelectedLawyer}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedLawyer && (
        <ConfirmModal
          lawyer={selectedLawyer}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedLawyer(null)}
        />
      )}
    </div>
  );
}
