import React from "react";
import { updateUserSalt } from "../firebase/UsersService";
import useSnackbarHook from "../hooks/snackbarHook";
import SeedPhraseDialog from "./SeedPhraseDialog";
import { testDecryption } from "./encryption";
import { deriveKeyFromSeedPhrase, storeKeySecurely } from "./keyhandling";
const SeedPhraseMain = ({
  onKeyStored,
  onDeleteAccount,
  open,
  salt,
}: {
  onKeyStored: () => void;
  onDeleteAccount: () => void;
  open: boolean;
  salt: Uint8Array | null;
}) => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const handleKeyCreation = async (newSeedPhrase: string) => {
    //if salt is available, user has generated key but changed device, require seed phrase for decrypt testing
    if (salt) {
      const { key } = await deriveKeyFromSeedPhrase(newSeedPhrase, salt);
      const testPassed = await testDecryption(key);

      if (testPassed) {
        console.log("Decryption test passed. The derived key and salt are correct.");
        await storeKeySecurely(key);
      } else {
        console.error("Decryption test failed. The decrypted data does not match the original test data.");
        openSuccessSnackbar("The provided seed phrase is incorrect.", true);
        return;
      }
    } else {
      // user first time sign in, generate new key from seed phrase
      const { key, saltToUse } = await deriveKeyFromSeedPhrase(newSeedPhrase);
      await storeKeySecurely(key);
      await updateUserSalt(saltToUse);
    }

    onKeyStored();
  };

  return (
    <>
      <SeedPhraseDialog open={open} salt={salt} onConfirmSeed={handleKeyCreation} onDeleteAccount={onDeleteAccount} />
      {SnackbarComponent}
    </>
  );
};

export default React.memo(SeedPhraseMain);
