import { ThunkDispatch } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { retrieveKeySecurely } from "../encryption/keyhandling";
import { auth } from "../firebase";
import { checkUserAgreement, getPersistenceID } from "../firebase/UsersService";
import { retryPromise } from "../firebase/utils";
import { setIsAuthenticating, setPersistentId, setUser } from "../redux/reducer/authSlice";
import { RootState } from "../redux/store";
enum loadingStates {
  Intializing = "Intializing",
  Authenticating = "Authenticating",
  Preparing = "Preparing Data",
}
export const useAuthState = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const isauthenticating = useSelector((state: RootState) => state.auth.authenticating);
  const persistenceIdState = useSelector((state: RootState) => state.auth.persistentId);
  const user = useSelector((state: RootState) => state.auth.user);
  const [loadingState, setLoadingState] = useState<loadingStates>(loadingStates.Intializing);
  const [openSeedPhrase, setOpenSeedPhrase] = useState<{ open: boolean; hasSalt: Uint8Array | null }>({
    open: false,
    hasSalt: null,
  });

  /* AUTH STATE ------------------------------------------------------------------------------------------*/

  useEffect(() => {
    const authInstance = auth;

    const unsubscribe = authInstance.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setLoadingState(loadingStates.Authenticating);
        /* CHECK AGREEMENT -------------------------------------------------------------------------------*/
        const hasAgreed = await retryPromise(checkUserAgreement, 3, 1500);

        if (hasAgreed === undefined) {
          window.location.reload();
          return;
        }

        if (!hasAgreed) {
          /* SAVE AGREEMENT AND USER RECORD CREATION  -----------------------------------------------------*/
          const { saveUserAndAgreement } = await import("../firebase/UsersService");
          const savedAgreement = await retryPromise(saveUserAndAgreement, 3, 1500);
          if (savedAgreement === undefined) {
            window.location.reload();
            return;
          }

          /* CATEGORIES DATA POPULATION -------------------------------------------------------------------*/
          const { populateFirestoreCollection } = await import("../firebase/defaultData");
          const populated = await retryPromise(populateFirestoreCollection, 3, 5000);
          if (populated === undefined) {
            window.location.reload();
            return;
          }

          /* PERSISTENCE ID / USER IDENTIFIER FOR LOCALSTORAGE  -------------------------------------------*/
          const persistenceID = await retryPromise(getPersistenceID, 3, 1500);
          if (persistenceID === undefined) {
            window.location.reload();
            return;
          }
          dispatch(setPersistentId(persistenceID));
          dispatch(setUser(userAuth));
        } else {
          setLoadingState(loadingStates.Preparing);
          /* PERSISTENCE ID / USER IDENTIFIER FOR LOCALSTORAGE  -------------------------------------------*/
          const persistenceID = await retryPromise(getPersistenceID, 3, 1500);

          if (persistenceID === undefined) {
            window.location.reload();
            return;
          }
          dispatch(setPersistentId(persistenceID));
          dispatch(setUser(userAuth));
        }
      } else {
        dispatch(setUser(null));
      }

      dispatch(setIsAuthenticating(false));
    });

    return () => unsubscribe();
  }, []);

  /* ENCRYPTION KEY ------------------------------------------------------------------------------------*/
  useEffect(() => {
    const checkKey = async () => {
      if (!user || !persistenceIdState) return;

      //check if user has derived key, check using persistenceId
      //check for key first instead of salt directly because salt can be present without keys because key--
      //is local, but not the other way around, happens when user changed device or storage was cleared
      const key = await retrieveKeySecurely();
      if (!key) {
        const { retrieveUserSalt } = await import("../firebase/UsersService");
        const salt = await retrieveUserSalt();

        //if has salt, user already has keys/seed but changed device/cleared storage. Now require seed phrase and test decrypt test data in user collection using salt+seed phrase
        //if no salt, then user has sign in first time, show the seed phrase and derive key from that.
        setOpenSeedPhrase({ open: true, hasSalt: salt });
      } else {
        /* TRANSACTION DATA POPULATION-------------------------------------------------------------------*/
        const { fetchbudget } = await import("../redux/actions/budgetAction");
        const { fetchExpenses } = await import("../redux/actions/expenseAction");
        const { fetchincome } = await import("../redux/actions/incomeAction");
        const { fetchSavings, fetchSavingsContributions } = await import("../redux/actions/savingsAction");
        dispatch(fetchExpenses());
        dispatch(fetchbudget());
        dispatch(fetchincome());
        dispatch(fetchSavings());
        dispatch(fetchSavingsContributions());
      }
    };

    checkKey();
  }, [user]);

  return { isauthenticating, loadingState, openSeedPhrase, setOpenSeedPhrase };
};
