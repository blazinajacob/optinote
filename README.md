# Eye Care EHR - Supabase Integration

This project uses Supabase as the backend database for the Eye Care Electronic Health Record (EHR) system.

## Setup Instructions

1. Create a Supabase project at [https://supabase.com](https://supabase.com)

2. Copy `.env.example` to `.env`:
```sh
cp .env.example .env
```

3. Update the `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# For GPT-4o integration
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Deploy the Edge Function for AI Assistant:
```sh
cd supabase
supabase functions deploy ai-assistant --no-verify-jwt
```

5. Set the OpenAI API key in Supabase:
```sh
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

6. Run the migration script in the Supabase SQL editor:
   - Navigate to your Supabase project dashboard
   - Go to the SQL Editor
   - Open the files from `/supabase/migrations/`
   - Run the scripts to create the database schema and sample data

## Database Schema

The application uses the following tables:

- `users`: Stores information about doctors, technicians, and administrators
- `patients`: Stores patient demographic and medical information
- `examinations`: Records clinical examinations performed on patients
- `soap_notes`: Stores SOAP (Subjective, Objective, Assessment, Plan) notes for examinations
- `appointments`: Manages patient appointments and scheduling
- `exam_images`: Stores references to examination images (fundus, OCT, etc.)

## Authentication

The application uses Supabase Auth for authentication. The sample data includes two test users:

- Doctor: doctor@eyecare.com (password: password)
- Technician: tech@eyecare.com (password: password)

## AI Assistant Features

The application integrates with OpenAI's GPT-4o model to provide an intelligent form assistant. Key features:

- Voice and text input for natural language form filling
- Secure processing through Supabase Edge Functions
- Context-aware field extraction
- Specialized assistance for different form types (patient registration, examination, SOAP notes)

## Row-Level Security

The database is configured with Row-Level Security (RLS) policies to ensure data access is properly controlled:

- All authenticated users can view and manage patients, examinations, and appointments
- Users can only access their own user data
- Administrators have access to all user data

## Development

To start the development server:

```sh
npm run dev
```