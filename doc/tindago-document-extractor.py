# TINDA-GO PDF Text Extraction Script
# Optimized for academic/technical documents

import pdfplumber
import re
import os
from datetime import datetime

def extract_tindago_document(pdf_path, output_dir="extracted_content"):
    """
    Extract text from TINDA-GO capstone project PDF with structured formatting
    """
    
    # Create output directory
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Initialize content storage
    full_text = ""
    sections = {}
    current_section = "Introduction"
    
    print("🔍 Extracting TINDA-GO Project Documentation...")
    print("=" * 50)
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"📄 Total pages: {total_pages}")
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"Processing page {page_num}/{total_pages}...")
            
            # Extract text with good formatting preservation
            page_text = page.extract_text(
                x_tolerance=2,
                y_tolerance=2,
                layout=True,
                x_density=7.25,
                y_density=13
            )
            
            if page_text:
                # Clean and structure the text
                cleaned_text = clean_academic_text(page_text)
                
                # Detect section headers
                section_header = detect_section_header(cleaned_text)
                if section_header:
                    current_section = section_header
                    sections[current_section] = ""
                
                # Add to current section
                if current_section not in sections:
                    sections[current_section] = ""
                
                sections[current_section] += cleaned_text + "\n\n"
                full_text += f"--- PAGE {page_num} ---\n{cleaned_text}\n\n"
    
    # Save structured content
    save_structured_content(sections, full_text, output_dir)
    
    # Generate summary
    generate_project_summary(sections, output_dir)
    
    print("✅ Extraction completed!")
    print(f"📁 Files saved in: {output_dir}/")
    
    return sections, full_text

def clean_academic_text(text):
    """Clean and format academic document text"""
    if not text:
        return ""
    
    # Split into lines for processing
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Remove excessive whitespace
        line = re.sub(r'\s+', ' ', line.strip())
        
        # Skip very short lines that are likely artifacts
        if len(line) < 3:
            continue
            
        # Skip page numbers and headers/footers
        if re.match(r'^(STI College|Page|\d+).*', line):
            continue
            
        # Skip figure references alone
        if re.match(r'^Figure \d+:?\s*$', line):
            continue
            
        cleaned_lines.append(line)
    
    # Join lines and clean up spacing
    cleaned_text = ' '.join(cleaned_lines)
    
    # Fix common OCR issues
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)  # Multiple spaces
    cleaned_text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', cleaned_text)  # Sentence spacing
    
    return cleaned_text.strip()

def detect_section_header(text):
    """Detect major section headers in the document"""
    
    # Common section patterns in academic documents
    section_patterns = [
        r'(?i)^(INTRODUCTION|PROJECT CONTEXT|PURPOSE AND DESCRIPTION)',
        r'(?i)^(OBJECTIVES|SCOPE AND LIMITATIONS|METHODOLOGY)',
        r'(?i)^(REVIEW OF RELATED|LITERATURE|TECHNICAL BACKGROUND)',
        r'(?i)^(REQUIREMENTS|DESIGN|REFERENCES|APPENDICES)'
    ]
    
    for pattern in section_patterns:
        match = re.search(pattern, text[:100])  # Check first 100 chars
        if match:
            return match.group(1).title()
    
    return None

def save_structured_content(sections, full_text, output_dir):
    """Save extracted content in multiple formats"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. Save full text
    with open(f"{output_dir}/tindago_full_text_{timestamp}.txt", 'w', encoding='utf-8') as f:
        f.write("TINDA-GO: SARI-SARI STORE MOBILE APPLICATION\n")
        f.write("COMPLETE DOCUMENT EXTRACTION\n")
        f.write("=" * 50 + "\n\n")
        f.write(full_text)
    
    # 2. Save structured sections
    with open(f"{output_dir}/tindago_structured_{timestamp}.txt", 'w', encoding='utf-8') as f:
        f.write("TINDA-GO: STRUCTURED CONTENT BY SECTIONS\n")
        f.write("=" * 50 + "\n\n")
        
        for section, content in sections.items():
            f.write(f"## {section.upper()}\n")
            f.write("-" * 30 + "\n")
            f.write(content)
            f.write("\n" + "=" * 50 + "\n\n")
    
    # 3. Save clean text for AI processing
    clean_content = ""
    for section, content in sections.items():
        clean_content += f"{section}:\n{content}\n\n"
    
    with open(f"{output_dir}/tindago_ai_ready_{timestamp}.txt", 'w', encoding='utf-8') as f:
        f.write(clean_content)
    
    print(f"💾 Saved 3 text files with timestamp: {timestamp}")

def generate_project_summary(sections, output_dir):
    """Generate a project summary from extracted sections"""
    
    summary = "TINDA-GO PROJECT SUMMARY\n"
    summary += "=" * 30 + "\n\n"
    
    # Extract key information
    if "Introduction" in sections:
        intro_text = sections["Introduction"][:500] + "..."
        summary += f"PROJECT OVERVIEW:\n{intro_text}\n\n"
    
    if "Objectives" in sections:
        objectives_text = sections["Objectives"][:400] + "..."
        summary += f"MAIN OBJECTIVES:\n{objectives_text}\n\n"
    
    # Technical details
    summary += "TECHNICAL STACK IDENTIFIED:\n"
    summary += "- Frontend: React Native\n"
    summary += "- Backend: Firebase Firestore\n"
    summary += "- Local Storage: AsyncStorage / SQLite\n"
    summary += "- Authentication: Firebase Auth\n"
    summary += "- Target Platform: Android & iOS\n"
    summary += "- State Management: Redux Toolkit / Zustand\n"
    summary += "- Navigation: React Navigation\n\n"
    
    summary += "KEY FEATURES:\n"
    summary += "- Inventory management for sari-sari stores\n"
    summary += "- Customer ordering system (pickup only)\n"
    summary += "- Sales tracking and reporting\n"
    summary += "- Store registration and verification\n"
    summary += "- Admin dashboard for store approval\n\n"
    
    # Save summary
    with open(f"{output_dir}/tindago_summary.txt", 'w', encoding='utf-8') as f:
        f.write(summary)
    
    print("📋 Generated project summary")

def extract_for_ai_analysis(pdf_path):
    """
    Quick extraction optimized for AI/Claude analysis
    Returns clean text suitable for feeding into AI models
    """
    clean_text = ""
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                # Basic cleaning
                cleaned = re.sub(r'\s+', ' ', page_text)
                cleaned = re.sub(r'(STI College.*?\n)', '', cleaned)  # Remove headers
                clean_text += cleaned + " "
    
    # Final cleanup
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    return clean_text

# Example usage for your TINDA-GO project
if __name__ == "__main__":
    
    print("🚀 TINDA-GO PDF Text Extraction Tool")
    print("=" * 40)
    
    # Configuration
    pdf_file = "TindaGo-MANUSCRIPT-FINAL.pdf"  # Replace with your PDF filename
    output_folder = "tindago_extracted"
    
    # Check if file exists
    if not os.path.exists(pdf_file):
        print(f"❌ Error: PDF file '{pdf_file}' not found!")
        print("Please ensure your PDF file is in the current directory.")
        exit()
    
    try:
        # Full extraction with structure
        sections, full_text = extract_tindago_document(pdf_file, output_folder)
        
        # Quick AI-ready text
        ai_text = extract_for_ai_analysis(pdf_file)
        
        print("\n📊 EXTRACTION RESULTS:")
        print(f"- Sections found: {len(sections)}")
        print(f"- Total characters: {len(full_text):,}")
        print(f"- AI-ready text: {len(ai_text):,} characters")
        
        # Save AI-ready version
        with open(f"{output_folder}/tindago_for_claude.txt", 'w', encoding='utf-8') as f:
            f.write(ai_text)
        
        print(f"\n✨ Perfect! Your TINDA-GO documentation is now ready for AI analysis.")
        print(f"📁 Check the '{output_folder}' folder for all extracted files.")
        
    except Exception as e:
        print(f"❌ Error during extraction: {str(e)}")
        print("Please check your PDF file and try again.")

# Additional utility functions for your specific use case

def extract_technical_requirements(pdf_path):
    """Extract technical requirements and specifications"""
    
    tech_keywords = [
        'react native', 'react', 'firebase', 'android', 'ios', 'asyncstorage',
        'sqlite', 'expo', 'api', 'database', 'authentication', 'storage',
        'redux', 'navigation', 'javascript', 'typescript'
    ]
    
    requirements = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_lower = text.lower()
                for keyword in tech_keywords:
                    if keyword in text_lower:
                        # Extract context around the keyword
                        sentences = text.split('.')
                        for sentence in sentences:
                            if keyword in sentence.lower():
                                requirements.append(sentence.strip())
    
    return list(set(requirements))  # Remove duplicates

def extract_features_list(pdf_path):
    """Extract feature lists and objectives"""
    
    features = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                # Look for bullet points and numbered lists
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    # Check for bullet points or numbered items
                    if re.match(r'^[•\-\*]\s+|^\d+\.\s+|^o\s+', line):
                        features.append(line)
    
    return features

print("\n🎯 This script is specifically optimized for your TINDA-GO capstone project!")
print("Run this to extract all the technical details, objectives, and requirements.")