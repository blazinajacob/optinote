-- Create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'technician', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY DEFAULT 'PT-' || floor(random() * 900000 + 100000)::TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  medical_history TEXT,
  allergies TEXT[],
  medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Examinations table
CREATE TABLE IF NOT EXISTS examinations (
  id TEXT PRIMARY KEY DEFAULT 'EX-' || floor(random() * 900000 + 100000)::TEXT,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  chief_complaint TEXT NOT NULL,
  vision JSONB NOT NULL,
  intraocular_pressure JSONB,
  refraction JSONB,
  pupils JSONB,
  anterior_segment TEXT,
  posterior_segment TEXT,
  diagnosis TEXT[],
  plan TEXT,
  follow_up TEXT,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOAP Notes table
CREATE TABLE IF NOT EXISTS soap_notes (
  id TEXT PRIMARY KEY DEFAULT 'SOAP-' || floor(random() * 900000 + 100000)::TEXT,
  examination_id TEXT REFERENCES examinations(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  icd10_codes JSONB NOT NULL,
  mips_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  mips_categories TEXT[],
  return_to_clinic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT 'APT-' || floor(random() * 900000 + 100000)::TEXT,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new-patient', 'follow-up', 'emergency', 'other')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Images table
CREATE TABLE IF NOT EXISTS exam_images (
  id TEXT PRIMARY KEY DEFAULT 'IMG-' || floor(random() * 900000 + 100000)::TEXT,
  examination_id TEXT REFERENCES examinations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fundus', 'oct', 'topography', 'other')),
  url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_images ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create policies for patients
CREATE POLICY "All authenticated users can view patients" ON patients 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert patients" ON patients 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update patients" ON patients 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policies for examinations
CREATE POLICY "All authenticated users can view examinations" ON examinations 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert examinations" ON examinations 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update examinations" ON examinations 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policies for SOAP notes
CREATE POLICY "All authenticated users can view SOAP notes" ON soap_notes 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert SOAP notes" ON soap_notes 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update SOAP notes" ON soap_notes 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policies for appointments
CREATE POLICY "All authenticated users can view appointments" ON appointments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert appointments" ON appointments 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update appointments" ON appointments 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policies for exam images
CREATE POLICY "All authenticated users can view exam images" ON exam_images 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert exam images" ON exam_images 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create sample data for testing
INSERT INTO users (id, email, name, role, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'doctor@eyecare.com', 'Dr. Sarah Johnson', 'doctor', 'https://randomuser.me/api/portraits/women/65.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'tech@eyecare.com', 'Michael Rodriguez', 'technician', 'https://randomuser.me/api/portraits/men/42.jpg');

-- Sample patients
INSERT INTO patients (id, first_name, last_name, date_of_birth, gender, phone, email, address, insurance_provider, insurance_policy_number, medical_history, allergies, medications)
VALUES 
  ('PT-123456', 'John', 'Doe', '1980-05-15', 'male', '(555) 123-4567', 'john.doe@example.com', '123 Main St, Anytown, CA 90210', 'Blue Cross', 'BC-987654321', 'Hypertension, Type 2 Diabetes', ARRAY['Penicillin'], ARRAY['Metformin 500mg', 'Lisinopril 10mg']),
  ('PT-234567', 'Jane', 'Smith', '1992-08-22', 'female', '(555) 987-6543', 'jane.smith@example.com', '456 Oak Ave, Somewhere, CA 90211', 'Aetna', 'AE-123456789', 'Astigmatism', NULL, NULL),
  ('PT-345678', 'Robert', 'Johnson', '1965-12-10', 'male', '(555) 456-7890', 'robert.j@example.com', '789 Pine St, Elsewhere, CA 90212', 'Medicare', 'MC-456789123', 'Glaucoma, Cataracts', ARRAY['Sulfa drugs'], ARRAY['Latanoprost eye drops']);

-- Sample examinations
INSERT INTO examinations (id, patient_id, doctor_id, date, chief_complaint, vision, intraocular_pressure, refraction, pupils, anterior_segment, posterior_segment, diagnosis, plan, follow_up, status)
VALUES 
  ('EX-123456', 'PT-123456', '00000000-0000-0000-0000-000000000001', '2024-06-10T10:30:00Z', 'Blurry vision in right eye for past 2 weeks', 
   '{"rightEye": {"uncorrected": "20/100", "corrected": "20/30", "pinhole": "20/25"}, "leftEye": {"uncorrected": "20/40", "corrected": "20/20", "pinhole": "20/20"}}',
   '{"rightEye": 18, "leftEye": 16}',
   '{"rightEye": {"sphere": -2.5, "cylinder": -0.75, "axis": 90, "add": 1.0, "pd": 32}, "leftEye": {"sphere": -1.75, "cylinder": -0.5, "axis": 85, "add": 1.0, "pd": 32}}',
   '{"rightEye": {"size": 4, "reaction": "normal", "RAPD": false}, "leftEye": {"size": 4, "reaction": "normal", "RAPD": false}}',
   'Clear cornea, deep anterior chamber, normal iris',
   'Cup-to-disc ratio 0.3 OU, clear vitreous, normal macula and periphery',
   ARRAY['H52.11 - Myopia, right eye', 'H52.201 - Astigmatism, right eye'],
   'Updated prescription for glasses, follow up in 1 year',
   '1 year',
   'completed');

-- Sample SOAP notes
INSERT INTO soap_notes (id, examination_id, patient_id, doctor_id, subjective, objective, assessment, plan, icd10_codes, mips_compliant, mips_categories, return_to_clinic)
VALUES 
  ('SOAP-123456', 'EX-123456', 'PT-123456', '00000000-0000-0000-0000-000000000001', 
   'Patient reports blurry vision in right eye for past 2 weeks. No pain or redness. No recent trauma or changes in medications.',
   'VA OD 20/100 SC, 20/30 cc, 20/25 ph. VA OS 20/40 SC, 20/20 cc, 20/20 ph. IOP: 18 mmHg OD, 16 mmHg OS. Refraction: OD -2.50 -0.75 x 90, OS -1.75 -0.50 x 85, Add +1.00 OU. Pupils equal, round, reactive to light. No RAPD. Anterior and posterior segments normal.',
   'Myopia, right eye (H52.11)\nAstigmatism, right eye (H52.201)',
   'Updated prescription for glasses. Patient educated on digital eye strain prevention. Follow up in 1 year for comprehensive eye examination.',
   '[{"code": "H52.11", "description": "Myopia, right eye"}, {"code": "H52.201", "description": "Astigmatism, right eye"}]',
   TRUE,
   ARRAY['Quality Measures', 'Promoting Interoperability'],
   '1 year');

-- Sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, date, start_time, end_time, type, status, notes)
VALUES 
  ('APT-123456', 'PT-123456', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, '09:00:00', '09:30:00', 'follow-up', 'scheduled', 'Follow-up for vision assessment'),
  ('APT-234567', 'PT-234567', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, '10:00:00', '11:00:00', 'new-patient', 'scheduled', 'First time comprehensive eye exam'),
  ('APT-345678', 'PT-345678', '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', '14:00:00', '14:30:00', 'follow-up', 'scheduled', 'Follow-up for glaucoma monitoring');