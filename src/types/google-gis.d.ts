/** Tipos mínimos para Google Identity Services (GIS) token client. */

declare global {
  interface GoogleTokenResponse {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    error?: string;
    error_description?: string;
  }

  interface GoogleTokenClient {
    requestAccessToken(config?: { prompt?: string; hint?: string }): void;
  }

  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }): GoogleTokenClient;
          revoke(token: string, callback: () => void): void;
        };
      };
    };
  }
}

export {};
