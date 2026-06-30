const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const fallback = response.status >= 500
      ? "Server is unavailable. Start the backend with 'npm run server' and try again."
      : "Request failed. Please try again.";
    const message =
      (typeof data === "object" && data?.error) ||
      (typeof data === "object" && data?.message) ||
      (typeof data === "string" && data.trim()) ||
      fallback;

    return {
      ok: false,
      field: typeof data === "object" ? data?.field : undefined,
      error: message,
    };
  }

  return { ok: true, user: data?.user };
}

export async function registerClient(payload) {
  return postJson("/api/auth/client/register", payload);
}

export async function loginClient(payload) {
  return postJson("/api/auth/client/login", payload);
}

export async function registerLawyer(payload) {
  return postJson("/api/auth/lawyer/register", payload);
}

export async function loginLawyer(payload) {
  return postJson("/api/auth/lawyer/login", payload);
}

export async function saveLawyerProfile(payload) {
  const response = await fetch(`${API_BASE_URL}/api/profiles/lawyer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error: data?.error || "Unable to save profile.",
    };
  }

  return {
    ok: true,
    profile: data?.profile || null,
  };
}

export async function getLawyerProfile(userId) {
  const response = await fetch(`${API_BASE_URL}/api/lawyers/${userId}`);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 404) {
    return {
      ok: false,
      notFound: true,
      error: data?.error || "Lawyer profile not found.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      notFound: false,
      error: data?.error || "Unable to fetch lawyer profile.",
    };
  }

  return {
    ok: true,
    profile: data || null,
  };
}

export async function getLawyerCases(userId) {
  const response = await fetch(`${API_BASE_URL}/api/matches/lawyer/${userId}`);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error: data?.error || "Unable to fetch lawyer cases.",
    };
  }

  return {
    ok: true,
    cases: Array.isArray(data?.cases) ? data.cases : [],
  };
}