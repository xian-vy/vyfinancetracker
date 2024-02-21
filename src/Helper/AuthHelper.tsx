import {
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  reauthenticateWithPopup,
  signInAnonymously,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { SIGNIN_NETWORK_ERROR_MESSAGE } from "../constants/errors";

export async function signInWithGoogle() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  return signInWithRedirect(auth, provider).catch((error) => {
    const errorCode = error.code;
    if (errorCode === "auth/network-request-failed") {
      throw new Error(SIGNIN_NETWORK_ERROR_MESSAGE);
    }
    console.error("An error occurred during sign-in:", error.message);
  });
}

export async function signInAnonymous() {
  const auth = getAuth();
  return signInAnonymously(auth).catch((error) => {
    const errorCode = error.code;
    if (errorCode === "auth/network-request-failed") {
      throw new Error(SIGNIN_NETWORK_ERROR_MESSAGE);
    }
    console.error("An error occurred during sign-in:", error.message);
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
