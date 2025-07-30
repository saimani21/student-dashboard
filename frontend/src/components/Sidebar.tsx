import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Search, Download, BarChart3 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const navItems = [
    { href: '/', icon: Home, label: 'Overview' },
    { href: '/student-search', icon: Search, label: 'Search Student' },
    { href: '/bulk-download', icon: Download, label: 'Bulk Export' },
  ];

  return (
    <div className="glass-effect w-80 min-h-screen border-r border-white/10">
      <div className="p-6">
        <div className="space-y-3">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`group flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 p-6 glass-effect rounded-2xl border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Real-time Analytics</h4>
              <p className="text-sm text-white/70">Live performance tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/60">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
