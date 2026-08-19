import {
  decryptWithKey,
  encryptWithKey,
  loadHexKeyFromEnv,
} from "@/utils/crypto/aes-gcm";

export type TokenCipher = {
  encrypt: (plain: string) => string;
  decrypt: (payload: string) => string;
};

// Binds the AES-256-GCM primitive to a hex key loaded from the named env var, so
// each Tracker integration (Linear, Jira, …) gets encrypt/decrypt bound to its
// own key without re-loading or re-validating the key itself. See ADR 0003.
export function createTokenCipher(envVarName: string): TokenCipher {
  // Loaded on first use, not at module load: integrations are optional and an
  // unset key must not break `next build` when a route imports this module.
  let key: Buffer | undefined;
  const getKey = () => (key ??= loadHexKeyFromEnv(envVarName));

  return {
    encrypt: (plain) => encryptWithKey(plain, getKey()),
    decrypt: (payload) => decryptWithKey(payload, getKey()),
  };
}
