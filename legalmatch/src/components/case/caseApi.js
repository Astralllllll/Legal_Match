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
      status: response.status,
      error: message,
      data,
    };
  }

  return { ok: true, data };
}

export async function submitIssue(payload) {
  return postJson("/api/issues", payload);
}

export async function generateMatches(payload) {
  return postJson("/api/matches/generate", payload);
}
