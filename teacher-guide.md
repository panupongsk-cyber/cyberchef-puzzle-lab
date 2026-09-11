# Instructor Guide: CyberChef Cryptographic Puzzle Lab

## 1. Pedagogical Design & Course Alignment
This game is designed to support **Chapter 6 (Symmetric-key Encryption and Key Management) / Module 06: Cryptography Foundations**, delivered in Week 7-8 of the **305331 / 316331 Computer and Information Security** syllabus. *(Corrected 2026-09-09 — this guide previously cited "Module 02 & 03" and pointed to `planning-brief.md`/`weekly-teaching-kit.md`, neither of which exists in `ps-work`; the chapter/module number now matches `textbook/SUMMARY.md` and the `games-portal/index.html` card. See `PS-TASK-20260909-567`.)*

### Mapped Course Learning Outcomes (CLOs)
* **CLO 2.1 (Understand Cryptographic Core)**: Distinguish between data representation (encoding) and secure transformations (encryption).
* **CLO 2.2 (Symmetric Key Mechanics)**: Understand the components of ciphers (AES key length, IV blocks, CBC mode).
* **CLO 2.3 (Data Integrity)**: Audit data configurations using cryptographic hash verification (SHA-256).
* **CLO 2.4 (MLO6.3 — Authenticated Encryption)**: Explain why a confidentiality-only mode like AES-CBC does not by itself verify authenticity, and how an AEAD mode such as AES-GCM closes that gap.
* **CLO 2.5 (MLO6.4 — Key Lifecycle)**: Explain why encrypted records must stay traceable to the key generation that produced them, to support safe key rotation and retirement.

---

## 2. Level Solutions & Walkthroughs

Instructors can use the reference checklist below to guide students experiencing blockers:

### 🧩 Level 1: Decoding the Transmission
* **Input**: `MzA1MzMxX0NvbXB1dGVyX1NlY3VyaXR5X05VX0NQRQ==`
* **Correct Recipe**:
  1. `From Base64`
* **Target Output**: `305331_Computer_Security_NU_CPE`
* **Discussion Point**: Emphasize that Base64 encoding has no key. It is simply a data representation technique for binary data over text-only channels. It is NOT encryption.

### 🧩 Level 2: XOR Key Compromise
* **Input**: `5546595c1d53021d42555c51491d585f434409`
* **Correct Recipe**:
  1. `From Hex`
  2. `XOR` (Key: `0x30` or `'0'`)
* **Target Output**: `evil-c2-relay-host9`
* **Discussion Point**: Single-byte static XOR is computationally insecure. Explain how frequency analysis or plain key disclosure renders XOR useless for securing sensitive communications.

### 🧩 Level 3: Symmetric Lockout
* **Input**: `8Cg+JfUPVfz743G4sc43n4nZhsMvQYemQ5pwuGyIPdc=`
* **Correct Recipe**:
  1. `AES Decrypt` (Key: `cpe_iie_secret_key`, IV: `iv_init_vector123`)
* **Target Output**: `database_decrypted_successfully`
* **Discussion Point**: Discuss the role of Initialization Vectors (IVs) in CBC mode (preventing identical plaintexts from yielding identical ciphertexts). Show that changing one letter in the key breaks the entire decryption pipeline. Also flag, in preview of Level 5, that CBC decryption here succeeds with no built-in check that the ciphertext wasn't tampered with in transit — that's a confidentiality-only mode, not an authenticated one.

### 🧩 Level 4: Integrity Signature Audit
* **Input**: `allow_root_login=false; port=22;`
* **Correct Recipe**:
  1. `SHA-256 Hash`
* **Target Output**: `e02fcf8d548d0a98be7b91419b2195b7d2ba938a155624515e82f95bcf8be2f7`
* **Discussion Point**: Highlight hash functions as one-way trapdoors. Explain that a hash does not encrypt data (we cannot reverse the hash back to the configuration), but it allows the receiver to verify that the file was not altered in transit.

### 🧩 Level 5: Key Rotation Audit
* **Input**: `portal-aes-key-gen-07`
* **Correct Recipe**:
  1. `SHA-256 Hash`
* **Target Output**: `5f6f34e15ff0e534c1e5ed8d9cb9625b4ef8b1deaf8c152cb0256c043faa92ef`
* **Discussion Point**: Two connected ideas, both previously missing from this lab: (1) key lifecycle — an encrypted record must stay traceable to the key generation that produced it, so a team can safely rotate or retire keys without losing track of what still depends on them; (2) AEAD vs. plain confidentiality — revisit Level 3 and ask why AES-CBC decryption there would not have detected a tampered ciphertext, then explain that an AEAD mode like AES-GCM adds an authentication tag specifically to catch that.

---

## 3. Name/ID Entry & Verification
- Students enter their name and Student ID at the start screen; this is used only to personalize the
  on-screen session and printable certificate (kept in the browser, not sent anywhere).
- Instructors can verify submission authenticity by confirming that the printed **Verification Hash** matches:
  `Math.abs(hash(playerName_score_studentId_date_CYBERCHEF_LAB))`
