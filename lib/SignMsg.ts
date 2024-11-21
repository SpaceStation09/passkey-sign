import { CreateCredential, P256Credential } from "./types";
import { encodeAbiParameters, encodePacked } from "viem";
import { get } from "./passkeys";
import { Hex } from "webauthn-p256";

export const signMsg = async (
  passkey: CreateCredential,
  operationHash: Hex
): Promise<string> => {
  const msgToSign = encodePacked(["bytes32"], [operationHash]);
  const credentials: P256Credential = (await get(msgToSign)) as P256Credential;
  const signature = encodeAbiParameters(
    [
      {
        type: "tuple",
        name: "signature",
        components: [
          {
            name: "authenticatorData",
            type: "bytes",
          },
          {
            name: "clientDataJSON",
            type: "string",
          },
          {
            name: "challengeLocation",
            type: "uint256",
          },
          {
            name: "responseTypeLocation",
            type: "uint256",
          },
          {
            name: "r",
            type: "bytes32",
          },
          {
            name: "s",
            type: "bytes32",
          },
        ],
      },
    ],
    [
      {
        authenticatorData: credentials.authenticatorData,
        clientDataJSON: JSON.stringify(credentials.clientData),
        challengeLocation: BigInt(23),
        responseTypeLocation: BigInt(1),
        r: credentials.signature.r,
        s: credentials.signature.s,
      },
    ]
  );

  return signature;
};
