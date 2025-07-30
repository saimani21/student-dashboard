import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface StudentData {
  student_info: {
    roll_number: string;
    cgpa: number | null;
    total_backlogs: number;
    leetcode_url: string;
    hackerrank_url: string;
  };
  leetcode: {
    success: boolean;
    data?: {
      totalSolved: number | null;
      easySolved: number | null;
      mediumSolved: number | null;
      hardSolved: number | null;
      acceptanceRate: number | null;
      ranking: number | null;
    };
    error?: string;
  };
  hackerrank: {
    success: boolean;
    data?: {
      badges: Array<{
        'Badge Name': string;
        'Stars': number;
      }>;
      total_badges: number;
      total_stars: number;
      badge_image_url: string;
    };
    error?: string;
  };
  timestamp: string;
}

export interface StudentsListResponse {
  students: Array<{
    roll_number: string;
    cgpa: number | null;
    total_backlogs: number;
    has_leetcode: boolean;
    has_hackerrank: boolean;
  }>;
  total: number;
}

export const fetchStudentData = async (roll: string): Promise<StudentData> => {
  const response = await api.get(`/api/student/${roll}`);
  return response.data;
};

export const fetchAllStudents = async (): Promise<StudentsListResponse> => {
  const response = await api.get('/api/students');
  return response.data;
};

export const fetchBulkData = async () => {
  const response = await api.get('/api/badges/bulk-download');
  return response.data;
};

export const downloadBulkCSV = async () => {
  const response = await api.get('/api/badges/bulk-download-csv', {
    responseType: 'blob'
  });
  return response.data;
};

export default api;
