"use client";

import type { Theme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";

import { useState } from "react";

import LoginWithPasskey from "../../components/LoginWithPasskey";
import SafeAccountDetails from "../../components/SafeAccountDetails";
import SafeThemeProvider from "../../components/SafeThemeProvider";
import { createPasskey, storePasskeyInLocalStorage } from "../../lib/passkeys";
import { CreateCredential } from "../../lib/types";

function Create4337SafeAccount() {
  const [selectedPasskey, setSelectedPasskey] = useState<CreateCredential>();

  async function handleCreatePasskey() {
    const passkey = await createPasskey();

    storePasskeyInLocalStorage(passkey);
    setSelectedPasskey(passkey);
  }

  async function handleSelectPasskey(passkey: CreateCredential) {
    setSelectedPasskey(passkey);
  }

  return (
    <SafeThemeProvider>
      {(safeTheme: Theme) => (
        <ThemeProvider theme={safeTheme}>
          {selectedPasskey ? (
            <SafeAccountDetails passkey={selectedPasskey} />
          ) : (
            <LoginWithPasskey
              handleCreatePasskey={handleCreatePasskey}
              handleSelectPasskey={handleSelectPasskey}
            />
          )}
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  );
}

export default Create4337SafeAccount;
