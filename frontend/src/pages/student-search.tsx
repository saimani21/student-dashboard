import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';

const StudentSearch: React.FC = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedRoll = rollNumber.trim().toUpperCase();
    
    if (!trimmedRoll) {
      setError('Please enter a roll number');
      return;
    }
    
    if (trimmedRoll.length < 8) {
      setError('Roll number seems too short');
      return;
    }
    
    setError('');
    router.push(`/student/${trimmedRoll}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Student</h1>
        <p className="text-gray-600">Enter a roll number to view detailed student performance</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g., 23A31A4401"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Search Student
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Search Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Enter the complete roll number (e.g., 23A31A4401)</li>
            <li>• Roll numbers are case-insensitive</li>
            <li>• Make sure there are no extra spaces</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentSearch;
