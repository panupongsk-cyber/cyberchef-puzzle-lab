/**
 * Unit tests for CyberChef Cryptographic Puzzle Lab
 */

const assert = require('assert');

// Setup Node Web Crypto environment shim before importing game core
global.crypto = require('crypto').webcrypto;

const { converters, LEVELS, calculateScore, evaluateLearningOutcome } = require('./game-core');

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING CYBERCHEF PUZZLE LAB CORE TESTS...");
  console.log("=========================================");

  try {
    // Test 1: Basic conversion checks
    console.log("Test 1: Verifying Hex & Base64 converters...");
    const rawStr = "cpe_nu";
    const hex = converters.toHex(rawStr);
    assert.strictEqual(converters.fromHex(hex), rawStr);

    const b64 = converters.toBase64(rawStr);
    assert.strictEqual(converters.fromBase64(b64), rawStr);
    console.log("✔ Base64 and Hex converters verified successfully.");

    // Test 2: XOR obfuscation logic
    console.log("Test 2: Verifying XOR obfuscation operations...");
    const plaintext = "hello";
    const xorEncoded = converters.xor(plaintext, "0x30");
    const xorDecoded = converters.xor(xorEncoded, "0x30");
    assert.strictEqual(xorDecoded, plaintext);
    console.log("✔ XOR logic verified successfully.");

    // Test 3: Solve Level 1 (Base64 decode)
    console.log("Test 3: Solving Level 1...");
    const lvl1 = LEVELS.find(l => l.id === 1);
    const lvl1Output = converters.fromBase64(lvl1.input);
    assert.strictEqual(lvl1Output, lvl1.target);
    console.log("✔ Level 1 solved successfully.");

    // Test 4: Solve Level 2 (Hex -> XOR 0x30)
    console.log("Test 4: Solving Level 2...");
    const lvl2 = LEVELS.find(l => l.id === 2);
    const bytes = converters.fromHex(lvl2.input);
    const lvl2Output = converters.xor(bytes, "0x30");
    assert.strictEqual(lvl2Output, lvl2.target);
    console.log("✔ Level 2 solved successfully.");

    // Test 5: Solve Level 3 (AES-256-CBC Decrypt)
    console.log("Test 5: Solving Level 3...");
    const lvl3 = LEVELS.find(l => l.id === 3);
    const lvl3Output = await converters.aesDecrypt(lvl3.input, "cpe_iie_secret_key", "iv_init_vector123");
    assert.strictEqual(lvl3Output.trim(), lvl3.target);
    console.log("✔ Level 3 solved successfully.");

    // Test 6: Solve Level 4 (SHA-256 Hashing)
    console.log("Test 6: Solving Level 4...");
    const lvl4 = LEVELS.find(l => l.id === 4);
    const lvl4Output = await converters.sha256(lvl4.input);
    assert.strictEqual(lvl4Output, lvl4.target);
    console.log("✔ Level 4 solved successfully.");

    // Test 7: Score calculation check
    console.log("Test 7: Verifying score bounds...");
    const perfectScore = calculateScore(100, 0, 90);
    const slowScore = calculateScore(100, 100, 90);
    assert.strictEqual(perfectScore, 150);
    assert.strictEqual(slowScore, 50);
    console.log("✔ Score calculations verified successfully.");

    // Test 8: Evaluation logic checks
    console.log("Test 8: Verifying learning outcomes classifications...");
    const perfectEval = evaluateLearningOutcome([
      { id: 1, correct: true },
      { id: 2, correct: true },
      { id: 3, correct: true },
      { id: 4, correct: true }
    ]);
    assert.strictEqual(perfectEval.title, "Cryptographic Architect");
    assert.strictEqual(perfectEval.badge, "👑");
    console.log("✔ Learning outcomes mapping verified successfully.");

    console.log("\n=========================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! [PASS]");
    console.log("=========================================");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:");
    console.error(err);
    process.exit(1);
  }
}

runTests();
