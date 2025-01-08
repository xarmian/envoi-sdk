import algosdk from "algosdk";

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
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

export async function namehash(name: string): Promise<Uint8Array> {
  if (!name) {
    return new Uint8Array(32);
  }

  const labels = name.split(".").reverse();
  let node = new Uint8Array(32);

  for (const label of labels) {
    if (label) {
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

  return node;
} 