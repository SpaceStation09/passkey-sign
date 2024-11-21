import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { CreateCredential } from "../lib/types";
import { signMsg } from "../lib/SignMsg";
import { isHex, keccak256 } from "viem";
import TextField from "@mui/material/TextField";

type props = {
  passkey: CreateCredential;
};

function SafeAccountDetails({ passkey }: props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAlert, setIsAlert] = useState<boolean>(false);
  const [isSafeDeployed, setIsSafeDeployed] = useState<boolean>();
  const [sig, setSig] = useState<string>();
  const [opCalldata, setOpCalldata] = useState("");

  const showSafeInfo = useCallback(async () => {
    setIsLoading(true);

    //0xtest
    const isSafeDeployed = true;
    setIsSafeDeployed(isSafeDeployed);
    setIsLoading(false);
  }, [passkey]);

  useEffect(() => {
    showSafeInfo();
  }, [showSafeInfo]);

  async function handleSignOnExecution() {
    if (!isHex(opCalldata)) {
      setIsAlert(true);
    } else {
      setIsLoading(true);
      const msgHash = keccak256(opCalldata);
      const signature = await signMsg(passkey, msgHash);
      setIsLoading(false);
      setIsSafeDeployed(true);
      setSig(signature);
    }
  }

  async function handleInputChange(e: any) {
    setSig("");
    setOpCalldata(e.target.value);
  }

  return (
    <div>
      {isAlert ? (
        <Alert
          variant="filled"
          severity="error"
          onClose={() => {
            setIsAlert(false);
          }}
        >
          <AlertTitle>INVALID DATA</AlertTitle>
          Invalid calldata format, please use calldata string start with 0x.
        </Alert>
      ) : (
        <></>
      )}
      <Paper
        sx={{ margin: "32px auto 0", minWidth: "320px", maxWidth: "700px" }}
      >
        <Stack padding={5} direction={"column"} alignItems={"center"}>
          <Typography textAlign={"center"} variant="h1" color={"primary"}>
            Generate Signature on Your Operation
          </Typography>

          {isLoading ? (
            <CircularProgress sx={{ margin: "24px 0" }} />
          ) : (
            <>
              {!isSafeDeployed && <PendingDeploymentLabel />}
              <Button
                onClick={handleSignOnExecution}
                startIcon={<DriveFileRenameOutlineIcon />}
                variant="outlined"
                sx={{ margin: "24px" }}
              >
                Sign on operation
              </Button>
            </>
          )}

          <TextField
            id="outlined-multiline-flexible"
            label="Calldata"
            placeholder="0xYourCalldata"
            fullWidth
            multiline
            maxRows={5}
            value={opCalldata}
            onChange={handleInputChange}
          ></TextField>

          {sig && (
            <Typography
              textAlign={"center"}
              sx={{
                maxWidth: "700px",
                wordBreak: "break-word",
                marginTop: "20px",
              }}
              component={"p"}
            >
              {sig}
            </Typography>
          )}
        </Stack>
      </Paper>
    </div>
  );
}

export default SafeAccountDetails;

function PendingDeploymentLabel() {
  return (
    <div style={{ margin: "12px auto" }}>
      <span
        style={{
          marginRight: "8px",
          borderRadius: "4px",
          padding: "4px 12px",
          border: "1px solid rgb(255, 255, 255)",
          whiteSpace: "nowrap",
          backgroundColor: "rgb(240, 185, 11)",
          color: "rgb(0, 20, 40)",
        }}
      >
        Deployment pending
      </span>
    </div>
  );
}
