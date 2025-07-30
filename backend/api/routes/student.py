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
    """Convert NaN or infinite floats to None for JSON serialization."""
    if value is None:
        return None
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
    return value

def safe_int(value):
    """Convert invalid integers to 0."""
    if pd.isna(value):
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0

def load_student_data():
    """Load student data from CSV file with proper error handling."""
    csv_path = os.path.join(os.path.dirname(__file__), '../../data/III_DS-Student_Profiles.csv')
    try:
        df = pd.read_csv(csv_path)
        df.columns = df.columns.str.strip()
        
        # Clean numeric columns to prevent NaN issues
        if 'CGPA' in df.columns:
            df['CGPA'] = pd.to_numeric(df['CGPA'], errors='coerce').fillna(0.0)
        if 'Total Backlogs' in df.columns:
            df['Total Backlogs'] = pd.to_numeric(df['Total Backlogs'], errors='coerce').fillna(0)
            
        return df
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Student data file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading student data: {str(e)}")

def fetch_leetcode_stats(username):
    """Fetch LeetCode statistics with safe float handling."""
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
    """Fetch HackerRank badges by parsing SVG structure."""
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
        seen = set()
        
        for text in all_texts:
            text_lower = text.lower()
            for keyword in badge_keywords:
                if keyword in text_lower:
                    text_title = text.strip().title()
                    if text_title not in VALID_HACKERRANK_BADGES or text_title in seen:
                        continue
                    
                    seen.add(text_title)
                    stars = 0
                    
                    # Simple star counting logic
                    if star_sections:
                        total_star_elements = soup.find_all('svg', class_='badge-star')
                        total_badges = len([t for t in all_texts if any(kw in t.lower() for kw in badge_keywords)])
                        if total_badges > 0:
                            stars = len(total_star_elements) // total_badges
                    
                    real_badges.append({
                        'Badge Name': text_title,
                        'Stars': max(0, min(5, stars))  # Ensure stars are between 0-5
                    })
                    break
        
        return real_badges if real_badges else None
            
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
        
        # Sanitize all numeric values
        student_info = {
            'roll_number': str(data['Roll Number']),
            'cgpa': safe_float(float(data['CGPA'])) if pd.notna(data['CGPA']) else None,
            'total_backlogs': safe_int(data['Total Backlogs']),
            'leetcode_url': str(data.get('Leet code links', '')),
            'hackerrank_url': str(data.get('Hackerrank profile link', ''))
        }
        
        # Fetch LeetCode data
        leetcode_data = {'success': False}
        if pd.notna(student_info['leetcode_url']) and 'leetcode.com' in student_info['leetcode_url']:
            username = student_info['leetcode_url'].rstrip('/').split('/')[-1]
            if username not in ['profile', 'account', 'login', '']:
                leetcode_data = fetch_leetcode_stats(username)
        
        # Fetch HackerRank data
        hackerrank_data = {'success': False}
        if pd.notna(student_info['hackerrank_url']) and 'hackerrank.com' in student_info['hackerrank_url']:
            username = student_info['hackerrank_url'].rstrip('/').split('/')[-1]
            badges = fetch_hackerrank_badges_svg(username)
            if badges:
                # Ensure all badge data is safe for JSON serialization
                for badge in badges:
                    badge['Stars'] = safe_int(badge.get('Stars', 0))
                
                hackerrank_data = {
                    'success': True,
                    'data': {
                        'badges': badges,
                        'total_badges': len(badges),
                        'total_stars': sum(badge['Stars'] for badge in badges),
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
    """Get basic info for all students with safe numeric handling"""
    try:
        df = load_student_data()
        students = []
        for _, row in df.iterrows():
            students.append({
                'roll_number': str(row['Roll Number']),
                'cgpa': safe_float(float(row['CGPA'])) if pd.notna(row['CGPA']) else None,
                'total_backlogs': safe_int(row['Total Backlogs']),
                'has_leetcode': pd.notna(row.get('Leet code links', '')) and str(row.get('Leet code links', '')) != '' and 'leetcode.com' in str(row.get('Leet code links', '')),
                'has_hackerrank': pd.notna(row.get('Hackerrank profile link', '')) and str(row.get('Hackerrank profile link', '')) != '' and 'hackerrank.com' in str(row.get('Hackerrank profile link', ''))
            })
        return {'students': students, 'total': len(students)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
