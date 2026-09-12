// PostgreSQL DDL Schema for Iraqi Nursing Syndicate Inspection System

export const SQL_DATABASE_SCHEMA = `
-- ====================================================================
-- NATIONAL IRAQI NURSING SYNDICATE INSPECTION PLATFORM
-- PostgreSQL DDL Database Schema Structure
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hospital', 'clinic', 'center', 'beauty_center', etc.
    sector VARCHAR(50) NOT NULL, -- 'private', 'public'
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    license_number VARCHAR(100),
    license_status VARCHAR(50) NOT NULL, -- 'valid', 'expired', 'unlicensed'
    owner_name VARCHAR(255),
    director_name VARCHAR(255),
    phone VARCHAR(50),
    nursing_staff_count INT DEFAULT 0,
    compliance_score INT DEFAULT 100,
    risk_level VARCHAR(50) DEFAULT 'low',
    last_inspection_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nurse_staff (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    syndicate_id VARCHAR(50) UNIQUE NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    registration_status VARCHAR(50) NOT NULL, -- 'registered', 'pending', 'expired', 'fake'
    national_id VARCHAR(50),
    phone VARCHAR(50),
    hired_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_committees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    lead_inspector_id VARCHAR(50) REFERENCES users(id),
    members JSONB, -- Array of inspector IDs
    assigned_zone_ids JSONB, -- Array of zone IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_assignments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    committee_id VARCHAR(50) REFERENCES inspection_committees(id),
    inspector_id VARCHAR(50) REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(50) DEFAULT 'medium',
    scheduled_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS violation_records (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    assignment_id VARCHAR(50) REFERENCES inspection_assignments(id),
    inspector_id VARCHAR(50) REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'minor', 'moderate', 'severe', 'critical'
    description TEXT NOT NULL,
    fine_amount DECIMAL(12,2) DEFAULT 0.00,
    legal_action VARCHAR(255),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS district_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL, -- Polygon boundary lat/lng points
    risk_level VARCHAR(50) DEFAULT 'medium',
    assigned_committee_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export const SCHEMA_TABLES_DOCS = [
  { name: 'users', desc: 'إدارة حسابات المستخدمين والمفتشين ورؤساء اللجان في المحافظات' },
  { name: 'facilities', desc: 'بيانات المؤسسات الصحية والعيادات والمستشفيات والمراكز التخصصية' },
  { name: 'nurse_staff', desc: 'سجل الكوادر التمريضية والتحقق من الهويات النقابية ومؤهلاتهم' },
  { name: 'inspection_committees', desc: 'تشكيل لجان التفتيش وتحديد النطاقات والجغرافية المسندة' },
  { name: 'inspection_assignments', desc: 'جدولة المهام والزيارات التفتيشية الميدانية وتتبع حالتها' },
  { name: 'violation_records', desc: 'محاضر المخالفات والغرامات والإجراءات القانونية المتخذة' },
  { name: 'district_zones', desc: 'المناطق والقطاعات الجغرافية المحددة بإحداثيات GIS' },
];
