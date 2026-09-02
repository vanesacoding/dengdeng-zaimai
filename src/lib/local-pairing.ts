export interface LocalPairing {
  phrase: string;
  inviterId: string;
  inviterNickname: string;
  inviteeId: string | null;
  inviteeNickname: string | null;
  status: "PENDING" | "ACTIVE";
  createdAt: number;
}

const KEY = "ddzm:localPairing";

export function getLocalPairing(): LocalPairing | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setLocalPairing(p: LocalPairing) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearLocalPairing() {
  localStorage.removeItem(KEY);
}

export function findLocalPairingByPhrase(phrase: string): LocalPairing | null {
  const p = getLocalPairing();
  return p && p.phrase === phrase ? p : null;
}
