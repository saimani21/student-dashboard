import React from 'react';
import Link from 'next/link';
import { GraduationCap, Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-white">
                Student Performance
              </h1>
              <p className="text-sm text-white/70"> Dashboard</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
