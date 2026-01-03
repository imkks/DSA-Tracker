import React, { useState } from 'react';
import { ChevronDown, Award } from 'lucide-react';
import ProgressBar from './ProgressBar';
import QuestionItem from './QuestionItem';

const PatternSection = ({ pattern, completedSet, starredSet, notes, toggleQuestion, toggleStar, onSaveNote }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedCount = pattern.questions.filter(q => completedSet.has(q.uid)).length;
  const totalCount = pattern.questions.length;
  const isAllDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="mb-4 last:mb-0 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800/50">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <h4 className={`text-sm font-semibold flex items-center gap-2 ${isAllDone ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {pattern.name}
            {isAllDone && <Award className="w-4 h-4 text-green-500" />}
            </h4>
        </div>
        
        <div className="w-full sm:w-32 pl-6 sm:pl-0">
          <ProgressBar current={completedCount} total={totalCount} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800">
            {pattern.questions.map(q => (
            <QuestionItem 
                key={q.uid} 
                question={q} 
                isCompleted={completedSet.has(q.uid)} 
                isStarred={starredSet.has(q.uid)}
                note={notes[q.uid]} // Pass specific note
                onToggle={toggleQuestion} 
                onToggleStar={toggleStar}
                onSaveNote={onSaveNote} // Pass handler
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default PatternSection;