import algosdk from "algosdk";

async function getCrypto(): Promise<Crypto> {
  if (typeof crypto !== 'undefined') {
    return crypto;
  }
  if (typeof window === 'undefined') {
    // Node.js environment
    const { webcrypto } = await import('node:crypto');
    return webcrypto as Crypto;
  }
  throw new Error('No crypto implementation available');
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const cryptoModule = await getCrypto();
  const hashBuffer = await cryptoModule.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

export function stripNullBytes(string: string): string {
  return string.replace(/\0/g, '');
}

export function uint8ArrayToBigInt(uint8Array: Uint8Array) {
  let result = BigInt(0);
  for (let i = 0; i < uint8Array.length; i++) {
    result = (result << BigInt(8)) + BigInt(uint8Array[i]);
  }
  return result;
}

export function isVoiAddress(address: string): boolean {
  if (address.length !== 58) {
    return false;
  }

  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(address)) {
    return false;
  }

  return true;
}

type HashType = "name" | "all";

export async function namehash(name: string): Promise<Uint8Array> {
  if (!name) {
    return new Uint8Array(32);
  }

  const specialTlds = ["reverse"];

  const labels = name.split(".").reverse();

  // Force hashType to "all" if TLD is "reverse"
  let hashType = "name";
  if (labels[0] === "reverse") {
    hashType = "all";
  }
  
  let node = new Uint8Array(32);

  for (const label of labels) {
    if (label) {
      if (hashType === "name") {
        const labelBytes = new TextEncoder().encode(label);
        const labelHash = await sha256(labelBytes);
        const combined = new Uint8Array(labelHash.length + node.length);
        combined.set(node);
        combined.set(labelHash, node.length);
        node = await sha256(combined);
      } else {
      const labelBytes = new TextEncoder().encode(label);
      const labelHash = !isVoiAddress(label)
        ? await sha256(labelBytes)
        : await sha256(algosdk.decodeAddress(label).publicKey);

      const combined = new Uint8Array(labelHash.length + node.length);
      combined.set(node);
      combined.set(labelHash, node.length);

      node = await sha256(combined);
    }
    }
  }

  return node;
}

export function bigIntToUint8Array(value: bigint): Uint8Array {
  const hex = value.toString(16).padStart(64, '0');
  const array = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    array[i] = parseInt(hex.slice(i * 2, (i + 1) * 2), 16);
  }
  return array;
} 
