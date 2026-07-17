// lib/ai.ts
//
// Thin client for the backend's /ai endpoints.
// Adjust `authHeaders` to match however your app currently injects
// Clerk's x-user-id / x-first-name / x-last-name / x-email headers
// elsewhere (e.g. if you already have a shared `lib/api.ts` fetch
// wrapper, just add these two calls there instead of using this file).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface AISourceNote {
  id: number;
  title: string;
  snippet: string;
}

export interface AIQueryResponse {
  answer: string;
  sources: AISourceNote[];
}

interface AuthHeaderInput {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

function authHeaders({ userId, firstName, lastName, email }: AuthHeaderInput) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-id": userId,
  };
  if (firstName) headers["x-first-name"] = firstName;
  if (lastName) headers["x-last-name"] = lastName;
  if (email) headers["x-email"] = email;
  return headers;
}

export async function askAI(
  question: string,
  auth: AuthHeaderInput
): Promise<AIQueryResponse> {
  const res = await fetch(`${API_URL}/ai/query`, {
    method: "POST",
    headers: authHeaders(auth),
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI query failed (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function reindexNotes(
  auth: AuthHeaderInput
): Promise<{ indexed: number }> {
  const res = await fetch(`${API_URL}/ai/reindex`, {
    method: "POST",
    headers: authHeaders(auth),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Reindex failed (${res.status}): ${detail}`);
  }

  return res.json();
}