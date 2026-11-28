-- =============================================================================
-- ScholarChina Admissions Platform - MySQL Database DDL & Schema Migration
-- =============================================================================
-- Engine: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table: student_profiles (Linked to users / auth_user)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `nationality` VARCHAR(100) DEFAULT NULL COMMENT 'Candidate nationality e.g. Morocco, Algeria, France, Senegal',
    `birth_date` DATE DEFAULT NULL COMMENT 'Candidate date of birth for age limit validation',
    `current_degree` VARCHAR(100) DEFAULT NULL COMMENT 'Completed degree level e.g. High School Baccalaureate, Bachelor, Master',
    `gpa_raw` VARCHAR(50) DEFAULT NULL COMMENT 'Raw unnormalized grade/GPA as entered by student',
    `gpa_scale` ENUM('SCALE_20', 'SCALE_100', 'SCALE_4', 'UK_CLASS') NOT NULL DEFAULT 'SCALE_20' COMMENT 'Grading scale reference',
    `gpa_normalized_100` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Algorithmic normalized score on 0-100 scale',
    `english_test_type` ENUM('IELTS', 'TOEFL', 'DUOLINGO', 'NONE') NOT NULL DEFAULT 'NONE' COMMENT 'Language certification',
    `english_score` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Standardized test score e.g. 7.5 IELTS, 100 TOEFL, 125 DET',
    `hsk_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Chinese proficiency exam level (0 to 6)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_student_profiles_user_id` (`user_id`),
    KEY `idx_student_profiles_nationality` (`nationality`),
    KEY `idx_student_profiles_gpa_norm` (`gpa_normalized_100`),
    KEY `idx_student_profiles_hsk` (`hsk_level`),
    KEY `idx_student_profiles_degree` (`current_degree`),
    CONSTRAINT `fk_student_profiles_user`
        FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 2. Table: city_living_costs (City-by-City Baseline Living Expenses)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `city_living_costs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `country` VARCHAR(100) NOT NULL DEFAULT 'China' COMMENT 'Country name',
    `city_name` VARCHAR(100) NOT NULL COMMENT 'City name in English e.g. Beijing, Shanghai, Hangzhou',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT 'Currency ISO code e.g. CNY',
    `monthly_dorm_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Monthly university dormitory cost (RMB)',
    `monthly_offcampus_rent` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Monthly off-campus apartment rent (RMB)',
    `monthly_food_transport` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Monthly dining, food, and public transit (RMB)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_city_living_costs_country_city` (`country`, `city_name`),
    KEY `idx_city_living_costs_city_name` (`city_name`),
    KEY `idx_city_living_costs_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 3. Alter Table: scholarships (Adding Eligibility & Financial Coverage Columns)
-- -----------------------------------------------------------------------------
-- Note: Applies to both Django-prefixed `scholarships_scholarship` and custom `scholarships`

-- For Django table naming: scholarships_scholarship
ALTER TABLE `scholarships_scholarship`
    ADD COLUMN IF NOT EXISTS `target_degree` VARCHAR(100) DEFAULT NULL COMMENT 'e.g. Bachelor, Master, PhD, Language' AFTER `required_education_level`,
    ADD COLUMN IF NOT EXISTS `max_age` INT UNSIGNED DEFAULT NULL COMMENT 'Max age limit in years' AFTER `target_degree`,
    ADD COLUMN IF NOT EXISTS `min_gpa_100` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Minimum GPA normalized to 0-100' AFTER `max_age`,
    ADD COLUMN IF NOT EXISTS `min_english_score` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Minimum required English proficiency score' AFTER `min_gpa_100`,
    ADD COLUMN IF NOT EXISTS `min_hsk_level` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Minimum HSK level required (0 = none)' AFTER `min_english_score`,
    ADD COLUMN IF NOT EXISTS `eligible_countries` JSON DEFAULT NULL COMMENT 'JSON array of eligible country ISO codes e.g. ["MA", "FR", "DZ"]' AFTER `min_hsk_level`,
    ADD COLUMN IF NOT EXISTS `excluded_countries` JSON DEFAULT NULL COMMENT 'JSON array of restricted/excluded country ISO codes' AFTER `eligible_countries`,
    ADD COLUMN IF NOT EXISTS `covers_tuition` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '100% Tuition fee waiver' AFTER `application_fee`,
    ADD COLUMN IF NOT EXISTS `covers_dorm` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Free university on-campus dorm' AFTER `covers_tuition`,
    ADD COLUMN IF NOT EXISTS `covers_flight` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Round-trip airfare included' AFTER `covers_dorm`,
    ADD COLUMN IF NOT EXISTS `covers_insurance` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Comprehensive health insurance covered' AFTER `covers_flight`,
    ADD COLUMN IF NOT EXISTS `monthly_stipend` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Monthly cash living allowance e.g. 2500, 3000, 3500' AFTER `covers_insurance`,
    ADD COLUMN IF NOT EXISTS `stipend_currency` VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT 'Currency for stipend' AFTER `monthly_stipend`,
    ADD COLUMN IF NOT EXISTS `estimated_visa_medical_docs_cost` DECIMAL(10, 2) DEFAULT 1500.00 COMMENT 'Estimated initial out-of-pocket costs (visa, medical, documents)' AFTER `stipend_currency`;

-- Standalone table name variant (if deployed without Django app prefix)
ALTER TABLE `scholarships`
    ADD COLUMN IF NOT EXISTS `covers_tuition` TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS `covers_dorm` TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS `covers_flight` TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `covers_insurance` TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS `monthly_stipend` DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `stipend_currency` VARCHAR(10) NOT NULL DEFAULT 'CNY',
    ADD COLUMN IF NOT EXISTS `estimated_visa_medical_docs_cost` DECIMAL(10, 2) DEFAULT 1500.00;

-- Create index on eligibility & financial fields for high-performance matching
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_target_degree` ON `scholarships_scholarship` (`target_degree`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_min_gpa` ON `scholarships_scholarship` (`min_gpa_100`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_max_age` ON `scholarships_scholarship` (`max_age`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_hsk` ON `scholarships_scholarship` (`min_hsk_level`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_financial_covers_tuition` ON `scholarships_scholarship` (`covers_tuition`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_financial_stipend` ON `scholarships_scholarship` (`monthly_stipend`);


-- -----------------------------------------------------------------------------
-- 3. Sample Verification Queries & Demonstration Data
-- -----------------------------------------------------------------------------

-- Example 1: Inserting a Moroccan Candidate into student_profiles
-- Normalized GPA: 16.5 / 20.0 = 82.50%
INSERT INTO `student_profiles` (
    `user_id`,
    `nationality`,
    `birth_date`,
    `current_degree`,
    `gpa_raw`,
    `gpa_scale`,
    `gpa_normalized_100`,
    `english_test_type`,
    `english_score`,
    `hsk_level`
) VALUES (
    1,
    'Morocco',
    '2003-05-15',
    'Bachelor',
    '16.5',
    'SCALE_20',
    82.50,
    'IELTS',
    7.50,
    4
) ON DUPLICATE KEY UPDATE
    `nationality` = VALUES(`nationality`),
    `gpa_raw` = VALUES(`gpa_raw`),
    `gpa_scale` = VALUES(`gpa_scale`),
    `gpa_normalized_100` = VALUES(`gpa_normalized_100`),
    `english_test_type` = VALUES(`english_test_type`),
    `english_score` = VALUES(`english_score`),
    `hsk_level` = VALUES(`hsk_level`);

-- -----------------------------------------------------------------------------
-- 4. Baseline City Living Costs Seed Data (China University Hubs)
-- -----------------------------------------------------------------------------
INSERT INTO `city_living_costs` (
    `country`, `city_name`, `currency`, `monthly_dorm_cost`, `monthly_offcampus_rent`, `monthly_food_transport`
) VALUES
    ('China', 'Beijing', 'CNY', 900.00, 3500.00, 1800.00),
    ('China', 'Shanghai', 'CNY', 1000.00, 3800.00, 1900.00),
    ('China', 'Hangzhou', 'CNY', 700.00, 2400.00, 1400.00),
    ('China', 'Nanjing', 'CNY', 600.00, 2000.00, 1300.00),
    ('China', 'Wuhan', 'CNY', 500.00, 1600.00, 1100.00),
    ('China', 'Xi''an', 'CNY', 450.00, 1400.00, 1000.00),
    ('China', 'Guangzhou', 'CNY', 800.00, 2600.00, 1500.00),
    ('China', 'Shenzhen', 'CNY', 850.00, 3000.00, 1600.00),
    ('China', 'Chengdu', 'CNY', 500.00, 1500.00, 1100.00),
    ('China', 'Harbin', 'CNY', 400.00, 1200.00, 900.00),
    ('China', 'Tianjin', 'CNY', 600.00, 1900.00, 1200.00),
    ('China', 'Xiamen', 'CNY', 650.00, 2100.00, 1300.00)
ON DUPLICATE KEY UPDATE
    `monthly_dorm_cost` = VALUES(`monthly_dorm_cost`),
    `monthly_offcampus_rent` = VALUES(`monthly_offcampus_rent`),
    `monthly_food_transport` = VALUES(`monthly_food_transport`);


-- Example 2: Updating a CSC Scholarship with strict eligibility criteria & full financial coverage
UPDATE `scholarships_scholarship`
SET
    `target_degree` = 'Master',
    `max_age` = 35,
    `min_gpa_100` = 75.00,
    `min_english_score` = 6.50,
    `min_hsk_level` = 4,
    `eligible_countries` = JSON_ARRAY('Morocco', 'Algeria', 'Tunisia', 'France', 'Senegal'),
    `excluded_countries` = JSON_ARRAY(),
    `application_fee` = 0.00,
    `covers_tuition` = 1,
    `covers_dorm` = 1,
    `covers_flight` = 0,
    `covers_insurance` = 1,
    `monthly_stipend` = 3000.00,
    `stipend_currency` = 'CNY',
    `estimated_visa_medical_docs_cost` = 1500.00
WHERE `title` LIKE '%Chinese Government Scholarship%' OR `title` LIKE '%CSC%'
LIMIT 1;

-- Example 3: Calculating Monthly Net Out-of-Pocket Expense by City
-- Formula: (Dorm Cost [if not covered] + Food/Transport) - Monthly Stipend
SELECT 
    s.`title` AS scholarship,
    u.`city` AS university_city,
    s.`type`,
    s.`covers_tuition`,
    s.`covers_dorm`,
    s.`monthly_stipend`,
    c.`monthly_dorm_cost`,
    c.`monthly_food_transport`,
    -- If dorm is covered, student pays 0 for dorm. Otherwise pays monthly_dorm_cost.
    ROUND(
        (CASE WHEN s.`covers_dorm` = 1 THEN 0 ELSE c.`monthly_dorm_cost` END + c.`monthly_food_transport`)
        - COALESCE(s.`monthly_stipend`, 0), 2
    ) AS monthly_net_student_cost_cny
FROM `scholarships_scholarship` s
JOIN `scholarships_university` u ON s.`university_id` = u.`id`
LEFT JOIN `city_living_costs` c ON LOWER(u.`city`) = LOWER(c.`city_name`)
WHERE s.`is_active` = 1
LIMIT 10;

-- Example 3: Algorithmic Eligibility Matching Query (Student vs Scholarships)
SELECT 
    s.`id`,
    s.`title`,
    s.`type`,
    s.`level`,
    s.`target_degree`,
    s.`max_age`,
    s.`min_gpa_100`,
    s.`min_hsk_level`,
    sp.`nationality` AS student_country,
    sp.`gpa_normalized_100` AS student_gpa_100,
    sp.`hsk_level` AS student_hsk,
    TIMESTAMPDIFF(YEAR, sp.`birth_date`, CURDATE()) AS student_age,
    CASE 
        WHEN (s.`max_age` IS NULL OR TIMESTAMPDIFF(YEAR, sp.`birth_date`, CURDATE()) <= s.`max_age`)
         AND (s.`min_gpa_100` IS NULL OR sp.`gpa_normalized_100` >= s.`min_gpa_100`)
         AND (s.`min_hsk_level` = 0 OR sp.`hsk_level` >= s.`min_hsk_level`)
         AND (s.`eligible_countries` IS NULL OR JSON_CONTAINS(s.`eligible_countries`, JSON_QUOTE(sp.`nationality`)))
        THEN 'ELIGIBLE ✅'
        ELSE 'NOT ELIGIBLE ❌'
    END AS eligibility_status
FROM `scholarships_scholarship` s
CROSS JOIN `student_profiles` sp
WHERE sp.`user_id` = 1
LIMIT 10;

SET FOREIGN_KEY_CHECKS = 1;
