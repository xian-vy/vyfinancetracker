import {
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  reauthenticateWithPopup,
  signInAnonymously,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

export async function signInWithGoogle() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  return signInWithRedirect(auth, provider).catch((error) => {
    const errorCode = error.code;
    if (errorCode === "auth/network-request-failed") {
      throw new Error("Network request failed");
    }
    console.error("An error occurred during sign-in:", error.message);
  });
}

export async function signInAnonymous() {
  const auth = getAuth();
  return signInAnonymously(auth).catch((error) => {
    console.error("An error occurred during sign-in", error.message);
    throw error;
  });
}

export async function signOutWithGoogle() {
  const auth = getAuth();

  try {
    await signOut(auth);
    console.log("User signed out ");
  } catch (error: any) {
    console.error("An error occurred during sign-in:", error.message);
  }
}
/* 
export async function isUserSignedInRecently(): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const now = Date.now();
    const lastSignInTime = user.metadata.lastSignInTime;

    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour ago in milliseconds

    console.log(oneHourAgo);
    let lastSignInTimestamp;

    if (lastSignInTime) {
      lastSignInTimestamp = new Date(lastSignInTime).getTime();
    }

    if (lastSignInTimestamp !== undefined && lastSignInTimestamp < oneHourAgo) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}
*/

/* Disable Since current auth is fully Google based
export enum AuthProvider {
  Google = "Google",
  Email = "Email",
  Unknown = "",
}

export async function getUserAuthProvider(): Promise<AuthProvider> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User auth error.");
    }

    const providerData = user.providerData;
    const googleProvider = providerData.find((data) => data.providerId === "google.com");
    const emailProvider = providerData.find((data) => data.providerId === "password");

    if (googleProvider) {
      return AuthProvider.Google;
    } else if (emailProvider) {
      return AuthProvider.Email;
    } else {
      return AuthProvider.Unknown;
    }
  } catch (error) {
    console.error("Error getting user auth provider:", error);
    return AuthProvider.Unknown;
  }
}
*/

export async function reAuthGoogleSignIn(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return "Invalid Auth";
  }
  const provider = new GoogleAuthProvider();

  try {
    await reauthenticateWithPopup(user, provider);
    return "Success";
  } catch (error: any) {
    if (error.code === "auth/user-mismatch") {
      return "Re-Authentication failed, account mismatch.";
    }

    console.error("Error reauthenticating with popup", error);
    return "An error occurred during re-authentication.Please Try Again.";
  }
}

export async function linkAnonymousAcccount(): Promise<string> {
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  try {
    if (!auth.currentUser) {
      return "Invalid Auth, Please try reloading App.";
    }
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.idToken) {
      throw new Error("Failed to obtain Google ID token");
    }

    return "Success";
  } catch (error: any) {
    console.error("Error upgrading anonymous account,", error);
    if (error.code === "auth/credential-already-in-use") {
      return "The Google account is already in use by another account.";
    } else if (error.code === "auth/popup-closed-by-user") {
      return "The linking process was cancelled by the user.";
    } else {
      return "Something went wrong,Please try reloading App.";
    }
  }
}
