import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchStudentData, StudentData } from '@/lib/api';
import BadgeCard from '@/components/BadgeCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertCircle, ExternalLink, RefreshCw, Trophy, Code, Target, TrendingUp } from 'lucide-react';

const StudentDetail: React.FC = () => {
  const router = useRouter();
  const { roll } = router.query;
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roll && typeof roll === 'string') {
      fetchData(roll);
    }
  }, [roll]);

  // Fixed: Replaced 'any' type with proper error handling
  const fetchData = async (rollNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentData(rollNumber);
      setStudentData(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Failed to fetch student data');
      } else {
        setError('Failed to fetch student data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (roll && typeof roll === 'string') {
      fetchData(roll);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading student data..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Student Data</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 btn btn-secondary text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-500">No student data available</p>
        </div>
      </div>
    );
  }

  const { student_info, leetcode, hackerrank } = studentData;

  // Fixed: Added null checking for CGPA
  const getCgpaStatus = (cgpa: number | null) => {
    if (!cgpa) return { text: 'No Data', color: 'text-gray-600', bg: 'bg-gray-50' };
    if (cgpa >= 9.0) return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (cgpa >= 8.0) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (cgpa >= 7.0) return { text: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const cgpaStatus = getCgpaStatus(student_info.cgpa);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Performance Analysis
          </h1>
          <p className="text-gray-600 mt-2">Roll Number: {student_info.roll_number}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${cgpaStatus.bg} ${cgpaStatus.color}`}>
              {cgpaStatus.text}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{student_info.cgpa || 'N/A'}</h3>
          <p className="text-sm text-gray-600">CGPA</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl ${student_info.total_backlogs > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}>
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${student_info.total_backlogs > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {student_info.total_backlogs === 0 ? 'Clear' : 'Pending'}
            </span>
          </div>
          <h3 className={`text-3xl font-bold ${student_info.total_backlogs > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {student_info.total_backlogs}
          </h3>
          <p className="text-sm text-gray-600">Backlogs</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Code className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${student_info.leetcode_url ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'}`}>
              {student_info.leetcode_url ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">LeetCode</h3>
          <p className="text-sm text-gray-600">Platform</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${student_info.hackerrank_url ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'}`}>
              {student_info.hackerrank_url ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">HackerRank</h3>
          <p className="text-sm text-gray-600">Platform</p>
        </div>
      </div>

      {/* LeetCode Section */}
      <div className="card">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <Code className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">LeetCode Performance</h2>
          </div>
          {student_info.leetcode_url && (
            <a
              href={student_info.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </a>
          )}
        </div>
        <div className="p-8">
          {leetcode.success ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-emerald-600">{leetcode.data?.totalSolved || 0}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Total Solved</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">{leetcode.data?.easySolved || 0}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Easy</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-600">{leetcode.data?.mediumSolved || 0}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Medium</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-red-600">{leetcode.data?.hardSolved || 0}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Hard</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">LeetCode data not available</p>
              {leetcode.error && (
                <p className="text-sm text-red-600 mb-4">Error: {leetcode.error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HackerRank Section */}
      <div className="card">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mr-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">HackerRank Achievements</h2>
          </div>
          {student_info.hackerrank_url && (
            <a
              href={student_info.hackerrank_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center text-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </a>
          )}
        </div>
        <div className="p-8">
          {hackerrank.success ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-purple-600">{hackerrank.data?.total_badges || 0}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Total Badges</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-yellow-600">{hackerrank.data?.total_stars || 0}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Total Stars</p>
                </div>
              </div>
              
              {hackerrank.data?.badge_image_url && (
                <div className="mb-8 text-center">
                  {/* Fixed: Added eslint-disable for img element warning */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hackerrank.data.badge_image_url}
                    alt="HackerRank Badges"
                    className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg"
                    style={{ height: 'auto' }}
                  />
                </div>
              )}

              {hackerrank.data?.badges && hackerrank.data.badges.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Badge Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hackerrank.data.badges.map((badge, index) => (
                      <BadgeCard key={index} badge={badge} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">HackerRank data not available</p>
              {hackerrank.error && (
                <p className="text-sm text-red-600 mb-4">Error: {hackerrank.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
