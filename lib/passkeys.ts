import { STORAGE_PASSKEY_LIST_KEY } from "./constants";
import { CreateCredential, P256Credential, P256Signature } from "./types";
import { AsnParser } from "@peculiar/asn1-schema";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import cbor from "cbor";
import { parseAuthenticatorData } from "@simplewebauthn/server/helpers";
import { Hex, toHex } from "viem";
import { shouldRemoveLeadingZero, concatUint8Arrays } from "./utils";

/**
 * Create a passkey using WebAuthn API.
 * @returns {Promise<CreateCredential>} Passkey created
 * @throws {Error} If passkey creation fails
 */
export async function createPasskey(): Promise<CreateCredential> {
  const displayName = "Test Passkey";
  //Generate a Passkey credential with WebAuthn API
  const passkeyCredential = await navigator.credentials.create({
    publicKey: {
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7,
        },
      ],
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      authenticatorSelection: {
        requireResidentKey: true,
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
      rp: {
        name: "Passkey",
        id: window.location.hostname,
      },
      user: {
        id: crypto.getRandomValues(new Uint8Array(32)),
        name: displayName,
        displayName: displayName,
      },
      timeout: 60_000,
      attestation: "direct",
    },
  });

  if (!passkeyCredential) {
    throw Error("Passkey creation failed: No credential was returned.");
  }

  let cred = passkeyCredential as unknown as {
    rawId: ArrayBuffer;
    response: {
      clientDataJSON: ArrayBuffer;
      attestationObject: ArrayBuffer;
    };
  };

  const decodedAttestationObj = cbor.decode(cred.response.attestationObject);
  const authData = parseAuthenticatorData(decodedAttestationObj.authData);
  const publickey = cbor.decode(
    authData.credentialPublicKey?.buffer as ArrayBuffer
  );
  const x = toHex(publickey.get(-2));
  const y = toHex(publickey.get(-3));

  return {
    rawId: toHex(new Uint8Array(cred.rawId)),
    pubKey: {
      x,
      y,
    },
  };
}

/**
 * Store passkey in local storage
 * @param {CreateCredential} passkey - passkey object with rawId and pubkey
 */
export function storePasskeyInLocalStorage(passkey: CreateCredential) {
  const passkeys = loadPasskeysFromLocalStorage();

  passkeys.push(passkey);

  localStorage.setItem(STORAGE_PASSKEY_LIST_KEY, JSON.stringify(passkeys));
}

/**
 * Load passkey from local storage
 * @returns {CreateCredential[]} passkeys stored in local storage
 */
export function loadPasskeysFromLocalStorage(): CreateCredential[] {
  const passkeyStored = localStorage.getItem(STORAGE_PASSKEY_LIST_KEY);

  const passkeyIds = passkeyStored ? JSON.parse(passkeyStored) : [];

  return passkeyIds;
}

/**
 * Get passkey obj from local storage via the given rawId
 * @param {string} rawId - rawId of passkey
 * @returns {CreateCredential} passkey object
 */
export function getPasskeyFromRawId(rawId: string): CreateCredential {
  const passkeys = loadPasskeysFromLocalStorage();

  return passkeys.find((passkey) => passkey.rawId === rawId)!;
}

export async function get(challenge?: Hex): Promise<P256Credential | null> {
  const options: PublicKeyCredentialRequestOptions = {
    timeout: 60_000,
    challenge: challenge
      ? Buffer.from(challenge.slice(2), "hex")
      : crypto.getRandomValues(new Uint8Array(32)),
    rpId: window.location.hostname,
    userVerification: "preferred",
  } as PublicKeyCredentialRequestOptions;

  const credential = await window.navigator.credentials.get({
    publicKey: options,
  });

  if (!credential) {
    throw Error("Passkey get failed: No credential was returned.");
  }

  const cred = credential as unknown as {
    rawId: ArrayBuffer;
    response: {
      clientDataJSON: ArrayBuffer;
      authenticatorData: ArrayBuffer;
      signature: ArrayBuffer;
      userHandle: ArrayBuffer;
    };
  };

  const utf8Decoder = new TextDecoder("utf-8");

  const decodedClientData = utf8Decoder.decode(cred.response.clientDataJSON);
  const clientDataObj = JSON.parse(decodedClientData);

  const authenticatorData = toHex(
    new Uint8Array(cred.response.authenticatorData)
  );
  const signature = parseSignature(new Uint8Array(cred?.response?.signature));

  return {
    rawId: toHex(new Uint8Array(cred.rawId)),
    clientData: {
      type: clientDataObj.type,
      challenge: clientDataObj.challenge,
      origin: clientDataObj.origin,
      crossOrigin: clientDataObj.crossOrigin,
    },
    authenticatorData,
    signature,
  };
}

export function parseSignature(signature: Uint8Array): P256Signature {
  const parsedSignature = AsnParser.parse(signature, ECDSASigValue);
  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);
  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }
  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }
  const finalSignature = concatUint8Arrays([rBytes, sBytes]);
  return {
    r: toHex(finalSignature.slice(0, 32)),
    s: toHex(finalSignature.slice(32)),
  };
}
