// jest.setup.js

const crypto = require("crypto");
global.crypto = crypto;

// Mock TextEncoder
global.TextEncoder =
  global.TextEncoder ||
  class {
    encode(str) {
      return new Uint8Array(Buffer.from(str, "utf8"));
    }
  };

// Mock TextDecoder
global.TextDecoder =
  global.TextDecoder ||
  class {
    decode(bytes) {
      return Buffer.from(bytes).toString("utf8");
    }
  };

global.crypto.subtle = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  importKey: jest.fn().mockImplementation((format, keyData, algorithm, extractable, keyUsages) => {
    return Promise.resolve({});
  }),
  deriveKey: jest.fn().mockImplementation((algorithm, baseKey, derivedKeyType, extractable, keyUsages) => {
    return Promise.resolve({});
  }),
};

// Mock window.crypto.getRandomValues
global.crypto.getRandomValues = jest.fn().mockImplementation((typedArray) => {
  return typedArray;
});

// jest.setup.js
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn().mockReturnValue({}),
}));

// Example of mocking Firebase Authentication
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn().mockReturnValue({}),
}));

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  initializeFirestore: jest.fn().mockReturnValue({}),
  persistentLocalCache: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  getDoc: jest.fn(),
}));
