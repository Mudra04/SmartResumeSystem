import PyPDF2

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text
    
    return text

# TESTING
if __name__ == "__main__":
    with open("dataset/candidate_056.pdf", "rb") as f:
        text = extract_text_from_pdf(f)
        print("===== Extracted Resume Text =====\n")
        print(text)