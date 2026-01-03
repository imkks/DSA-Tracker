import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';
import PatternSection from './PatternSection';

const CategoryAccordion = ({ category, completedSet, starredSet, notes, toggleQuestion, toggleStar, onSaveNote }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalQuestions = category.patterns.reduce((sum, p) => sum + p.questions.length, 0);
  const completedQuestions = category.patterns.reduce((sum, p) => 
    sum + p.questions.filter(q => completedSet.has(q.uid)).length, 0
  );
  
  const isComplete = totalQuestions > 0 && totalQuestions === completedQuestions;

  return (
    <div className={`border rounded-xl mb-4 transition-all duration-300 overflow-hidden ${
      isOpen 
        ? 'bg-white shadow-md border-indigo-100 dark:bg-gray-800 dark:border-gray-700' 
        : 'bg-white shadow-sm border-gray-200 hover:border-indigo-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
    }`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`p-2 rounded-lg ${
            isComplete ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
            isOpen ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}`}>
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {category.patterns.length} Patterns • {totalQuestions} Questions
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 flex items-center gap-3">
           <div className="flex-grow">
             <ProgressBar current={completedQuestions} total={totalQuestions} />
           </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="mt-4 space-y-4">
            {category.patterns.map(pat => (
              <PatternSection 
                key={pat.id} 
                pattern={pat} 
                completedSet={completedSet}
                starredSet={starredSet}
                notes={notes} // Pass down
                toggleQuestion={toggleQuestion}
                toggleStar={toggleStar}
                onSaveNote={onSaveNote} // Pass down
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAccordion;