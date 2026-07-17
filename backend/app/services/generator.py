import json
import logging
from app.services.llm import call_llm_self_healing

logger = logging.getLogger(__name__)

# Expected JSON schema format description for generated questions
QUESTIONS_SCHEMA = """{
  "questions": [
    {
      "question_text": "string (the complete text of the question to ask)",
      "question_type": "string (either 'technical', 'behavioral', or 'coding')",
      "difficulty": "string (easy, medium, or hard)",
      "model_answer": "string (A flawless 10/10 perfect model answer for this exact question. For behavioral, structure with STAR: **Situation**, **Task**, **Action**, **Result** with quantitative outcomes. For technical, provide deep technical accuracy, architecture tradeoffs, and clear code/design concepts worthy of a 10/10 score.)"
    }
  ]
}"""

async def generate_interview_questions(
    skills: list, 
    experience: list, 
    projects: list, 
    difficulty: str = "Medium", 
    persona: str = "Standard Technical Interviewer"
) -> dict:
    """Generates customized interview questions based on candidate profile and settings."""
    
    # Construct a summary of candidate profile for LLM context
    profile_summary = f"Skills: {', '.join(skills) if skills else 'Software Engineering'}\n"
    
    if experience:
        profile_summary += "Experience:\n"
        for exp in experience[:2]: # take top 2 items
            profile_summary += f"- {exp.get('role', 'Developer')} at {exp.get('company', 'Company')} ({exp.get('duration', '')}): {exp.get('details', '')}\n"
            
    if projects:
        profile_summary += "Projects:\n"
        for proj in projects[:2]:
            profile_summary += f"- {proj.get('title', 'Project')} (stack: {', '.join(proj.get('tech_stack', []))}): {proj.get('description', '')}\n"

    prompt = (
        f"You are an experienced interviewer playing the persona of: '{persona}'.\n"
        f"Conduct an interview with a candidate whose profile is summarized below:\n"
        f"{profile_summary}\n"
        f"Generate exactly 10 tailored interview questions matching the difficulty level: '{difficulty}'.\n\n"
        "Requirements:\n"
        "1. Technical Questions (4 questions): Deep-dive into their core technologies, frameworks, language internals, and concepts mentioned in their skills.\n"
        "2. Project-Specific Questions (3 questions): Ask specific questions querying their architecture choices, design tradeoffs, and implementation details for the listed projects.\n"
        "3. Behavioral & Scenario Questions (3 questions): Situations testing conflict resolution, ownership, engineering failures, and design decisions targeting the STAR response structure.\n"
        "4. Adjust your tone, style, and question severity to match the selected persona:\n"
        "   - 'Standard Technical Interviewer': Professional, balanced, clear criteria.\n"
        "   - 'FAANG System Design Lead': High standards, focuses on scalability, architecture, trade-offs.\n"
        "   - 'Friendly Startup CTO': Dynamic, practical, focuses on quick shipping, culture, raw problem-solving.\n"
        "   - 'Strict Live-Coding Proctor': Low-chitchat, highly detailed syntax or logic focus.\n"
        "5. **10/10 Perfect Model Answer:** For EVERY single question, you MUST generate a `model_answer` field containing a world-class 10/10 perfect answer. For behavioral questions, format it strictly using the **STAR Framework** (`**Situation**: ... **Task**: ... **Action**: ... **Result**: ...`). For technical questions, provide a master-level technical explanation with exact concepts, tradeoffs, and best practices that would score 10/10.\n"
        "6. Output the result in valid JSON matching the requested schema."
    )

    try:
        questions_json = await call_llm_self_healing(prompt, QUESTIONS_SCHEMA)
        return questions_json
    except Exception as e:
        logger.error(f"Failed to generate questions: {e}")
        # Return fallback questions (10 questions with 10/10 Model Answers)
        return {
            "questions": [
                {
                    "question_text": "Can you walk me through one of your technical projects and explain your architecture decisions?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Overview & Architecture**: In building my core full-stack application, I separated concerns cleanly between a responsive React frontend and a scalable FastAPI Python backend connected to a relational database.\n\n**Key Tradeoffs & Decisions**:\n1. **State & Performance**: Chose React with memoization for instant UI responsiveness without full re-renders.\n2. **API & Concurrency**: Leveraged FastAPI for asynchronous non-blocking request handling (`async/await`) and automatic Pydantic validation, achieving sub-100ms response times.\n3. **Database Indexing & Persistence**: Modeled relational entities with strict foreign keys and indexed high-query columns, ensuring zero deadlock bottlenecks during peak load."
                },
                {
                    "question_text": "Describe a difficult technical bug you solved. What was your process?",
                    "question_type": "behavioral",
                    "difficulty": difficulty,
                    "model_answer": "**Situation**: During production deployment of our AI pipeline, API requests began randomly dropping with 504 Gateway Timeouts under high load.\n\n**Task**: My objective was to isolate the root cause, restore 99.9% uptime immediately, and implement preventative monitoring.\n\n**Action**: I checked server logs and noticed thread pool exhaustion. Using `cProfile` and distributed tracing, I traced the bottleneck to blocking synchronous HTTP requests inside an asynchronous event loop. I refactored the I/O layer to use `httpx.AsyncClient` with connection pooling and exponential backoff retries.\n\n**Result**: Latency dropped by 65%, timeouts dropped to 0%, and our service successfully handled a 4x traffic surge without incident."
                },
                {
                    "question_text": "Explain the time and space complexity of sorting a list of items using your favorite programming language.",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Language & Algorithm**: In Python, `list.sort()` and `sorted()` use **Timsort**, which is a hybrid sorting algorithm combining Merge Sort and Insertion Sort designed to perform exceptionally well on real-world data.\n\n**Time Complexity**:\n- **Best Case**: `O(N)` when the array is already mostly sorted or reverse-sorted (identifying existing runs).\n- **Average & Worst Case**: `O(N log N)` due to the merge step structure across optimal sub-runs.\n\n**Space Complexity**: `O(N)` worst-case auxiliary space for merge operations, though in practice Timsort minimizes memory overhead by sorting in-place for existing runs."
                },
                {
                    "question_text": "What is the purpose of database indexes, and how do they work under the hood?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Purpose**: Database indexes dramatically reduce disk I/O and query lookup times from linear `O(N)` full table scans to logarithmic `O(log N)` search times.\n\n**Under the Hood (B+ Tree Architecture)**:\n1. **Data Structure**: Most relational databases (PostgreSQL, MySQL) use **B+ Trees**. Internal nodes store routing keys, while leaf nodes store pointers to actual data rows (or clustered data directly) linked sequentially for ultra-fast range queries (`WHERE age BETWEEN 20 AND 30`).\n2. **Hash Indexes**: Used for exact equality lookups (`WHERE id = 5`), achieving `O(1)` time.\n3. **Tradeoffs**: While indexes speed up `SELECT` queries significantly, they incur additional storage space (`O(N)`) and slightly slow down write operations (`INSERT`, `UPDATE`, `DELETE`) because the B+ tree must rebalance."
                },
                {
                    "question_text": "How do you handle disagreement with a colleague on technical design or implementation details?",
                    "question_type": "behavioral",
                    "difficulty": difficulty,
                    "model_answer": "**Situation**: A senior teammate and I disagreed on whether to use a NoSQL document store (MongoDB) or SQL relational database (PostgreSQL) for our new user analytics feature.\n\n**Task**: I needed to reach a consensus focused purely on system requirements rather than personal preference.\n\n**Action**: I organized a 30-minute design sync and created an objective comparison matrix evaluating schema flexibility, ACID compliance requirements, query complexity, and long-term maintenance costs. I benchmarked our top 3 expected queries on prototype schemas for both databases.\n\n**Result**: The benchmarks proved PostgreSQL's JSONB column provided the exact document flexibility we needed while preserving relational joins and transactional integrity. My colleague agreed immediately, and our design shipped two days ahead of schedule."
                },
                {
                    "question_text": "In your projects, how did you handle user authentication and authorization?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Authentication vs Authorization**:\n- **Authentication (Who you are)**: Implemented stateless **JWT (JSON Web Tokens)** via OAuth2 / password hashing (`bcrypt` with salt rounds >= 12).\n- **Authorization (What you can access)**: Implemented **Role-Based Access Control (RBAC)** checking scopes (`admin`, `candidate`, `recruiter`) at the API middleware level.\n\n**Security Best Practices Implemented**:\n1. **Token Storage**: Stored access tokens in memory or `HttpOnly`, `Secure`, `SameSite=Strict` cookies to completely eliminate Cross-Site Scripting (XSS) vulnerability risks.\n2. **Rotation**: Used short-lived access tokens (15 minutes) combined with securely stored refresh tokens in the database with automatic revocation on logout."
                },
                {
                    "question_text": "Can you explain the difference between relational databases and NoSQL databases?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Core Differences & Tradeoffs**:\n1. **Structure & Schema**: Relational databases (SQL like PostgreSQL/MySQL) enforce strict, normalized tabular schemas with strong relationship integrity via foreign keys. NoSQL databases (MongoDB, Cassandra, Redis) offer flexible, schema-less structures such as JSON documents, key-value pairs, wide-column, or graphs.\n2. **ACID vs BASE**: SQL prioritizes **ACID** properties (Atomicity, Consistency, Isolation, Durability) guaranteeing strong transactional consistency. NoSQL typically favors **BASE** (Basically Available, Soft state, Eventual consistency) prioritizing horizontal scale and speed.\n3. **Scaling Strategy**: SQL scales **vertically** (adding CPU/RAM to a single master server) or via read-replicas. NoSQL is natively designed to scale **horizontally** via auto-sharding across commodity clusters."
                },
                {
                    "question_text": "Tell me about a time you had to meet a tight deadline. How did you prioritize your work?",
                    "question_type": "behavioral",
                    "difficulty": difficulty,
                    "model_answer": "**Situation**: Two weeks before our university/company hackathon showcase, our primary data integration provider deprecated their V1 API, breaking our core feature.\n\n**Task**: I had to re-architect our data ingestion pipeline in just 4 days without sacrificing core functionality or stability.\n\n**Action**: I applied the **Eisenhower Matrix** to ruthlessly triage tasks into Critical vs Nice-to-Have. I deprioritized complex visual analytics widgets and focused 100% of engineering bandwidth on building a modular adapter wrapper around the new API V2. I wrote unit tests for the core parser to prevent regression while coding rapidly.\n\n**Result**: We deployed the updated adapter with 12 hours to spare, zero bugs during the live demo, and secured 1st place in the system architecture category."
                },
                {
                    "question_text": "What strategies do you use to ensure your web applications are secure against common vulnerabilities?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Defense-in-Depth against OWASP Top 10**:\n1. **SQL Injection (SQLi)**: Never concatenate user input directly into SQL strings. Always use parameterized queries or Object-Relational Mappers (ORMs like SQLAlchemy) to treat inputs strictly as data values.\n2. **Cross-Site Scripting (XSS)**: Sanitize and auto-escape all dynamic content rendered in the DOM. Use `HttpOnly` cookies for sensitive tokens so JavaScript cannot access them via `document.cookie`.\n3. **Cross-Site Request Forgery (CSRF)**: Implement unique CSRF tokens and configure `SameSite=Strict` on authentication cookies.\n4. **Rate Limiting & Input Validation**: Enforce strict schema validation on the backend using Pydantic, and apply rate-limiting (`429 Too Many Requests`) to prevent brute-force and DDoS attacks."
                },
                {
                    "question_text": "How do you test your code to ensure reliability before deploying it to production?",
                    "question_type": "technical",
                    "difficulty": difficulty,
                    "model_answer": "**Testing Pyramid Strategy**:\n1. **Unit Tests (70%)**: Fast, isolated tests targeting individual functions and utility modules (using `pytest` or `Jest`) with mocks for external network calls to achieve >85% code coverage.\n2. **Integration Tests (20%)**: Testing data flows across components, such as API endpoints interacting with a test database container (`TestClient` in FastAPI).\n3. **End-to-End (E2E) Tests (10%)**: Automated user-journey simulations using Cypress or Playwright running in headless browser environments.\n4. **CI/CD Pipeline Enforcement**: Automated GitHub Actions workflow that blocks merge PRs if any linter (`flake8`/`ESLint`), type check (`mypy`/`tsc`), or test fails."
                }
            ]
        }
