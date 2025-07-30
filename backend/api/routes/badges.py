from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import pandas as pd
from datetime import datetime
import time
from .student import load_student_data, fetch_leetcode_stats, fetch_hackerrank_badges_svg, safe_float, safe_int

router = APIRouter()

@router.get("/badges/bulk-download")
async def bulk_download():
    """Generate bulk download data for all students"""
    try:
        df = load_student_data()
        enhanced_df = df.copy()
        
        # Add new columns for enhanced data
        enhanced_df['LeetCode_Total_Solved'] = ''
        enhanced_df['LeetCode_Easy_Solved'] = ''
        enhanced_df['LeetCode_Medium_Solved'] = ''
        enhanced_df['LeetCode_Hard_Solved'] = ''
        enhanced_df['LeetCode_Status'] = ''
        enhanced_df['HackerRank_Total_Badges'] = ''
        enhanced_df['HackerRank_Total_Stars'] = ''
        enhanced_df['HackerRank_Badge_Details'] = ''
        enhanced_df['HackerRank_Status'] = ''
        enhanced_df['Data_Fetch_Timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        total_students = len(enhanced_df)
        
        for idx, row in enhanced_df.iterrows():
            # Fetch LeetCode data
            leetcode_url = row.get('Leet code links')
            if pd.notna(leetcode_url) and leetcode_url != '' and 'leetcode.com' in str(leetcode_url):
                try:
                    username = str(leetcode_url).rstrip('/').split('/')[-1]
                    if username not in ['profile', 'account', 'login', '']:
                        leetcode_data = fetch_leetcode_stats(username)
                        if leetcode_data['success']:
                            stats = leetcode_data['data']
                            enhanced_df.at[idx, 'LeetCode_Total_Solved'] = safe_float(stats.get('totalSolved', 0)) or 0
                            enhanced_df.at[idx, 'LeetCode_Easy_Solved'] = safe_float(stats.get('easySolved', 0)) or 0
                            enhanced_df.at[idx, 'LeetCode_Medium_Solved'] = safe_float(stats.get('mediumSolved', 0)) or 0
                            enhanced_df.at[idx, 'LeetCode_Hard_Solved'] = safe_float(stats.get('hardSolved', 0)) or 0
                            enhanced_df.at[idx, 'LeetCode_Status'] = 'Success'
                        else:
                            enhanced_df.at[idx, 'LeetCode_Status'] = 'Failed'
                except Exception:
                    enhanced_df.at[idx, 'LeetCode_Status'] = 'Error'
            else:
                enhanced_df.at[idx, 'LeetCode_Status'] = 'No URL'
            
            # Fetch HackerRank data
            hackerrank_url = row.get('Hackerrank profile link')
            if pd.notna(hackerrank_url) and hackerrank_url != '' and 'hackerrank.com' in str(hackerrank_url):
                try:
                    username = str(hackerrank_url).rstrip('/').split('/')[-1]
                    badges = fetch_hackerrank_badges_svg(username)
                    
                    if badges:
                        # Sanitize badge data
                        for badge in badges:
                            badge['Stars'] = safe_int(badge.get('Stars', 0))
                        
                        total_badges = len(badges)
                        total_stars = sum(badge['Stars'] for badge in badges)
                        badge_summary = "; ".join([f"{badge['Badge Name']}({badge['Stars']}★)" for badge in badges])
                        
                        enhanced_df.at[idx, 'HackerRank_Total_Badges'] = total_badges
                        enhanced_df.at[idx, 'HackerRank_Total_Stars'] = total_stars
                        enhanced_df.at[idx, 'HackerRank_Badge_Details'] = badge_summary
                        enhanced_df.at[idx, 'HackerRank_Status'] = 'Success'
                    else:
                        enhanced_df.at[idx, 'HackerRank_Status'] = 'No Badges Found'
                except Exception:
                    enhanced_df.at[idx, 'HackerRank_Status'] = 'Error'
            else:
                enhanced_df.at[idx, 'HackerRank_Status'] = 'No URL'
            
            # Add delay to avoid overwhelming servers
            time.sleep(0.2)
        
        # Convert to CSV
        csv_data = enhanced_df.to_csv(index=False)
        
        # Calculate stats with safe handling
        try:
            leetcode_success = len(enhanced_df[enhanced_df['LeetCode_Status'] == 'Success'])
            hackerrank_success = len(enhanced_df[enhanced_df['HackerRank_Status'] == 'Success'])
            avg_cgpa = safe_float(enhanced_df['CGPA'].astype(float).mean()) or 0
            students_with_backlogs = len(enhanced_df[enhanced_df['Total Backlogs'].astype(float) > 0])
        except Exception:
            leetcode_success = hackerrank_success = students_with_backlogs = 0
            avg_cgpa = 0
        
        return {
            'success': True,
            'data': csv_data,
            'stats': {
                'total_students': total_students,
                'leetcode_success': leetcode_success,
                'hackerrank_success': hackerrank_success,
                'avg_cgpa': round(avg_cgpa, 2),
                'students_with_backlogs': students_with_backlogs
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/badges/bulk-download-csv")
async def bulk_download_csv():
    """Download CSV file directly"""
    try:
        bulk_data = await bulk_download()
        if bulk_data['success']:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            return Response(
                content=bulk_data['data'],
                media_type='text/csv',
                headers={
                    'Content-Disposition': f'attachment; filename="student_data_enhanced_{timestamp}.csv"'
                }
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to generate CSV data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
