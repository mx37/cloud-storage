import * as ed25519 from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";

// Configure ed25519
ed25519.hashes.sha512 = sha512;

export async function generateKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);

  return {
    privateKey: Buffer.from(privateKeyBytes).toString("hex"),
    publicKey: Buffer.from(publicKeyBytes).toString("hex"),
  };
}

export async function signMessage(
  privateKey: string,
  message: string
): Promise<string> {
  try {
    const privateKeyBytes = Buffer.from(privateKey, "hex");
    const messageBytes = Buffer.from(message, "utf-8");

    const signature = await ed25519.sign(messageBytes, privateKeyBytes);
    return Buffer.from(signature).toString("hex");
  } catch (error) {
    console.error("Error signing message:", error);
    throw new Error("Failed to sign message");
  }
}

const KEY_PAIR_PREFIX = "key_pair_";

// Store keypair in localStorage
export async function storeKeyPair(
  userId: string,
  privateKey: string,
  publicKey: string
): Promise<void> {
  try {
    const data = JSON.stringify({ privateKey, publicKey });
    localStorage.setItem(`${KEY_PAIR_PREFIX}${userId}`, data);
  } catch (error) {
    console.error("Error storing key pair:", error);
  }
}

// Get keypair from localStorage
export async function getKeyPair(
  userId: string
): Promise<{ privateKey: string; publicKey: string } | null> {
  try {
    const data = localStorage.getItem(`${KEY_PAIR_PREFIX}${userId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting key pair:", error);
  }
  return null;
}

// Get private key
export async function getPrivateKey(userId: string): Promise<string | null> {
  const keyPair = await getKeyPair(userId);
  return keyPair?.privateKey || null;
}

// Clear keypair
export async function clearKeyPair(userId: string): Promise<void> {
  localStorage.removeItem(`${KEY_PAIR_PREFIX}${userId}`);
}

// Derive manifest key from private key using HKDF
// This ensures encryption is based on the Ed25519 keypair, not just password
export async function deriveManifestKeyFromPrivateKey(
  privateKeyHex: string
): Promise<CryptoKey> {
  try {
    const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
    
    // Import private key bytes as raw key material for HKDF
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      { name: 'HKDF' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive a 256-bit key using HKDF
    // Use zero salt for consistency (all users derive from same source)
    const salt = new Uint8Array(16); // Zero salt
    const info = Buffer.from('manifest-encryption', 'utf-8');
    
    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: info,
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Error deriving manifest key:', error);
    throw new Error('Failed to derive manifest key from private key');
  }
}

// Export keypair to JSON file
export async function exportKeyPair(
  privateKey: string,
  publicKey: string,
  password?: string
): Promise<string> {
  let keyData: any = { privateKey, publicKey };
  
  // Optionally encrypt with password
  if (password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      Buffer.from(password, 'utf-8'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = Buffer.from(JSON.stringify(keyData), 'utf-8');
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      plaintext
    );

    keyData = {
      encrypted: true,
      salt: Buffer.from(salt).toString('hex'),
      iv: Buffer.from(iv).toString('hex'),
      data: Buffer.from(encryptedData).toString('hex'),
    };
  }

  return JSON.stringify(keyData, null, 2);
}

// Import keypair from JSON file
export async function importKeyPair(
  jsonContent: string,
  password?: string
): Promise<{ privateKey: string; publicKey: string }> {
  const keyData = JSON.parse(jsonContent);
  
  if (keyData.encrypted && password) {
    const salt = Buffer.from(keyData.salt, 'hex');
    const iv = Buffer.from(keyData.iv, 'hex');
    const encryptedData = Buffer.from(keyData.data, 'hex');

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      Buffer.from(password, 'utf-8'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        encryptedData
      );

      return JSON.parse(Buffer.from(decrypted).toString('utf-8'));
    } catch (error) {
      throw new Error('Failed to decrypt keys. Wrong password?');
    }
  } else if (keyData.privateKey && keyData.publicKey) {
    return { privateKey: keyData.privateKey, publicKey: keyData.publicKey };
  } else {
    throw new Error('Invalid key file format');
  }
}

// Download keypair as JSON file
export function downloadKeyPair(content: string, filename = 'keys-backup.json'): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
