CREATE DATABASE IF NOT EXISTS masar
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE masar;

-- Different bank profiles
CREATE TABLE bank_profiles (
    profile_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200) NOT NULL
);

-- Different sectors
CREATE TABLE sectors (
    sector_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Banks
CREATE TABLE banks (
    bank_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    profile_id INT NOT NULL,
    min_dscr DECIMAL(4,2) NOT NULL,
    min_contribution_pct DECIMAL(4,2) NOT NULL,
    min_completeness INT NOT NULL,
    min_years_operating INT NOT NULL,
    max_term_years INT NOT NULL,
    min_loan INT NOT NULL,
    max_loan INT NOT NULL,
    rate_min DECIMAL(5,3) NOT NULL,
    rate_max DECIMAL(5,3) NOT NULL,
    w_financial DECIMAL(3,2) NOT NULL,
    w_liquidity DECIMAL(3,2) NOT NULL,
    w_financing_pressure DECIMAL(3,2) NOT NULL,
    w_business DECIMAL(3,2) NOT NULL,
    w_operational DECIMAL(3,2) NOT NULL,
    w_data_confidence DECIMAL(3,2) NOT NULL,
    FOREIGN KEY (profile_id)
        REFERENCES bank_profiles(profile_id)
);

-- Link banks to caution sectors
CREATE TABLE bank_caution_sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_id VARCHAR(20) NOT NULL,
    sector_id INT NOT NULL,
    UNIQUE (bank_id, sector_id),
    FOREIGN KEY (bank_id) REFERENCES banks(bank_id),
    FOREIGN KEY (sector_id) REFERENCES sectors(sector_id)
);

-- Insert bank profiles
INSERT INTO bank_profiles (profile_id, name, description) VALUES
(1, 'Strict', 'High standards, careful with risk'),
(2, 'Balanced', 'Middle standards'),
(3, 'Flexible', 'Accepts small and young businesses');

-- Insert sectors
INSERT INTO sectors (sector_id, name) VALUES
(1, 'Retail'),
(2, 'Food & Beverage'),
(3, 'Construction & Contracting'),
(4, 'Logistics & Transport'),
(5, 'Manufacturing'),
(6, 'Healthcare Services'),
(7, 'Education & Training'),
(8, 'IT & Tech Services'),
(9, 'Tourism & Hospitality'),
(10, 'Agriculture');

-- Insert banks
INSERT INTO banks (
    bank_id, name, profile_id,
    min_dscr, min_contribution_pct, min_completeness,
    min_years_operating, max_term_years,
    min_loan, max_loan, rate_min, rate_max,
    w_financial, w_liquidity, w_financing_pressure,
    w_business, w_operational, w_data_confidence
) VALUES
('BANK_A', 'Bank A', 1,
 1.50, 0.20, 80, 3, 5, 100000, 2000000, 0.070, 0.090,
 0.25, 0.20, 0.25, 0.10, 0.10, 0.10),

('BANK_B', 'Bank B', 2,
 1.25, 0.15, 70, 2, 7, 50000, 5000000, 0.080, 0.105,
 0.22, 0.18, 0.20, 0.15, 0.15, 0.10),

('BANK_C', 'Bank C', 3,
 1.10, 0.10, 60, 1, 7, 10000, 1000000, 0.090, 0.120,
 0.20, 0.15, 0.20, 0.20, 0.15, 0.10);

-- Insert bank caution sectors
INSERT INTO bank_caution_sectors (bank_id, sector_id) VALUES
('BANK_A', 3),
('BANK_A', 9),
('BANK_B', 3);