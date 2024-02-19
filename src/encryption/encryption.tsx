import { getDoc } from "firebase/firestore";
import { getUserDocRef } from "../firebase/UsersService";
import { TEST_DATA } from "../constants/constants";

export async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedPlaintext = new TextEncoder().encode(plaintext);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedPlaintext
    );
    return { ciphertext, iv };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

export const _arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const byteArray = new Uint8Array(buffer);
  let binary = "";
  const len = byteArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(byteArray[i]);
  }
  return window.btoa(binary);
};

export async function encryptAndConvertToBase64<T>(
  data: T,
  key: CryptoKey
): Promise<{ encryptedDataBase64: string; iv: string }> {
  try {
    const dataString = JSON.stringify(data);
    const { ciphertext, iv } = await encryptData(dataString, key);
    // Use the optimized function to convert ArrayBuffer to Base64
    const encryptedDataBase64 = _arrayBufferToBase64(ciphertext);
    const ivBase64 = _arrayBufferToBase64(iv.buffer);
    return { encryptedDataBase64, iv: ivBase64 };
  } catch (error) {
    console.error("Encryption and conversion to Base64 failed:", error);
    throw error;
  }
}
export async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
  try {
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
}

export async function decryptFromBase64(encryptedDataBase64: string, key: CryptoKey, ivBase64: string): Promise<any> {
  try {
    // Convert the Base64-encoded iv back to a Uint8Array
    const iv = new Uint8Array(
      atob(ivBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    // Convert the Base64-encoded encryptedDataBase64 back to an ArrayBuffer
    const encryptedData = new Uint8Array(
      atob(encryptedDataBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    ).buffer;
    // Decrypt the data
    const decryptedData = await decryptData(encryptedData, key, iv);
    // Parse the decrypted data as JSON
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption and conversion to Base64 failed:", error);
    throw error;
  }
}

export async function testDecryption(key: CryptoKey): Promise<boolean> {
  try {
    // Get the document reference for the current user
    const userDocRef = await getUserDocRef();

    // Retrieve the test encrypted data and IV from the user's document
    const userDocSnapshot = await getDoc(userDocRef);
    const encryptedDataBase64 = userDocSnapshot.data()?.testEncryptedData;
    const ivBase64 = userDocSnapshot.data()?.testIv;

    if (!encryptedDataBase64 || !ivBase64) {
      throw new Error("Test encrypted data or IV not found in the user's document.");
    }

    // Test data to be decrypted
    const originalTestData = TEST_DATA;

    // Decrypt the test data
    const decryptedData = await decryptFromBase64(encryptedDataBase64, key, ivBase64);

    // Compare the decrypted data with the original test data
    return decryptedData === originalTestData;
  } catch (error) {
    console.error("Test decryption failed:", error);
    return false;
  }
}
