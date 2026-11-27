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
-- 2. Alter Table: scholarships (Adding Eligibility Columns)
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
    ADD COLUMN IF NOT EXISTS `excluded_countries` JSON DEFAULT NULL COMMENT 'JSON array of restricted/excluded country ISO codes' AFTER `eligible_countries`;

-- Create index on eligibility fields for high-performance matching
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_target_degree` ON `scholarships_scholarship` (`target_degree`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_min_gpa` ON `scholarships_scholarship` (`min_gpa_100`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_max_age` ON `scholarships_scholarship` (`max_age`);
CREATE INDEX IF NOT EXISTS `idx_scholarships_eligibility_hsk` ON `scholarships_scholarship` (`min_hsk_level`);


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

-- Example 2: Updating a CSC Scholarship with strict eligibility criteria
UPDATE `scholarships_scholarship`
SET
    `target_degree` = 'Master',
    `max_age` = 35,
    `min_gpa_100` = 75.00,
    `min_english_score` = 6.50,
    `min_hsk_level` = 4,
    `eligible_countries` = JSON_ARRAY('Morocco', 'Algeria', 'Tunisia', 'France', 'Senegal'),
    `excluded_countries` = JSON_ARRAY()
WHERE `title` LIKE '%Chinese Government Scholarship%' OR `title` LIKE '%CSC%'
LIMIT 1;

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
