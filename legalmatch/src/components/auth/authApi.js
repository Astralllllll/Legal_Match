const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
      field: data?.field,
      error: data?.error || "Request failed. Please try again.",
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