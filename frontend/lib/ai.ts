// lib/ai.ts
//
// Thin client for the backend's /ai endpoints.
// Auth: the backend verifies a Clerk session token via
// clerk.authenticate_request(), so every call here must send
// `Authorization: Bearer <token>` — not custom x-user-id style headers.

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

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function askAI(
  question: string,
  token: string
): Promise<AIQueryResponse> {
  const res = await fetch(`${API_URL}/ai/query`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI query failed (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function reindexNotes(
  token: string
): Promise<{ indexed: number }> {
  const res = await fetch(`${API_URL}/ai/reindex`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Reindex failed (${res.status}): ${detail}`);
  }

  return res.json();
}

// NEW: the tool-calling assistant. Unlike askAI() above (a one-shot
// search-and-cite call to /ai/query), this can create, list, update, and
// delete notes via tools, and remembers earlier turns in the conversation
// server-side (see memory.py) — no chat_history needs to be sent from the
// client, the backend already knows whose conversation this is from the
// verified token.
export interface ChatResponse {
  answer: string;
}

export async function chatWithAI(
  message: string,
  token: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Chat failed (${res.status}): ${detail}`);
  }

  return res.json();
}

// NEW: hydrates the frontend's message list from the server-persisted
// history, so a page refresh doesn't visually reset the conversation
// (it was never actually lost — chat_messages already had it).
export interface ChatHistoryMessage {
  role: "human" | "ai";
  content: string;
  created_at: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
}

export async function getChatHistory(
  token: string
): Promise<ChatHistoryResponse> {
  const res = await fetch(`${API_URL}/ai/chat/history`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Fetching chat history failed (${res.status}): ${detail}`);
  }

  return res.json();
}