import io
import logging
from pypdf import PdfReader
from app.services.llm import call_llm_self_healing

logger = logging.getLogger(__name__)

# Expected JSON schema format description for LLM response
RESUME_SCHEMA = """{
  "candidate_name": "string (name of the candidate, default to empty string if not found)",
  "candidate_email": "string (email address, default to empty string if not found)",
  "skills": ["string (list of technical skills, programming languages, databases, or frameworks parsed)"],
  "experience": [
    {
      "role": "string (job title / role)",
      "company": "string (company name)",
      "duration": "string (employment dates / duration)",
      "details": "string (bullet points summary of accomplishments and tech stack used)"
    }
  ],
  "projects": [
    {
      "title": "string (project title)",
      "tech_stack": ["string (list of technologies used in this project)"],
      "description": "string (short summary of what the project accomplished)"
    }
  ]
}"""

def extract_raw_text_from_pdf(pdf_bytes: bytes) -> str:
    """Reads PDF binary content and extracts raw text using PyPDF."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text_content = []
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        
        extracted_text = "\n".join(text_content).strip()
        if not extracted_text:
            logger.warning("No text extracted from PDF. Document might be scanned or empty.")
        return extracted_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise ValueError(f"Failed to process PDF file: {e}")

async def parse_resume_text(raw_text: str) -> dict:
    """Uses LLM self-healing service to extract structured JSON profile from CV text."""
    if not raw_text.strip():
        return {
            "candidate_name": "Unknown Candidate",
            "candidate_email": "",
            "skills": [],
            "experience": [],
            "projects": []
        }
    
    prompt = (
        "You are an expert technical recruiter. Analyze the following candidate resume text. "
        "Extract details about their name, email, skills/technical stack, professional experience, and key projects.\n\n"
        f"--- START OF RESUME TEXT ---\n{raw_text}\n--- END OF RESUME TEXT ---\n\n"
        "Instructions:\n"
        "1. Extract candidate name, email, list of skills, professional experience, and projects.\n"
        "2. Keep experience details and project descriptions concise but descriptive.\n"
        "3. Output a valid, clean JSON object matching the requested schema."
    )

    try:
        profile_json = await call_llm_self_healing(prompt, RESUME_SCHEMA)
        return profile_json
    except Exception as e:
        logger.error(f"Failed to parse resume text using LLM: {e}")
        # Return fallback structured data
        return {
            "error": "LLM Parsing failed",
            "candidate_name": "Applicant",
            "candidate_email": "",
            "skills": ["Web Development"],
            "experience": [],
            "projects": []
        }
