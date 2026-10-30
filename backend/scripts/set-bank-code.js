// set-bank-code.js - sets the secret staff code of a bank.   Usage:  node scripts/set-bank-code.js BANK_A MY-NEW-CODE
import { pool } from "../db.js";
import { sha256 } from "../auth.js";

const [bankId, code] = process.argv.slice(2);
if (!bankId || !code || code.length < 8) {
  console.log("Usage: node scripts/set-bank-code.js BANK_A MY-NEW-CODE   (the code must have at least 8 characters)");
  process.exit(1);
}
const [result] = await pool.query("UPDATE banks SET access_code_hash = ? WHERE bank_id = ?", [sha256(code), bankId]);
console.log(result.affectedRows ? `Staff code updated for ${bankId}.` : `No bank called ${bankId}.`);
await pool.end();
