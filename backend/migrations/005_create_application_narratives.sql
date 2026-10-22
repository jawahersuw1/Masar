/* The AI-written explanation of an application (with the SWOT). One per audience, so the AI is not called again and again. */
CREATE TABLE application_narratives (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  application_id  INT NOT NULL,
  audience        ENUM('client','bank') NOT NULL,   /* who the text was written for */
  model           VARCHAR(60) NULL,                 /* which AI model wrote it */
  text            TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (application_id, audience),
  FOREIGN KEY (application_id) REFERENCES applications(id)
);
