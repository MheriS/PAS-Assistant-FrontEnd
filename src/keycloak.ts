import Keycloak, { type KeycloakInitOptions } from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180",
  // url: 'http://192.168.11.145:8080',
  realm: "pas-assistant",
  clientId: "pas-react",
});

// Singleton guard: keycloak.init() can only be called once.
// This wrapper ensures subsequent calls reuse the existing init promise.
let initPromise: Promise<boolean> | null = null;

export function initKeycloak(
  options?: KeycloakInitOptions
): Promise<boolean> {
  if (initPromise) {
    // Already initialized (or initializing) — return the existing promise
    return initPromise;
  }
  initPromise = keycloak.init(options || { onLoad: "check-sso", checkLoginIframe: false });
  return initPromise;
}

export default keycloak;
