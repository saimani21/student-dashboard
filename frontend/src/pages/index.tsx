import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Award, Search, ArrowRight, Code, Trophy, Target, Sparkles } from 'lucide-react';
import { fetchAllStudents, StudentsListResponse } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [studentsData, setStudentsData] = useState<StudentsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentsData();
  }, []);

  const loadStudentsData = async () => {
    try {
      const data = await fetchAllStudents();
      setStudentsData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner message="Loading dashboard..." />
    </div>
  );

  const stats = studentsData ? {
    totalStudents: studentsData.total,
    avgCgpa: (studentsData.students.reduce((sum, s) => sum + s.cgpa, 0) / studentsData.total).toFixed(2),
    studentsWithLeetcode: studentsData.students.filter(s => s.has_leetcode).length,
    studentsWithHackerrank: studentsData.students.filter(s => s.has_hackerrank).length,
    studentsWithBacklogs: studentsData.students.filter(s => s.total_backlogs > 0).length
  } : null;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full border border-white/20">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-white/90 text-sm font-medium"> Analytics Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Student Performance
          <span className="block bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          Monitor and analyze student performance across multiple coding platforms with 
          real-time insights and comprehensive analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/student-search" className="btn btn-primary px-8 py-4 text-lg">
            <Search className="h-5 w-5 mr-3" />
            Explore Students
            <ArrowRight className="h-5 w-5 ml-3" />
          </Link>
          <Link href="/bulk-download" className="btn btn-secondary px-8 py-4 text-lg">
            <TrendingUp className="h-5 w-5 mr-3" />
            Generate Reports
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          <div className="metric-card text-center group float-animation">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-2">{stats.totalStudents}</h3>
            <p className="text-gray-600 font-medium">Total Students</p>
          </div>
          
          <div className="metric-card text-center group float-animation" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-2">{stats.avgCgpa}</h3>
            <p className="text-gray-600 font-medium">Average CGPA</p>
          </div>
          
          <div className="metric-card text-center group float-animation" style={{ animationDelay: '1s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-2">{stats.studentsWithLeetcode}</h3>
            <p className="text-gray-600 font-medium">LeetCode Active</p>
          </div>
          
          <div className="metric-card text-center group float-animation" style={{ animationDelay: '1.5s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-2">{stats.studentsWithHackerrank}</h3>
            <p className="text-gray-600 font-medium">HackerRank Active</p>
          </div>
          
          <div className="metric-card text-center group float-animation" style={{ animationDelay: '2s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold gradient-text mb-2">{stats.studentsWithBacklogs}</h3>
            <p className="text-gray-600 font-medium">With Backlogs</p>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Individual Analytics</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Deep dive into individual student performance with comprehensive metrics 
            and real-time platform integration.
          </p>
          <Link href="/student-search" className="btn btn-primary w-full">
            Explore Students
          </Link>
        </div>

        <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Bulk Analytics</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Generate comprehensive reports with enhanced data exports including 
            all platform statistics and performance metrics.
          </p>
          <Link href="/bulk-download" className="btn btn-primary w-full">
            Generate Reports
          </Link>
        </div>

        <div className="card-premium p-8 text-center group hover:scale-105 transition-all duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Live Tracking</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Monitor real-time performance data from LeetCode, HackerRank, 
            and academic records with live synchronization.
          </p>
          <div className="btn btn-secondary w-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
            Live Monitoring
          </div>
        </div>
      </div>

      {error && (
        <div className="card p-6 border-l-4 border-red-400 bg-red-50/80 backdrop-blur-sm max-w-2xl mx-auto">
          <p className="text-red-800 font-medium">System Notice</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
