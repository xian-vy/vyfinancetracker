import { deleteDB, openDB } from "idb";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { getPersistenceID } from "../firebase/UsersService";
import { APP_NAME, ITERATIONS } from "../constants/constants";

export function generateSeedPhrase(): string {
  // Generate a random mnemonic (uses crypto.randomBytes under the hood)
  const mnemonic = generateMnemonic(wordlist, 128); //  128 bits of entropy for a  12-word mnemonic
  return mnemonic;
}
type DerivedKeyWithSalt = {
  key: CryptoKey;
  saltToUse: Uint8Array;
};

export async function deriveKeyFromSeedPhrase(seedPhrase: string, salt?: Uint8Array): Promise<DerivedKeyWithSalt> {
  const password = seedPhrase;

  // /The purpose of the salt is to ensure that even if two users have the same password
  // (or seed phrase in this case), their derived keys will be different because the salts are different
  const saltToUse = salt || window.crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltToUse,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return { key, saltToUse };
}

const getIndexedDB = async () => {
  const persistenceId = await getPersistenceID();
  if (!persistenceId) {
    throw new Error("No signed in user.");
  }
  return openDB(APP_NAME + persistenceId, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    },
  });
};
export const deleteIndexedDB = async () => {
  const persistenceId = await getPersistenceID();
  if (!persistenceId) {
    throw new Error("No signed in user.");
  }
  await deleteDB(APP_NAME + persistenceId);
};

export async function storeKeySecurely(seedPhraseDerivedKey: CryptoKey): Promise<void> {
  try {
    // Convert the key to a format that can be stored
    const exportedKey = await window.crypto.subtle.exportKey("raw", seedPhraseDerivedKey);
    // Store the key in IndexedDB
    const db = await getIndexedDB();

    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");
    await store.put(exportedKey, "userKey");
    await tx.done;
  } catch (error) {
    console.error("Error storing key securely:", error);
    throw error;
  }
}

export async function retrieveKeySecurely(): Promise<CryptoKey | false> {
  const db = await getIndexedDB();

  // Check if the "keys" object store exists
  if (!db.objectStoreNames.contains("keys")) {
    // The "keys" object store does not exist, return false
    return false;
  }

  const tx = db.transaction("keys", "readonly");
  const store = tx.objectStore("keys");
  const exportedKey = await store.get("userKey");
  await tx.done;

  // Check if the key is stored
  if (!exportedKey) {
    return false;
  }

  // Import the key back into the Web Crypto API
  const importedKey = await window.crypto.subtle.importKey("raw", exportedKey, { name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  return importedKey;
}
