from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re
import io

app = Flask(__name__)
CORS(app)

SKILLS_DB = [
    # Programming Languages
    "python", "javascript", "java", "c++", "c#", "typescript", "ruby", "go", "rust", "swift",
    "kotlin", "php", "scala", "r", "matlab", "perl", "dart", "elixir",
    # Web
    "react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi",
    "html", "css", "sass", "tailwind", "bootstrap", "next.js", "nuxt.js", "graphql", "rest api",
    # Data / ML / AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "nlp", "computer vision", "data analysis",
    "data visualization", "tableau", "power bi", "sql", "mongodb", "postgresql", "mysql",
    # Cloud / DevOps
    "aws", "azure", "google cloud", "docker", "kubernetes", "ci/cd", "jenkins", "github actions",
    "terraform", "ansible", "linux", "bash", "git", "github", "gitlab",
    # Other
    "agile", "scrum", "jira", "figma", "photoshop", "excel", "spark", "hadoop", "redis",
    "elasticsearch", "microservices", "api", "unit testing", "selenium", "cybersecurity"
]

SECTION_KEYWORDS = {
    "education": ["education", "degree", "university", "college", "bachelor", "master", "phd", "b.tech", "m.tech", "b.sc", "m.sc"],
    "experience": ["experience", "work history", "employment", "internship", "position", "role", "company", "organization"],
    "projects": ["projects", "portfolio", "case study", "built", "developed", "created", "implemented"],
    "skills": ["skills", "technologies", "tools", "expertise", "proficiencies", "competencies"],
}

IMPORTANT_SKILLS = ["python", "javascript", "sql", "machine learning", "react", "aws", "docker", "git"]


def extract_text_from_pdf(file_bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def detect_skills(text):
    text_lower = text.lower()
    found = [skill for skill in SKILLS_DB if skill in text_lower]
    missing = [s for s in IMPORTANT_SKILLS if s not in found]
    return found, missing


def check_sections(text):
    text_lower = text.lower()
    present = {}
    for section, keywords in SECTION_KEYWORDS.items():
        present[section] = any(kw in text_lower for kw in keywords)
    return present


def check_quantified_achievements(text):
    patterns = [
        r'\d+\s*%',
        r'\$\s*\d+',
        r'\d+\+?\s*(users|clients|customers|projects|teams|members|employees)',
        r'increased|decreased|improved|reduced|optimized|boosted|grew',
        r'\d+x\s',
    ]
    matches = []
    for pattern in patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        matches.extend(found)
    return list(set(matches))


def check_repetition(text):
    words = re.findall(r'\b\w{4,}\b', text.lower())
    word_counts = {}
    for word in words:
        word_counts[word] = word_counts.get(word, 0) + 1
    repeated = {w: c for w, c in word_counts.items() if c > 5 and w not in [
        "with", "have", "that", "this", "from", "your", "been", "will", "they", "their",
        "were", "also", "into", "work", "team", "used", "data", "using", "based"
    ]}
    return list(repeated.keys())[:5]


def calculate_score(sections, skills_found, achievements, repetitions):
    score = 0

    # Sections (40 pts)
    section_scores = {"education": 10, "experience": 15, "projects": 10, "skills": 5}
    for section, present in sections.items():
        if present:
            score += section_scores.get(section, 5)

    # Skills (30 pts)
    skills_score = min(30, len(skills_found) * 2)
    score += skills_score

    # Achievements (20 pts)
    achievements_score = min(20, len(achievements) * 4)
    score += achievements_score

    # Repetition penalty (up to -10)
    score -= min(10, len(repetitions) * 2)

    return max(0, min(100, score))


def generate_suggestions(sections, skills_found, missing_skills, achievements, repetitions, score):
    suggestions = []

    if not sections.get("experience"):
        suggestions.append("Add a dedicated Work Experience section with job titles, companies, and dates.")
    if not sections.get("projects"):
        suggestions.append("Add a Projects section — even personal or academic projects demonstrate initiative.")
    if not sections.get("education"):
        suggestions.append("Include an Education section with your degree, institution, and graduation year.")
    if len(achievements) < 2:
        suggestions.append("Quantify your achievements — use numbers, percentages, or metrics (e.g., 'Improved performance by 30%').")
    if missing_skills:
        suggestions.append(f"Consider adding in-demand skills: {', '.join(missing_skills[:4])}.")
    if len(skills_found) < 8:
        suggestions.append("Expand your Skills section — include more tools, frameworks, and technologies you've used.")
    if repetitions:
        suggestions.append(f"Reduce repetitive words: {', '.join(repetitions)}. Vary your language to show range.")
    if score < 50:
        suggestions.append("Your resume needs significant improvement. Focus on structure, skills, and measurable impact.")
    elif score < 75:
        suggestions.append("Your resume is decent but can be improved. Add more detail and quantified results.")
    else:
        suggestions.append("Great resume! Fine-tune language and tailor it for each specific job application.")

    return suggestions


@app.route("/analyze_resume", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        file_bytes = file.read()
        text = extract_text_from_pdf(file_bytes)

        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF. Make sure it's not a scanned image."}), 400

        skills_found, missing_skills = detect_skills(text)
        sections = check_sections(text)
        achievements = check_quantified_achievements(text)
        repetitions = check_repetition(text)
        score = calculate_score(sections, skills_found, achievements, repetitions)
        suggestions = generate_suggestions(sections, skills_found, missing_skills, achievements, repetitions, score)

        return jsonify({
            "score": score,
            "skills_found": skills_found,
            "missing_skills": missing_skills,
            "sections": sections,
            "achievements": achievements[:8],
            "repetitions": repetitions,
            "suggestions": suggestions,
            "word_count": len(text.split())
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Smart Resume Analyzer API is running!"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)