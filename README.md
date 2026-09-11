# CyberChef Cryptographic Puzzle Lab

An interactive drag-and-drop cryptographic workspace modeled after GCHQ's CyberChef tool.

## 🎮 Learning Objective
In this lab, you will learn to construct cryptographic recipe pipelines to decode, decrypt, and verify target payloads.

### Tasks:
1. **Level 1 (Encoding)**: Decode a syslog payload to retrieve the raw course-identifier string.
2. **Level 2 (Obfuscation)**: Reverse hex and XOR obfuscation vectors to extract a hidden attacker C2 address.
3. **Level 3 (Symmetric Decryption)**: Decrypt an AES-256-CBC health-check response using known keys.
4. **Level 4 (Integrity Audit)**: Generate a SHA-256 integrity hash of a system configuration.
5. **Level 5 (Key Rotation Audit)**: Fingerprint a key identifier to trace which key generation encrypted a record, and see why AES-CBC alone doesn't verify authenticity the way an AEAD mode like AES-GCM does.

## 🚀 How to Play
Open `index.html` in a web browser. Drag available operations from the left panel, configure parameters in the center pipeline, and review outputs in the workspace logs.
Once the output matches the level's objective, click **Execute & Verify Target** to submit.

---
Course: **305331 / 316331 Computer and Information Security**
Department of Electrical and Computer Engineering, Naresuan University.
Dual Stream: Computer Engineering (CPE) & Information Infrastructure Engineering (IIE).
