const crypto = require("crypto");

function encrypt(text, passphrase) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, "sha512");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted,
    salt.toString("hex"),
  ].join(":");
}

function decrypt(encrypted, passphrase) {
  const [ivHex, authTagHex, encryptedHex, saltHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const salt = Buffer.from(saltHex, "hex");
  const key = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, "sha512");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ==== ТЕСТ ====
const passphrase = "secuRE_TEXT01";
const text = "qwesdasxzcwfdsvbgfresa4332";

const encrypted = encrypt(text, passphrase);
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted, passphrase);
console.log("Decrypted:", decrypted);
