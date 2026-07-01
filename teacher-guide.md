# Instructor Guide: CyberChef Cryptographic Puzzle Lab

## 1. Pedagogical Design & Course Alignment
This game is designed to support **Week 2 / Module 02 & 03: Cryptography Foundations** of the **305331 / 316331 Computer and Information Security** syllabus.

### Mapped Course Learning Outcomes (CLOs)
* **CLO 2.1 (Understand Cryptographic Core)**: Distinguish between data representation (encoding) and secure transformations (encryption).
* **CLO 2.2 (Symmetric Key Mechanics)**: Understand the components of ciphers (AES key length, IV blocks, CBC mode).
* **CLO 2.3 (Data Integrity)**: Audit data configurations using cryptographic hash verification (SHA-256).

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
* **Input**: `5e5142554345515e6f455e59465542435944496f534055`
* **Correct Recipe**:
  1. `From Hex`
  2. `XOR` (Key: `0x30` or `'0'`)
* **Target Output**: `naresuan_university_cpe`
* **Discussion Point**: Single-byte static XOR is computationally insecure. Explain how frequency analysis or plain key disclosure renders XOR useless for securing sensitive communications.

### 🧩 Level 3: Symmetric Lockout
* **Input**: `8Cg+JfUPVfz743G4sc43n4nZhsMvQYemQ5pwuGyIPdc=`
* **Correct Recipe**:
  1. `AES Decrypt` (Key: `cpe_iie_secret_key`, IV: `iv_init_vector123`)
* **Target Output**: `database_decrypted_successfully`
* **Discussion Point**: Discuss the role of Initialization Vectors (IVs) in CBC mode (preventing identical plaintexts from yielding identical ciphertexts). Show that changing one letter in the key breaks the entire decryption pipeline.

### 🧩 Level 4: Integrity Signature Audit
* **Input**: `allow_root_login=false; port=22;`
* **Correct Recipe**:
  1. `SHA-256 Hash`
* **Target Output**: `e02fcf8d548d0a98be7b91419b2195b7d2ba938a155624515e82f95bcf8be2f7`
* **Discussion Point**: Highlight hash functions as one-way trapdoors. Explain that a hash does not encrypt data (we cannot reverse the hash back to the configuration), but it allows the receiver to verify that the file was not altered in transit.

---

## 3. Google Sign-In & Verification
- Verify that students sign in using their official `@nu.ac.th` accounts.
- The student's name, Student ID, and Google account email will be locked on the printable certificate.
- Instructors can verify submission authenticity by confirming that the printed **Verification Hash** matches:
  `Math.abs(hash(playerName_score_studentId_email_date_CYBERCHEF_LAB))`
