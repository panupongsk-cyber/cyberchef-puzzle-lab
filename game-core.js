/**
 * CyberChef Cryptographic Puzzle Lab - Core Engine & Level Database
 * written in English for the CPE & IIE Programs at Naresuan University
 */

// Handle Web Crypto API environment detection
const getCrypto = () => {
  if (typeof require !== 'undefined') {
    return require('crypto').webcrypto;
  }
  return window.crypto;
};

// Data converters and basic string operations
const converters = {
  fromHex: (hexStr) => {
    // Remove space, colon, comma or 0x prefixes
    const cleanHex = hexStr.replace(/(0x|[\s,;:]+)/g, '');
    if (cleanHex.length % 2 !== 0) return "[ERROR: Hex length must be even]";
    try {
      let str = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        str += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
      }
      return str;
    } catch (e) {
      return "[ERROR: Invalid Hex input]";
    }
  },

  toHex: (str) => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i).toString(16);
      hex += (code.length === 1 ? '0' + code : code) + ' ';
    }
    return hex.trim();
  },

  fromBase64: (base64Str) => {
    try {
      const cleanB64 = base64Str.trim().replace(/\s+/g, '');
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(cleanB64, 'base64').toString('binary');
      }
      return atob(cleanB64);
    } catch (e) {
      return "[ERROR: Invalid Base64 input]";
    }
  },

  toBase64: (str) => {
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'binary').toString('base64');
      }
      return btoa(str);
    } catch (e) {
      return "[ERROR: Cannot encode Base64]";
    }
  },

  xor: (str, key) => {
    if (!key) return str;
    let keyBytes = [];
    if (key.startsWith('0x')) {
      const hexVal = parseInt(key.slice(2), 16);
      keyBytes = isNaN(hexVal) ? [] : [hexVal];
    } else {
      for (let i = 0; i < key.length; i++) {
        keyBytes.push(key.charCodeAt(i));
      }
    }
    if (keyBytes.length === 0) return str;

    let result = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const keyByte = keyBytes[i % keyBytes.length];
      result += String.fromCharCode(charCode ^ keyByte);
    }
    return result;
  },

  sha256: async (str) => {
    try {
      const crypto = getCrypto();
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.error("SHA-256 Error", e);
      return "[ERROR: Cryptographic Hash Failure]";
    }
  },

  aesDecrypt: async (ciphertextBase64, keyStr, ivStr) => {
    try {
      const crypto = getCrypto();
      const encoder = new TextEncoder();
      
      // Pad key or IV to correct bytes (32 bytes for AES-256 key, 16 bytes for IV)
      const keyBytes = new Uint8Array(32);
      const tempKey = encoder.encode(keyStr);
      keyBytes.set(tempKey.slice(0, 32));

      const ivBytes = new Uint8Array(16);
      const tempIv = encoder.encode(ivStr);
      ivBytes.set(tempIv.slice(0, 16));

      // Import key
      const key = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
      );

      // Convert ciphertext base64 to binary buffer
      const cipherBinary = converters.fromBase64(ciphertextBase64);
      const cipherBytes = new Uint8Array(cipherBinary.length);
      for (let i = 0; i < cipherBinary.length; i++) {
        cipherBytes[i] = cipherBinary.charCodeAt(i);
      }

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: ivBytes },
        key,
        cipherBytes
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return "[ERROR: Decryption Failed. Check Key/IV parameters]";
    }
  }
};

const LEVELS = [
  {
    id: 1,
    title: "Level 1: Decoding the Transmission",
    scenario: "A remote grading agent transmitted grades payload encoded to prevent clean text exposure over syslog. Decode the base64 payload to retrieve the validation flag.",
    input: "MzA1MzMxX0NvbXB1dGVyX1NlY3VyaXR5X05VX0NQRQ==",
    target: "305331_Computer_Security_NU_CPE",
    hint: "The payload ends with a double '=' padding, characteristic of Base64 encoding. Use 'From Base64'.",
    explanation: "Base64 is an encoding scheme, not encryption. It provides no confidentiality because it is easily decoded back to plaintext without any key."
  },
  {
    id: 2,
    title: "Level 2: XOR Key Compromise",
    scenario: "An attacker obfuscated their command-and-control server address using hex representation and XORed it with a single character static key '0' (hex value 0x30). Decode it.",
    input: "5e5142554345515e6f455e59465542435944496f534055",
    target: "naresuan_university_cpe",
    hint: "Use 'From Hex' first to convert binary digits back, then apply 'XOR' with key '0x30'.",
    explanation: "Static single-byte XOR obfuscation is extremely weak. Attackers use it to bypass antivirus signature analysis, but it is trivial to crack once the key is known."
  },
  {
    id: 3,
    title: "Level 3: Symmetric Lockout",
    scenario: "A database backup of transaction logs was encrypted using AES-256-CBC. Decrypt it to read the system status. Key: 'cpe_iie_secret_key', IV: 'iv_init_vector123'.",
    input: "8Cg+JfUPVfz743G4sc43n4nZhsMvQYemQ5pwuGyIPdc=",
    target: "database_decrypted_successfully",
    hint: "Use 'AES Decrypt' and input the parameters: Key = 'cpe_iie_secret_key', IV = 'iv_init_vector123'.",
    explanation: "AES (Advanced Encryption Standard) in CBC mode is a strong symmetric cipher. Both parties must share the secret key. If the key or IV is altered by even one bit, decryption fails."
  },
  {
    id: 4,
    title: "Level 4: Integrity Signature Audit",
    scenario: "Calculate the SHA-256 cryptographic signature of the clean plaintext config string: 'allow_root_login=false; port=22;' to submit to the auditor.",
    input: "allow_root_login=false; port=22;",
    target: "e02fcf8d548d0a98be7b91419b2195b7d2ba938a155624515e82f95bcf8be2f7",
    hint: "Simply feed the raw input string directly to the 'SHA-256 Hash' operation.",
    explanation: "Cryptographic hashes like SHA-256 verify integrity. If even one space or semicolon in the configuration file changes, the resulting hash will change entirely."
  }
];

// Helper score calculation
function calculateScore(basePoints, timeElapsedSeconds, maxTimeSeconds = 90) {
  if (timeElapsedSeconds >= maxTimeSeconds) {
    return Math.floor(basePoints * 0.5);
  }
  const speedRatio = (maxTimeSeconds - timeElapsedSeconds) / maxTimeSeconds;
  const speedBonus = Math.floor(basePoints * 0.5 * speedRatio);
  return basePoints + speedBonus;
}

// Evaluate learning outcomes
function evaluateLearningOutcome(scores) {
  let correctCount = 0;
  let totalCount = scores.length;
  scores.forEach(s => {
    if (s.correct) correctCount++;
  });

  const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  
  let title = "SecOps Cadet";
  let badge = "🛡️";
  let description = "Keep practicing! Cryptography pipelines require precise sequence operations.";

  if (accuracy >= 90) {
    title = "Cryptographic Architect";
    badge = "👑";
    description = "Perfect! You understand representation, hashing, symmetric decryption, and pipeline composition.";
  } else if (accuracy >= 75) {
    title = "Security Auditor";
    badge = "🔑";
    description = "Great job. You successfully parsed encodings and symmetric keys.";
  } else if (accuracy >= 50) {
    title = "Crypto Analyst";
    badge = "⚙️";
    description = "You completed basic operations but struggled on combined pipelines.";
  }

  return {
    accuracy,
    title,
    badge,
    description
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    converters,
    LEVELS,
    calculateScore,
    evaluateLearningOutcome
  };
}
