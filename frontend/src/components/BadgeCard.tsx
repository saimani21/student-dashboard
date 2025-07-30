import React from 'react';
import { Star, Trophy } from 'lucide-react';

interface Badge {
  'Badge Name': string;
  'Stars': number;
}

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const starCount = typeof badge['Stars'] === 'number' && badge['Stars'] > 0 ? badge['Stars'] : 0;
  const maxStars = 5;

  const getStarColor = (index: number) => {
    if (index < starCount) {
      return starCount >= 4 ? 'text-amber-400' : starCount >= 2 ? 'text-yellow-400' : 'text-orange-400';
    }
    return 'text-gray-200';
  };

  return (
    <div className="group card p-5 hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{badge['Badge Name']}</h3>
        </div>
        <div className="ml-2 p-1.5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
          <Trophy className="h-3 w-3 text-primary-600" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {Array.from({ length: maxStars }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 transition-all duration-200 ${getStarColor(i)} ${
                i < starCount ? 'fill-current' : ''
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          {starCount}/{maxStars}
        </span>
      </div>
      
      <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
        <div 
          className="bg-gradient-to-r from-primary-400 to-primary-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(starCount / maxStars) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BadgeCard;
