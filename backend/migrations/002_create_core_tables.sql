/* TABLE 1: people who can log in (demo users, no passwords) */
CREATE TABLE users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  role     ENUM('client','reviewer') NOT NULL, /* client = business owner, reviewer = bank worker */
  bank_id  VARCHAR(20) NULL,                   /* the bank a reviewer works for. Empty (NULL) for clients */
  FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
);

/* TABLE 2: one row per loan request */
CREATE TABLE applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  client_user_id    INT         NOT NULL,       /* who sent it (points to users) */
  bank_id           VARCHAR(20) NOT NULL,       /* which bank it was sent to */
  completeness_pct  INT         NOT NULL DEFAULT 0, /* % of the form answered */
  results_json      LONGTEXT    NULL,           /* Masar's calculated results. Empty until calculated */
  status            ENUM('submitted','in_review','more_info_requested',
                         'accepted','modified','declined') NOT NULL DEFAULT 'submitted',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_user_id) REFERENCES users(id),
  FOREIGN KEY (bank_id)        REFERENCES banks(bank_id)
);

/* TABLE 3: the client's answers. ONE row = one set of answers for one application */
CREATE TABLE application_inputs (
  application_id        INT PRIMARY KEY,         /* same number as applications.id, so it is 1 to 1 */

  /* Personal */
  owner_experience_yrs  INT NULL,                /* owner's years of experience */

  /* Business */
  sector_id             INT NULL,                /* link to the sectors list */
  years_operating       INT NULL,                /* how old the business is */
  employees             INT NULL,                /* number of workers */
  monthly_revenue       DECIMAL(12,2) NULL,      /* money coming in per month (SAR) */
  monthly_costs         DECIMAL(12,2) NULL,      /* money going out per month, before the new loan (SAR) */
  cash_on_hand          DECIMAL(12,2) NULL,      /* spare cash the business has now (SAR) */
  expected_growth       DECIMAL(4,2) NULL,       /* expected sales growth. 0.10 means 10% */

  /* Financing */
  loan_amount           DECIMAL(12,2) NULL,      /* loan requested (SAR) */
  term_years            INT NULL,                /* repayment period in years */
  annual_interest_rate  DECIMAL(5,3) NULL,       /* 0.080 means 8% per year */
  owner_contribution    DECIMAL(12,2) NULL,      /* owner's own money (SAR) */

  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (sector_id)      REFERENCES sectors(sector_id)
);

/* TABLE 4: the audit log. Every reviewer action adds one row. Never edit or delete rows here */
CREATE TABLE reviewer_actions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  application_id  INT         NOT NULL,        /* which application */
  bank_id         VARCHAR(20) NOT NULL,        /* for which bank */
  reviewer_id     INT         NOT NULL,        /* who did it (points to users) */
  action          ENUM('accept','modify','request_info','decline') NOT NULL,
  comment         TEXT NULL,                   /* the reviewer's note. Empty if none */
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (bank_id)        REFERENCES banks(bank_id),
  FOREIGN KEY (reviewer_id)    REFERENCES users(id)
);

/* Demo people for the "Login as" dropdown */
INSERT INTO users (name, role, bank_id) VALUES
('Ahmed', 'client',   NULL),
('Sara',  'reviewer', 'BANK_A'),
('Omar',  'reviewer', 'BANK_B'),
('Noor',  'reviewer', 'BANK_C');