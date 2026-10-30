/* The bank can send an application back to the applicant ("Modify" = request changes).
   The applicant edits the answers and sends it again. This can repeat many times. */

/* 1. Status "changes_requested" replaces the old "more_info_requested" and "modified". */
ALTER TABLE applications MODIFY status
  ENUM('submitted','in_review','more_info_requested','accepted','modified','declined','changes_requested')
  NOT NULL DEFAULT 'submitted';
UPDATE applications SET status = 'changes_requested' WHERE status IN ('more_info_requested', 'modified');
ALTER TABLE applications MODIFY status
  ENUM('submitted','in_review','changes_requested','accepted','declined')
  NOT NULL DEFAULT 'submitted';

/* 2. Which round the application is in. 1 = the first time it was sent. */
ALTER TABLE applications     ADD COLUMN revision INT NOT NULL DEFAULT 1;
ALTER TABLE reviewer_actions ADD COLUMN revision INT NOT NULL DEFAULT 1;   /* the round the bank was looking at */

/* 3. Every version of the applicant's answers, kept for the history. */
CREATE TABLE application_revisions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  application_id    INT  NOT NULL,
  revision          INT  NOT NULL,
  inputs_json       TEXT NOT NULL,          /* the 12 answers as they were in that round */
  completeness_pct  INT  NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (application_id, revision),
  FOREIGN KEY (application_id) REFERENCES applications(id)
);

/* 4. Round 1 for the applications that already exist. */
INSERT INTO application_revisions (application_id, revision, inputs_json, completeness_pct, created_at)
SELECT a.id, 1,
       JSON_OBJECT('owner_experience_yrs', i.owner_experience_yrs, 'sector_id', i.sector_id,
                   'years_operating', i.years_operating, 'employees', i.employees,
                   'monthly_revenue', i.monthly_revenue, 'monthly_costs', i.monthly_costs,
                   'cash_on_hand', i.cash_on_hand, 'expected_growth', i.expected_growth,
                   'loan_amount', i.loan_amount, 'term_years', i.term_years,
                   'annual_interest_rate', i.annual_interest_rate, 'owner_contribution', i.owner_contribution),
       a.completeness_pct, a.created_at
FROM applications a JOIN application_inputs i ON i.application_id = a.id;
