import React, { useState } from 'react';
import { Download, FileText, BarChart } from 'lucide-react';
import { fetchBulkData, downloadBulkCSV } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BulkStats {
  total_students: number;
  leetcode_success: number;
  hackerrank_success: number;
  avg_cgpa: number;
}

interface BulkDataResponse {
  success: boolean;
  stats: BulkStats;
}

const BulkDownload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [stats, setStats] = useState<BulkStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBulkDownload = async () => {
    setLoading(true);
    setError(null);
    setProgress('Starting bulk data collection...');

    try {
      const result: BulkDataResponse = await fetchBulkData();

      if (result.success) {
        setStats(result.stats);
        setProgress('Data collection completed! Preparing download...');

        // Download CSV
        const csvData = await downloadBulkCSV();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student_data_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setProgress('Download completed successfully!');
      } else {
        setError('Failed to generate bulk data');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Failed to download bulk data');
      } else {
        setError('Failed to download bulk data');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Data Download</h1>
        <p className="text-gray-600">Download comprehensive data for all students including LeetCode and HackerRank statistics</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Student Data</h2>
            <p className="text-gray-600">Includes LeetCode stats, HackerRank badges, and performance metrics</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="font-medium text-blue-800 mb-2">What&apos;s included:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Basic student information (Roll Number, CGPA, Backlogs)</li>
            <li>• LeetCode statistics (Total solved, Easy/Medium/Hard problems)</li>
            <li>• HackerRank badge information (Total badges, Stars, Badge details)</li>
            <li>• Data fetch status and timestamps</li>
            <li>• Summary statistics and success rates</li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner message={progress} />
            <div className="mt-4 bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⏳ This process may take several minutes as we fetch data from external APIs for each student. 
                Please be patient and don&apos;t close this page.
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleBulkDownload}
            className="w-full btn btn-primary py-3 flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Generate and Download Enhanced Data
          </button>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {stats && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Download Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total_students}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.leetcode_success}</p>
              <p className="text-sm text-gray-600">LeetCode Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.hackerrank_success}</p>
              <p className="text-sm text-gray-600">HackerRank Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.avg_cgpa}</p>
              <p className="text-sm text-gray-600">Average CGPA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkDownload;
