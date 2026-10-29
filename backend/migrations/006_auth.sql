/* Real accounts: email + password for business owners and bank staff. */

/* 1. Users get an email and a password hash. (The old demo users keep NULL here, so they cannot sign in.) */
ALTER TABLE users
  ADD COLUMN email          VARCHAR(190) NULL UNIQUE,   /* always stored in lower case */
  ADD COLUMN password_hash  VARCHAR(255) NULL,          /* salted hash, never the real password */
  ADD COLUMN created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;

/* 2. Each bank has a secret STAFF CODE. Someone who wants a reviewer account must know their bank's code.
      Only the SHA-256 hash is stored. */
ALTER TABLE banks ADD COLUMN access_code_hash CHAR(64) NULL;

/* DEMO codes for the prototype. Change them before showing the project (see scripts/set-bank-code.js):
     BANK_A -> BANKA-2026     BANK_B -> BANKB-2026     BANK_C -> BANKC-2026 */
UPDATE banks SET access_code_hash = SHA2('BANKA-2026', 256) WHERE bank_id = 'BANK_A';
UPDATE banks SET access_code_hash = SHA2('BANKB-2026', 256) WHERE bank_id = 'BANK_B';
UPDATE banks SET access_code_hash = SHA2('BANKC-2026', 256) WHERE bank_id = 'BANK_C';

/* 3. Sessions: one row per signed-in browser. Only a hash of the token is stored. */
CREATE TABLE sessions (
  token_hash  CHAR(64) PRIMARY KEY,
  user_id     INT      NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
