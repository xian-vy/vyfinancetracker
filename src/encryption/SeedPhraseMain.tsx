import React, { useEffect, useState } from "react";
import { updateUserSalt } from "../firebase/UsersService";
import useSnackbarHook from "../hooks/snackbarHook";
import SeedPhraseDialog from "./SeedPhraseDialog";
import { testDecryption } from "./encryption";
import { deriveKeyFromSeedPhrase, generateSeedPhrase, storeKeySecurely } from "./keyhandling";
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
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  useEffect(() => {
    if (!salt) {
      const phrase = generateSeedPhrase();
      setSeedPhrase(phrase);
    }
  }, [salt]);

  const handleKeyCreation = async () => {
    //if salt is available, user has generated key but changed device, require seed phrase for decrypt testing
    if (salt) {
      const { key } = await deriveKeyFromSeedPhrase(seedPhrase, salt);
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
      const { key, saltToUse } = await deriveKeyFromSeedPhrase(seedPhrase);
      await storeKeySecurely(key);
      await updateUserSalt(saltToUse);
    }

    onKeyStored();
  };

  return (
    <>
      <SeedPhraseDialog
        open={open}
        salt={salt}
        onConfirmSeed={handleKeyCreation}
        onDeleteAccount={onDeleteAccount}
        seedPhrase={seedPhrase}
        setSeedPhrase={setSeedPhrase}
      />
      {SnackbarComponent}
    </>
  );
};

export default React.memo(SeedPhraseMain);
