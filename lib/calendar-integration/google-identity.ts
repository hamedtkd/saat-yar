import { GOOGLE_CALENDAR_SCOPE, GOOGLE_CALENDAR_SCOPES } from "./google-calendar.ts";

const GOOGLE_IDENTITY_SCRIPT_ID = "saatyar-google-identity";
const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
};

type GoogleOAuth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    prompt?: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: { type?: string }) => void;
  }) => { requestAccessToken: (config?: { prompt?: string }) => void };
  revoke: (accessToken: string, callback: (response: { successful?: boolean }) => void) => void;
};

type GoogleWindow = Window & { google?: { accounts?: { oauth2?: GoogleOAuth2 } } };

export type GoogleAccessSession = {
  accessToken: string;
  expiresAt: number;
};

export class GoogleIdentityError extends Error {
  code: "popup" | "permission" | "configuration";
  constructor(code: GoogleIdentityError["code"]) {
    super(code);
    this.name = "GoogleIdentityError";
    this.code = code;
  }
}

function getOAuth2() {
  return (window as GoogleWindow).google?.accounts?.oauth2;
}

export function loadGoogleIdentityScript() {
  if (typeof window === "undefined") return Promise.reject(new GoogleIdentityError("configuration"));
  if (getOAuth2()) return Promise.resolve(getOAuth2()!);
  return new Promise<GoogleOAuth2>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID) as HTMLScriptElement | null;
    const onReady = () => {
      const oauth2 = getOAuth2();
      if (oauth2) resolve(oauth2);
      else reject(new GoogleIdentityError("configuration"));
    };
    const onError = () => reject(new GoogleIdentityError("configuration"));
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = GOOGLE_IDENTITY_SCRIPT_ID;
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.append(script);
  });
}

export async function requestGoogleCalendarAccess(clientId: string): Promise<GoogleAccessSession> {
  if (!clientId) throw new GoogleIdentityError("configuration");
  const oauth2 = await loadGoogleIdentityScript();
  return new Promise<GoogleAccessSession>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      prompt: "select_account",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new GoogleIdentityError("permission"));
          return;
        }
        const granted = new Set((response.scope ?? "").split(/\s+/).filter(Boolean));
        if (!GOOGLE_CALENDAR_SCOPES.every((scope) => granted.has(scope))) {
          reject(new GoogleIdentityError("permission"));
          return;
        }
        const expiresIn = Math.max(60, Number(response.expires_in) || 3600);
        resolve({ accessToken: response.access_token, expiresAt: Date.now() + expiresIn * 1000 });
      },
      error_callback: (error) => reject(new GoogleIdentityError(error.type === "popup_failed_to_open" || error.type === "popup_closed" ? "popup" : "permission")),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });
}

export async function revokeGoogleCalendarAccess(accessToken: string) {
  const oauth2 = await loadGoogleIdentityScript();
  await new Promise<void>((resolve) => oauth2.revoke(accessToken, () => resolve()));
}
