import React, { useState } from "react";
import AuthRouter from "./components/auth/AuthRouter";
import PostCaseWizard from "./components/case/PostCaseWizard";
import MatchResults from "./components/case/MatchResults";
import LawyerList from './components/LawyerList';
import { CaseProvider } from "./context/CaseContext";

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

  return (
    <CaseProvider>
      {page === "auth" && (
        <AuthRouter onAuthSuccess={() => setPage("wizard")} />
      )}
      {page === "wizard" && (
        <PostCaseWizard onSubmitSuccess={() => setPage("results")} />
      )}
      {page === "results" && (
        <MatchResults onPostNewCase={() => setPage("wizard")} />
      )}
      {page === "lawyers" && (
        <LawyerList />
      )}
    </CaseProvider>
  );
}