import React, { useState } from "react";
import ClientAuth from "./ClientAuth";
import LawyerAuth from "./LawyerAuth";

/**
 * AuthRouter
 * Top-level component that controls which auth portal is shown.
 * Route this to /auth or / in your React Router setup.
 *
 * Usage:
 *   <AuthRouter />
 *
 * For React Router v6:
 *   <Route path="/auth" element={<AuthRouter />} />
 *   <Route path="/auth/lawyer" element={<AuthRouter defaultPortal="lawyer" />} />
 */
export default function AuthRouter({ defaultPortal = "client", onAuthSuccess }) {
  const [portal, setPortal] = useState(defaultPortal);

  return portal === "lawyer" ? (
    <LawyerAuth
      onSwitchToClient={() => setPortal("client")}
      onAuthSuccess={onAuthSuccess}
    />
  ) : (
    <ClientAuth
      onSwitchToLawyer={() => setPortal("lawyer")}
      onAuthSuccess={onAuthSuccess}
    />
  );
}
