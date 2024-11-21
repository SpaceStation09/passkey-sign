/* eslint-disable @typescript-eslint/no-empty-object-type */
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { CreateCredential } from "../lib/types";
import { loadPasskeysFromLocalStorage } from "../lib/passkeys";

type props = {
  handleCreatePasskey: () => {};
  handleSelectPasskey: (passkey: CreateCredential) => {};
};

function LoginWithPasskey({ handleCreatePasskey, handleSelectPasskey }: props) {
  return (
    <Paper sx={{ margin: "32px auto 0" }}>
      <Stack padding={4}>
        <Typography textAlign={"center"} variant="h1" color={"primary"}>
          Use Account via Passkeys
        </Typography>

        <Typography
          textAlign={"center"}
          marginBottom={8}
          marginTop={8}
          variant="h4"
        >
          Create a passkey
        </Typography>

        <Button
          onClick={handleCreatePasskey}
          startIcon={<FingerprintIcon />}
          variant="outlined"
          sx={{ marginBottom: "24px" }}
        >
          Create a new passkey
        </Button>

        <Divider sx={{ marginTop: "32px" }}>
          <Typography variant="caption" color="GrayText">
            OR
          </Typography>
        </Divider>

        <Typography
          textAlign={"center"}
          marginBottom={8}
          marginTop={8}
          variant="h4"
        >
          Using an existing passkey
        </Typography>

        <Button
          startIcon={<FingerprintIcon />}
          variant="contained"
          onClick={async () => {
            const passkeys = loadPasskeysFromLocalStorage();

            handleSelectPasskey(passkeys[0]);
          }}
        >
          Use an existing passkey
        </Button>
      </Stack>
    </Paper>
  );
}

export default LoginWithPasskey;
