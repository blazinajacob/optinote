// Supabase Edge Function for AI Form Assistant
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Flattens a nested object structure into a flat object with dot-notation keys
 * Example: { vision: { rightEye: { uncorrected: '20/40' } } } 
 * becomes { 'vision.rightEye.uncorrected': '20/40' }
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
    const pre = prefix.length ? `${prefix}.` : ''
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    const requestData = await req.json()
    
    // Handle different request types
    if (requestData.type === 'notes-analysis') {
      return await handleNotesAnalysis(requestData, headers)
    } else if (requestData.type === 'generate-summary') {
      return await handleSummaryGeneration(requestData, headers)
    } else {
      // Default to form input processing
      return await handleFormInputProcessing(requestData, headers)
    }
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers }
    )
  }
})

/**
 * Handle form input processing
 */
async function handleFormInputProcessing(requestData: any, headers: HeadersInit) {
  const { input, fields, contextHint } = requestData

  // Validate request
  if (!input || !fields || !Array.isArray(fields)) {
    return new Response(
      JSON.stringify({ error: 'Invalid request. Required fields: input, fields (array)' }),
      { status: 400, headers }
    )
  }

  // Create field descriptions for prompt
  const fieldDescriptions = fields.map(field => {
    const options = field.options 
      ? `, options: [${field.options.map(o => `"${o.label}"`).join(', ')}]` 
      : ''
    
    return `- ${field.label} (${field.name}): ${field.type}${options}`
  }).join('\n')

  // Build prompt for OpenAI
  const prompt = `
You are a medical form assistant for an Eye Care Electronic Health Record system. Your task is to extract information from user input to fill form fields.

IMPORTANT: When filling fields, use the exact field name including dot notation for nested fields (e.g., "vision.rightEye.uncorrected").

Form Fields:
${fieldDescriptions}

User Input: "${input}"
${contextHint ? `Additional Context: ${contextHint}` : ''}

1. Extract all relevant information from the user input.
2. Return ONLY a valid JSON object where keys match the exact field names and values are appropriate for each field type.
3. For fields not mentioned in the input, exclude them from the response.
4. Be precise with medical terminology related to ophthalmology.
5. When dealing with fields like vision.rightEye.uncorrected, include the full field name with dots in your response.

Example format:
{
  "chiefComplaint": "Blurry vision in right eye",
  "vision.rightEye.uncorrected": "20/40",
  "vision.leftEye.uncorrected": "20/20",
  "intraocularPressure.rightEye": 18
}
`

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  })

  // Process the response
  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("No response from AI")
  }

  // Extract JSON from the response (might be wrapped in code blocks)
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```\n([\s\S]*?)\n```/) || 
                    [null, content]
  
  const extractedJson = jsonMatch[1]?.trim() || content
  let parsedData

  try {
    parsedData = JSON.parse(extractedJson)
  } catch (error) {
    // Try to extract just the JSON part if there's text around it
    const jsonStart = extractedJson.indexOf('{')
    const jsonEnd = extractedJson.lastIndexOf('}') + 1
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const jsonPart = extractedJson.substring(jsonStart, jsonEnd)
      parsedData = JSON.parse(jsonPart)
    } else {
      throw new Error("Failed to parse AI response as JSON")
    }
  }

  // Flatten nested objects if any exist in the response
  let flattenedData = parsedData
  if (typeof parsedData === 'object' && parsedData !== null) {
    const hasNestedObjects = Object.values(parsedData).some(
      value => typeof value === 'object' && value !== null && !Array.isArray(value)
    )
    if (hasNestedObjects) {
      flattenedData = flattenObject(parsedData)
    }
  }

  // Update fields with values from the parsed data
  const updatedFields = [...fields]
  
  // Process flattened data
  Object.entries(flattenedData).forEach(([key, value]) => {
    const fieldIndex = updatedFields.findIndex(f => f.name === key)
    if (fieldIndex !== -1) {
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        value: value
      }
    }
  })

  return new Response(
    JSON.stringify({ fields: updatedFields }),
    { status: 200, headers }
  )
}

/**
 * Handle notes analysis requests
 */
async function handleNotesAnalysis(requestData: any, headers: HeadersInit) {
  const { notes } = requestData

  if (!notes) {
    return new Response(
      JSON.stringify({ error: 'Invalid request. Required field: notes' }),
      { status: 400, headers }
    )
  }

  // Build prompt for OpenAI
  const prompt = `
You are a medical assistant specialized in ophthalmology. Analyze the following clinical notes and extract key medical terms categorized by type.

Notes: "${notes}"

Extract all relevant medical terms and categorize them as:
- symptom: Patient's reported symptoms or clinical observations
- medication: Any mentioned medications or treatments
- procedure: Clinical procedures, tests, or interventions
- condition: Medical diagnoses or conditions
- other: Important terms that don't fit other categories

Return a JSON array of objects with 'text' and 'category' properties. Only include meaningful, specific medical terms.

Example format:
[
  {"text": "blurry vision", "category": "symptom"},
  {"text": "latanoprost", "category": "medication"},
  {"text": "cataract surgery", "category": "procedure"},
  {"text": "glaucoma", "category": "condition"}
]
`

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: "json_object" }
  })

  // Process the response
  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("No response from AI")
  }

  const parsedData = JSON.parse(content)
  
  return new Response(
    JSON.stringify({ keywords: parsedData.keywords || parsedData }),
    { status: 200, headers }
  )
}

/**
 * Handle summary generation requests
 */
async function handleSummaryGeneration(requestData: any, headers: HeadersInit) {
  const { entityType, entityData } = requestData

  if (!entityType || !entityData) {
    return new Response(
      JSON.stringify({ error: 'Invalid request. Required fields: entityType, entityData' }),
      { status: 400, headers }
    )
  }

  // Build prompt based on entity type
  let prompt = ''
  
  switch (entityType) {
    case 'patient':
      prompt = `
You are a medical assistant specialized in ophthalmology. Create a concise patient summary based on the following information. Focus on key demographic and medical details. Use professional, clinical language.

Patient Data: 
${JSON.stringify(entityData, null, 2)}

Provide a professionally written patient summary including:
1. Basic demographics (age, gender)
2. Relevant medical history
3. Allergies and medications
4. Insurance information
5. Contact details

Format the summary in clearly organized paragraphs with appropriate line breaks.
`
      break
      
    case 'examination':
      prompt = `
You are a medical assistant specialized in ophthalmology. Create a concise examination summary based on the following information. Focus on key findings, diagnoses, and recommendations. Use professional, clinical language.

Examination Data: 
${JSON.stringify(entityData, null, 2)}

Provide a professionally written examination summary including:
1. Chief complaint
2. Visual acuity findings
3. Intraocular pressure values
4. Key anterior and posterior segment findings
5. Diagnosis and plan
6. Follow-up recommendations

Format the summary with appropriate headings and line breaks.
`
      break
      
    case 'appointment':
      prompt = `
You are a medical assistant specialized in ophthalmology. Create a concise appointment summary based on the following information. Focus on key details and status. Use professional, clinical language.

Appointment Data: 
${JSON.stringify(entityData, null, 2)}

Provide a professionally written appointment summary including:
1. Date and time
2. Appointment type and status
3. Key notes or reasons for visit
4. Any action items or recommendations based on the status

Format the summary with appropriate headings and line breaks.
`
      break
      
    case 'soap':
      prompt = `
You are a medical assistant specialized in ophthalmology. Create a concise SOAP note summary based on the following information. Focus on key subjective complaints, objective findings, assessment, and plan. Use professional, clinical language.

SOAP Note Data: 
${JSON.stringify(entityData, null, 2)}

Provide a professionally written SOAP note summary including:
1. Key subjective complaints
2. Important objective findings
3. Assessment and diagnoses (with ICD-10 codes if available)
4. Treatment plan and follow-up recommendations
5. MIPS compliance information if relevant

Format the summary with appropriate headings and line breaks.
`
      break
      
    default:
      throw new Error(`Unsupported entity type: ${entityType}`)
  }

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  })

  // Process the response
  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("No response from AI")
  }

  return new Response(
    JSON.stringify({ summary: content }),
    { status: 200, headers }
  )
}