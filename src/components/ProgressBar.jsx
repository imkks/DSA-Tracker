import React from 'react';

const ProgressBar = ({ current, total, colorClass = "bg-indigo-600" }) => {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${percent === 100 ? 'bg-green-500' : colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-9 text-right">{percent}%</span>
    </div>
  );
};

export default ProgressBar;