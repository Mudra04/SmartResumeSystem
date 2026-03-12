import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required data (only first time)
nltk.download('punkt')
nltk.download('stopwords')


# ================= TEXT CLEANING =================
def preprocess(text):
    text = text.lower()
    tokens = word_tokenize(text)

    tokens = [word for word in tokens if word.isalpha()]
    tokens = [word for word in tokens if word not in stopwords.words('english')]

    return " ".join(tokens)


# ================= SKILL DATABASE =================
skills_list = [
    "python",
    "machine learning",
    "sql",
    "excel",
    "java",
    "c++",
    "data analysis",
    "deep learning",
    "tableau",
    "power bi",
    "statistics",
    "nlp",
    "cloud computing"
]


# ================= SKILL EXTRACTION =================
def extract_skills(text):
    found = []
    text = text.lower()

    for skill in skills_list:
        if skill in text:
            found.append(skill)

    return list(set(found))


# ================= EXPERIENCE EXTRACTION =================
def extract_experience(text):
    lines = text.split('\n')
    exp = [l for l in lines if "intern" in l.lower() or "experience" in l.lower() or "company" in l.lower()]
    return exp


# ================= PROJECT EXTRACTION =================
def extract_projects(text):
    lines = text.split('\n')
    projects = [l for l in lines if "project" in l.lower() or "developed" in l.lower() or "built" in l.lower()]
    return projects


# ================= HIGH VALUE SKILLS =================
high_value_skills_db = [
    "machine learning",
    "deep learning",
    "ai",
    "data science",
    "cloud computing",
    "nlp"
]

def extract_high_value_skills(skills):
    return [skill for skill in skills if skill in high_value_skills_db]


# ================= WEAK POINT ANALYSIS =================
def detect_weak_points(skills):
    weak = []

    if "sql" not in skills:
        weak.append("Database Handling")
    if "excel" not in skills:
        weak.append("Reporting & Dashboards")
    if "machine learning" not in skills:
        weak.append("Advanced Analytics")
    if "statistics" not in skills:
        weak.append("Statistical Analysis")

    return weak


# ================= TESTING =================
if __name__ == "__main__":
    
    sample = """
    Data Analyst Intern at ABC Company
    Worked on data analysis and machine learning projects.
    Built a prediction system using Python and SQL.
    Experience with Excel dashboards and Tableau reports.
    """

    cleaned = preprocess(sample)
    skills = extract_skills(sample)
    experience = extract_experience(sample)
    projects = extract_projects(sample)
    high_value = extract_high_value_skills(skills)
    weak_points = detect_weak_points(skills)

    print("===== Cleaned Text =====\n")
    print(cleaned)

    print("\n===== Technical Skills =====\n")
    print(skills)

    print("\n===== Work Experience =====\n")
    print(experience)

    print("\n===== Projects =====\n")
    print(projects)

    print("\n===== High Value Skills =====\n")
    print(high_value)

    print("\n===== Weak Points =====\n")
    print(weak_points)
