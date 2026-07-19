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
  const key = loadHexKeyFromEnv(envVarName);
  return {
    encrypt: (plain) => encryptWithKey(plain, key),
    decrypt: (payload) => decryptWithKey(payload, key),
  };
}
