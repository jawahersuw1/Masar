
CREATE TABLE historical_cases (
  case_id               INT PRIMARY KEY,
  case_type             ENUM('strong','moderate','weak','incomplete','unusual') NOT NULL, 
  description           VARCHAR(200) NOT NULL,  


  owner_experience_yrs  INT NULL,
  sector_id             INT NULL,               
  years_operating       INT NULL,
  employees             INT NULL,
  monthly_revenue       DECIMAL(12,2) NULL,      
  monthly_costs         DECIMAL(12,2) NULL,     
  cash_on_hand          DECIMAL(12,2) NULL,      
  expected_growth       DECIMAL(4,2) NULL,       
  loan_amount           DECIMAL(12,2) NULL,      
  term_years            INT NULL,
  annual_interest_rate  DECIMAL(5,3) NULL,       
  owner_contribution    DECIMAL(12,2) NULL,      

  completeness_pct      INT NOT NULL,           
  outcome               ENUM('repaid','late','defaulted') NOT NULL, 

  FOREIGN KEY (sector_id) REFERENCES sectors(sector_id)
);