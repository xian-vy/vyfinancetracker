import { decryptFromBase64, encryptAndConvertToBase64 } from "./encryption";
import { TEST_DATA } from "../constants/constants";
import { deriveKeyFromSeedPhrase, generateSeedPhrase } from "./keyhandling";

// Mock the TEST_DATA constant
jest.mock("../constants/constants", () => ({
  TEST_DATA: "mockTestData",
}));

// Mock the UsersService function
jest.mock("../firebase/UsersService", () => ({
  getUserDocRef: jest.fn(),
}));

// Generate a seed phrase for testing
const seedPhrase = generateSeedPhrase();
// Derive a CryptoKey from the seed phrase
async function setup() {
  const { key } = await deriveKeyFromSeedPhrase(seedPhrase);
  return key;
}

describe("encryption and decryption", () => {
  let encryptSpy: jest.SpyInstance;
  let decryptSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock the Web Crypto API methods
    jest.spyOn(window.crypto.subtle, "importKey").mockImplementation(() => {
      return Promise.resolve({
        algorithm: { name: "PBKDF2" },
        extractable: false,
        type: "secret",
        usages: ["deriveKey"],
      });
    });

    jest.spyOn(window.crypto.subtle, "deriveKey").mockImplementation(() => {
      return Promise.resolve({
        algorithm: { name: "AES-GCM", length: 256 },
        extractable: true,
        type: "secret",
        usages: ["encrypt", "decrypt"],
      });
    });

    // Create spies for the Web Crypto API methods
    encryptSpy = jest.spyOn(window.crypto.subtle, "encrypt");
    decryptSpy = jest.spyOn(window.crypto.subtle, "decrypt");

    // Mock the implementations
    encryptSpy.mockImplementation((algorithm, key, data) => {
      // Simulate encryption by returning the original data as an ArrayBuffer
      // This is a simplification; in a real scenario, you would encrypt the data
      return Promise.resolve(data.buffer);
    });
    decryptSpy.mockImplementation((algorithm, key, data) => {
      // Simulate decryption by returning the original data as a Uint8Array
      // This is a simplification; in a real scenario, you would decrypt the data
      return Promise.resolve(data);
    });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original implementations after each test
    if (encryptSpy) encryptSpy.mockRestore();
    if (decryptSpy) decryptSpy.mockRestore();

    jest.restoreAllMocks();
  });

  it("generates a derived key", async () => {
    const mockKey = await setup();

    expect(mockKey).toBeDefined();

    // Check if mockKey is a valid CryptoKey object
    expect(mockKey).toHaveProperty("algorithm");
    expect(mockKey).toHaveProperty("extractable");
    expect(mockKey).toHaveProperty("type");
    expect(mockKey).toHaveProperty("usages");

    // Optionally, you can also check the values of these properties
    expect(mockKey.algorithm).toHaveProperty("name");
    expect(mockKey.algorithm).toHaveProperty("length");
    expect(mockKey.extractable).toBe(true);
    expect(mockKey.type).toMatch(/secret|public|private/);
    expect(mockKey.usages).toBeInstanceOf(Array);
  });

  it("encrypts and decrypts data correctly", async () => {
    const mockKey = await setup();

    // Encrypt the data
    const { encryptedDataBase64, iv } = await encryptAndConvertToBase64(TEST_DATA, mockKey);
    // console.log(encryptedDataBase64);
    // Decrypt the data
    const decryptedData = await decryptFromBase64(encryptedDataBase64, mockKey, iv);

    // Verify that the decrypted data matches the original plaintext
    expect(decryptedData).toEqual(TEST_DATA);

    // Verify that the Web Crypto API was called with the correct arguments
    expect(window.crypto.subtle.encrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "AES-GCM",
        iv: expect.any(Uint8Array),
      }),
      mockKey,
      expect.any(Uint8Array)
    );
    expect(window.crypto.subtle.decrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "AES-GCM",
        iv: expect.any(Uint8Array),
      }),
      mockKey,
      expect.any(ArrayBuffer)
    );
  });

  it("handles encryption errors", async () => {
    encryptSpy.mockImplementation(() => {
      return Promise.reject(new Error("Encryption error"));
    });

    const mockKey = await setup();

    await expect(encryptAndConvertToBase64(TEST_DATA, mockKey)).rejects.toThrow("Encryption error");
  });

  it("handles decryption errors", async () => {
    decryptSpy.mockImplementation(() => {
      return Promise.reject(new Error("Decryption error"));
    });

    const mockKey = await setup();

    const { encryptedDataBase64, iv } = await encryptAndConvertToBase64(TEST_DATA, mockKey);

    await expect(decryptFromBase64(encryptedDataBase64, mockKey, iv)).rejects.toThrow("Decryption error");
  });
});
