import React from "react";

const STEPS = [
  { number: 1, label: "Category" },
  { number: 2, label: "Details" },
  { number: 3, label: "Review" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all"
                style={{
                  backgroundColor: isCompleted
                    ? "#1D9E75"
                    : isActive
                    ? "#0F2744"
                    : "#E2E8F0",
                  color: isCompleted || isActive ? "white" : "#94A3B8",
                }}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className="text-xs mt-1.5 font-medium"
                style={{ color: isActive ? "#0F2744" : "#94A3B8" }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className="h-px w-16 mx-3 mb-5 transition-all"
                style={{ backgroundColor: currentStep > step.number ? "#1D9E75" : "#E2E8F0" }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
