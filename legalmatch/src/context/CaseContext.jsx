import React, { createContext, useContext, useState } from "react";

const CaseContext = createContext(null);

export function CaseProvider({ children }) {
  const [caseData, setCaseData] = useState({
    // Step 1
    legalCategory: "",
    title: "",
    jurisdiction: "",
    // Step 2
    description: "",
    urgencyLevel: "",
    budgetMin: "",
    budgetMax: "",
    // After submission
    caseId: null,
  });

  const updateCase = (fields) =>
    setCaseData((prev) => ({ ...prev, ...fields }));

  const resetCase = () =>
    setCaseData({
      legalCategory: "",
      title: "",
      jurisdiction: "",
      description: "",
      urgencyLevel: "",
      budgetMin: "",
      budgetMax: "",
      caseId: null,
    });

  return (
    <CaseContext.Provider value={{ caseData, updateCase, resetCase }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCaseContext must be used within a CaseProvider");
  return ctx;
}

// Constants shared across wizard and results
export const LEGAL_CATEGORIES = [
  { value: "criminal", label: "Criminal Law" },
  { value: "family", label: "Family Law" },
  { value: "property", label: "Property & Real Estate" },
  { value: "employment", label: "Employment Law" },
  { value: "corporate", label: "Corporate & Commercial" },
  { value: "immigration", label: "Immigration" },
];

export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Nyeri", "Meru", "Thika", "Machakos", "Kisii",
  "Garissa", "Kakamega", "Kilifi", "Lamu", "Marsabit",
];

export const URGENCY_LEVELS = [
  { value: "low", label: "Not urgent", description: "Within the next few months" },
  { value: "medium", label: "Moderately urgent", description: "Within the next few weeks" },
  { value: "high", label: "Urgent", description: "Within the next few days" },
  { value: "critical", label: "Critical", description: "Immediate assistance needed" },
];
