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

-- ====================================================================
-- DYNAMIC FORM ENGINE + REAL-TIME TRACKING + OFFLINE SYNC
-- Requires: CREATE EXTENSION IF NOT EXISTS postgis;
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS inspection_templates (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(80) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    facility_type VARCHAR(50),
    schema_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    created_by VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_templates_active ON inspection_templates (is_active);

CREATE TABLE IF NOT EXISTS inspector_locations (
    inspector_id VARCHAR(50) PRIMARY KEY,
    inspector_name VARCHAR(255) NOT NULL,
    province_id VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(POINT, 4326),
    accuracy_meters DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspector_locations_geom ON inspector_locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_inspector_locations_active ON inspector_locations (is_active, updated_at DESC);

CREATE OR REPLACE FUNCTION trg_inspector_locations_geom() RETURNS trigger AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inspector_locations_geom ON inspector_locations;
CREATE TRIGGER inspector_locations_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON inspector_locations
FOR EACH ROW EXECUTE PROCEDURE trg_inspector_locations_geom();

CREATE TABLE IF NOT EXISTS inspection_sync_queue (
    id VARCHAR(50) PRIMARY KEY,
    inspector_id VARCHAR(50) NOT NULL,
    facility_id VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(50),
    payload JSONB NOT NULL,
    sync_status VARCHAR(20) DEFAULT 'QUEUED',
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMPTZ
);

-- Nearest active inspector (PostGIS). Fallback in app is Haversine if PostGIS is unavailable.
-- SELECT inspector_id, inspector_name,
--        ST_Distance(geom, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography) AS distance_m
-- FROM inspector_locations
-- WHERE is_active = TRUE AND updated_at > NOW() - INTERVAL '2 minutes'
-- ORDER BY geom <-> ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
-- LIMIT 1;
`;

export const SCHEMA_TABLES_DOCS = [
  { name: 'users', desc: 'إدارة حسابات المستخدمين والمفتشين ورؤساء اللجان في المحافظات' },
  { name: 'facilities', desc: 'بيانات المؤسسات الصحية والعيادات والمستشفيات والمراكز التخصصية' },
  { name: 'nurse_staff', desc: 'سجل الكوادر التمريضية والتحقق من الهويات النقابية ومؤهلاتهم' },
  { name: 'inspection_committees', desc: 'تشكيل لجان التفتيش وتحديد النطاقات والجغرافية المسندة' },
  { name: 'inspection_assignments', desc: 'جدولة المهام والزيارات التفتيشية الميدانية وتتبع حالتها' },
  { name: 'violation_records', desc: 'محاضر المخالفات والغرامات والإجراءات القانونية المتخذة' },
  { name: 'district_zones', desc: 'المناطق والقطاعات الجغرافية المحددة بإحداثيات GIS' },
  { name: 'inspection_templates', desc: 'قوالب استمارات الكشف الديناميكية (JSONB: فئات، أسئلة، أوزان، تفرع)' },
  { name: 'inspector_locations', desc: 'مواقع المفتشين الحية (PostGIS) للقيادة وغرفة العمليات' },
  { name: 'inspection_sync_queue', desc: 'طابور مزامنة التقارير المصورة بعد عودة الشبكة' },
];
