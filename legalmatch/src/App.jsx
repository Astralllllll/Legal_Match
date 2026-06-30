import React, { useState } from "react";
import AuthRouter from "./components/auth/AuthRouter";
import PostCaseWizard from "./components/case/PostCaseWizard";
import MatchResults from "./components/case/MatchResults";
import LawyerOnboarding from "./components/lawyer/LawyerOnboarding";
import LawyerDashboard from "./components/lawyer/LawyerDashboard";
import LawyerList from './components/LawyerList';
import { getLawyerProfile } from "./components/auth/authApi";
import { CaseProvider } from "./context/CaseContext";

function isLawyerProfileComplete(profile) {
  if (!profile) return false;

  const hasSpecializations = Boolean(profile.specializations?.trim());
  const hasPriceGuidance = Boolean(profile.price_guidance?.trim());
  const hasPreviousCases = profile.previous_cases_handled !== null && profile.previous_cases_handled !== undefined;
  const hasSuccessRate = profile.success_rate !== null && profile.success_rate !== undefined;

  return hasSpecializations && hasPriceGuidance && hasPreviousCases && hasSuccessRate;
}

/**
 * App-level routing (no React Router yet — simple state machine)
 *
 * Pages:
 *   "auth"     → AuthRouter (client / lawyer login & register)
 *   "wizard"   → PostCaseWizard (3-step case posting form)
 *   "results"  → MatchResults (ranked lawyer cards)
 *   "lawyers"  → LawyerList (list of available lawyers)
 *
 * Replace this with React Router v6 routes when you add more pages.
 */
export default function App() {
  const [page, setPage] = useState("auth");
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <CaseProvider>
      {page === "auth" && (
        <AuthRouter
          onAuthSuccess={async (user, meta) => {
            setCurrentUser(user || null);

            if (user?.role?.toLowerCase() === "lawyer") {
              if (!meta?.goToLawyerOnboarding) {
                setPage("lawyer-dashboard");
                return;
              }

              const profileResult = await getLawyerProfile(user.id);
              if (profileResult.ok && isLawyerProfileComplete(profileResult.profile)) {
                setPage("lawyer-dashboard");
                return;
              }

              setPage("lawyer-onboarding");
              return;
            }

            setPage("wizard");
          }}
        />
      )}
      {page === "lawyer-onboarding" && (
        <LawyerOnboarding currentUser={currentUser} onComplete={() => setPage("lawyer-dashboard")} />
      )}
      {page === "lawyer-dashboard" && (
        <LawyerDashboard
          currentUser={currentUser}
          onEditProfile={() => setPage("lawyer-onboarding")}
          onSignOut={() => {
            setCurrentUser(null);
            setPage("auth");
          }}
        />
      )}
      {page === "wizard" && (
        <PostCaseWizard
          currentUser={currentUser}
          onSubmitSuccess={() => setPage("results")}
        />
      )}
      {page === "results" && (
        <MatchResults
          currentUser={currentUser}
          onPostNewCase={() => setPage("wizard")}
        />
      )}
      {page === "lawyers" && (
        <LawyerList />
      )}
    </CaseProvider>
  );
}