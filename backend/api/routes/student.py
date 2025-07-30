from fastapi import APIRouter, HTTPException
import pandas as pd
import requests
from datetime import datetime
import os
from bs4 import BeautifulSoup
import re
import math

router = APIRouter()

def safe_float(value):
    """Return None if value is NaN, infinite, or None; else return the float."""
    if value is None:
        return None
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
    return value

def load_student_data():
    """Load student data from CSV file in backend/data directory."""
    csv_path = os.path.join(os.path.dirname(__file__), '../../data/III_DS-Student_Profiles.csv')
    try:
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.strip()
        return df
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Student data file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading student data: {str(e)}")

def fetch_leetcode_stats(username):
    """Fetch LeetCode user stats from API with safe float values."""
    try:
        stats_api_url = f"https://leetcode-stats-api.herokuapp.com/{username}"
        response = requests.get(stats_api_url, timeout=10)
        if response.status_code == 200:
            stats = response.json()
            return {
                'success': True,
                'data': {
                    'totalSolved': safe_float(stats.get('totalSolved', 0)),
                    'easySolved': safe_float(stats.get('easySolved', 0)),
                    'mediumSolved': safe_float(stats.get('mediumSolved', 0)),
                    'hardSolved': safe_float(stats.get('hardSolved', 0)),
                    'acceptanceRate': safe_float(stats.get('acceptanceRate', 0)),
                    'ranking': safe_float(stats.get('ranking', 0))
                }
            }
        else:
            return {'success': False, 'error': f'API returned status code {response.status_code}'}
    except requests.exceptions.RequestException as e:
        return {'success': False, 'error': f'Network error: {str(e)}'}
    except Exception as e:
        return {'success': False, 'error': f'Unexpected error: {str(e)}'}

def fetch_hackerrank_badges_svg(username):
    """Fetch HackerRank badges by parsing SVG badge structure; returns badges with stars."""
    VALID_HACKERRANK_BADGES = {
        'Problem Solving', 'Java', 'Python', 'C Language', 'Cpp', 'C#', 'JavaScript',
        'Sql', '30 Days of Code', '10 Days of JavaScript', '10 Days of Statistics',
        'Algorithms', 'Data Structures', 'Regex', 'Artificial Intelligence',
        'Databases', 'Shell', 'Linux Shell', 'Functional Programming',
        'Mathematics', 'Days of ML', 'Rust', 'Kotlin', 'Swift', 'Scala',
        'Ruby', 'Go', 'Statistics', 'Interview Preparation Kit',
        'Object Oriented Programming', 'Security'
    }
    
    try:
        badge_url = f'https://hackerrank-badges.vercel.app/{username}'
        response = requests.get(badge_url, timeout=15)
        
        if response.status_code != 200:
            return None
        
        svg_xml = response.text
        soup = BeautifulSoup(svg_xml, 'xml')
        text_elements = soup.find_all('text')
        star_sections = soup.find_all('g', class_='star-section')
        
        all_texts = [text.get_text().strip() for text in text_elements if text.get_text().strip() and len(text.get_text().strip()) > 1]
        
        badge_keywords = ['java', 'python', 'sql', 'javascript', 'cpp', 'problem solving', 
                          'algorithms', 'data structures', '30 days', '10 days', 'ruby', 
                          'swift', 'golang', 'rust', 'kotlin', 'scala', 'c', 'shell',
                          'functional programming', 'object oriented programming']
        
        real_badges = []
        
        for text in all_texts:
            text_lower = text.lower()
            for keyword in badge_keywords:
                if keyword in text_lower:
                    text_title = text.strip().title()
                    if text_title not in VALID_HACKERRANK_BADGES:
                        continue
                    
                    text_elem = next((elem for elem in text_elements if elem.get_text().strip().lower() == text_lower), None)
                    stars = 0
                    if text_elem:
                        current = text_elem
                        found_stars = False
                        for _ in range(5):
                            if current is None:
                                break
                            star_section = current.find('g', class_='star-section')
                            if star_section:
                                badge_star_elements = star_section.find_all('svg', class_='badge-star')
                                stars = len(badge_star_elements)
                                found_stars = True
                                break
                            if current.parent:
                                sibling_star_sections = current.parent.find_all('g', class_='star-section')
                                if sibling_star_sections:
                                    badge_star_elements = sibling_star_sections[0].find_all('svg', class_='badge-star')
                                    stars = len(badge_star_elements)
                                    found_stars = True
                                    break
                            current = current.parent
                        if not found_stars and star_sections:
                            # Try positional matching fallback
                            text_x = text_elem.get('x', '0')
                            text_y = text_elem.get('y', '0')
                            try:
                                text_x_num = float(text_x) if str(text_x).replace('.', '').replace('-', '').isdigit() else 0
                                text_y_num = float(text_y) if str(text_y).replace('.', '').replace('-', '').isdigit() else 0
                                closest_star_section = None
                                min_distance = float('inf')
                                for star_section in star_sections:
                                    transform = star_section.get('transform', '')
                                    if 'translate' in transform:
                                        translate_match = re.search(r'translate\(([^,]+),\s*([^)]+)\)', transform)
                                        if translate_match:
                                            try:
                                                star_x = float(translate_match.group(1))
                                                star_y = float(translate_match.group(2))
                                                distance = ((star_x - text_x_num) ** 2 + (star_y - text_y_num) ** 2) ** 0.5
                                                if distance < min_distance:
                                                    min_distance = distance
                                                    closest_star_section = star_section
                                            except:
                                                continue
                                if closest_star_section:
                                    badge_star_elements = closest_star_section.find_all('svg', class_='badge-star')
                                    stars = len(badge_star_elements)
                                    found_stars = True
                            except:
                                pass
                        if not found_stars and star_sections:
                            total_star_elements = soup.find_all('svg', class_='badge-star')
                            total_badges = len([t for t in all_texts if any(kw in t.lower() for kw in badge_keywords)])
                            if total_badges > 0:
                                stars = len(total_star_elements) // total_badges

                    real_badges.append({
                        'Badge Name': text.title(),
                        'Stars': stars
                    })
                    break
        
        # Remove duplicates by badge name
        seen = set()
        unique_badges = []
        for badge in real_badges:
            badge_key = badge['Badge Name'].lower()
            if badge_key not in seen:
                seen.add(badge_key)
                unique_badges.append(badge)
        
        return unique_badges if unique_badges else None

    except Exception:
        return None

@router.get("/student/{roll}")
async def get_student_data(roll: str):
    """Get comprehensive student data including LeetCode and HackerRank stats"""
    try:
        df = load_student_data()
        student = df[df['Roll Number'].str.upper() == roll.upper()]
        
        if student.empty:
            raise HTTPException(status_code=404, detail="Student not found")
        
        data = student.iloc[0]
        cgpa_val = data['CGPA']
        backlog_val = data['Total Backlogs']

        student_info = {
            'roll_number': data['Roll Number'],
            'cgpa': safe_float(float(cgpa_val)) if pd.notna(cgpa_val) else None,
            'total_backlogs': int(backlog_val) if pd.notna(backlog_val) else 0,
            'leetcode_url': data.get('Leet code links', ''),
            'hackerrank_url': data.get('Hackerrank profile link', '')
        }

        leetcode_data = {'success': False}
        if pd.notna(student_info['leetcode_url']) and 'leetcode.com' in str(student_info['leetcode_url']):
            username = str(student_info['leetcode_url']).rstrip('/').split('/')[-1]
            if username not in ['profile', 'account', 'login', '']:
                leetcode_data = fetch_leetcode_stats(username)

        hackerrank_data = {'success': False}
        if pd.notna(student_info['hackerrank_url']) and 'hackerrank.com' in str(student_info['hackerrank_url']):
            username = str(student_info['hackerrank_url']).rstrip('/').split('/')[-1]
            badges = fetch_hackerrank_badges_svg(username)
            if badges:
                # Ensure stars are ints and sanitize if necessary
                for b in badges:
                    stars = b.get('Stars')
                    b['Stars'] = stars if isinstance(stars, int) and stars >= 0 else 0
                hackerrank_data = {
                    'success': True,
                    'data': {
                        'badges': badges,
                        'total_badges': len(badges),
                        'total_stars': sum(b['Stars'] for b in badges),
                        'badge_image_url': f"https://hackerrank-badges.vercel.app/{username}"
                    }
                }

        return {
            'student_info': student_info,
            'leetcode': leetcode_data,
            'hackerrank': hackerrank_data,
            'timestamp': datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students")
async def get_all_students():
    """Get basic info for all students"""
    try:
        df = load_student_data()
        students = []
        for _, row in df.iterrows():
            cgpa_val = row['CGPA']
            backlog_val = row['Total Backlogs']
            students.append({
                'roll_number': row['Roll Number'],
                'cgpa': safe_float(float(cgpa_val)) if pd.notna(cgpa_val) else None,
                'total_backlogs': int(backlog_val) if pd.notna(backlog_val) else 0,
                'has_leetcode': pd.notna(row.get('Leet code links', '')) and row.get('Leet code links', '') != '',
                'has_hackerrank': pd.notna(row.get('Hackerrank profile link', '')) and row.get('Hackerrank profile link', '') != ''
            })
        return {'students': students, 'total': len(students)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
