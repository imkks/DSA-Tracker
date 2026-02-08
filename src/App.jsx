import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Moon, Sun } from 'lucide-react';

import { RAW_DATA } from './data/dsaData';
import { DSA_DATA } from './data/processedData';
import { hydrateData } from './utils/helpers';
import CategoryAccordion from './components/CategoryAccordion';

export default function App() {
  // State
  const [data, setData] = useState(DSA_DATA);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [starredSet, setStarredSet] = useState(new Set());
  const [notes, setNotes] = useState({}); // New: Notes State
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Data
  useEffect(() => {
    // const processed = hydrateData(DSA_DATA);
    // setData(processed);
    
    // Load persisted state
    try {
      const savedProgress = localStorage.getItem('dsa-tracker-progress');
      if (savedProgress) setCompletedSet(new Set(JSON.parse(savedProgress)));

      const savedStarred = localStorage.getItem('dsa-tracker-starred');
      if (savedStarred) setStarredSet(new Set(JSON.parse(savedStarred)));

      // Load Notes
      const savedNotes = localStorage.getItem('dsa-tracker-notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      
      const savedTheme = localStorage.getItem('dsa-tracker-theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    
    setIsLoaded(true);
  }, []);

  // Persist State
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dsa-tracker-progress', JSON.stringify([...completedSet]));
    localStorage.setItem('dsa-tracker-starred', JSON.stringify([...starredSet]));
    localStorage.setItem('dsa-tracker-notes', JSON.stringify(notes)); // Save Notes
  }, [completedSet, starredSet, notes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dsa-tracker-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, isLoaded]);

  // Handlers
  const toggleQuestion = (uid) => {
    const newSet = new Set(completedSet);
    if (newSet.has(uid)) newSet.delete(uid);
    else newSet.add(uid);
    setCompletedSet(newSet);
  };

  const toggleStar = (uid) => {
    const newSet = new Set(starredSet);
    if (newSet.has(uid)) newSet.delete(uid);
    else newSet.add(uid);
    setStarredSet(newSet);
  };

  // New: Save Note Handler
  const saveNote = (uid, content) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (!content || content.trim() === "") {
        delete updated[uid]; // Remove empty notes to save space
      } else {
        updated[uid] = content;
      }
      return updated;
    });
  };

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress, stars, and notes? This cannot be undone.")) {
      setCompletedSet(new Set());
      setStarredSet(new Set());
      setNotes({});
    }
  };

  // Stats
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    data.forEach(cat => {
      cat.patterns.forEach(pat => {
        total += pat.questions.length;
        completed += pat.questions.filter(q => completedSet.has(q.uid)).length;
      });
    });
    return { total, completed, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [data, completedSet]);

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">DSA Tracker</h1>
            </div>
            
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={resetProgress}
                className="text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex-grow">
               <div className="flex justify-between text-xs mb-1 font-medium text-gray-500 dark:text-gray-400">
                 <span>Overall Progress</span>
                 <span className={stats.percent === 100 ? 'text-green-500' : ''}>{stats.completed} / {stats.total} Solved</span>
               </div>
               <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
                    style={{ width: `${stats.percent}%` }}
                 />
               </div>
             </div>
             <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 min-w-[3rem] text-right">
               {stats.percent}%
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {data.map(category => (
            <CategoryAccordion 
              key={category.id} 
              category={category} 
              completedSet={completedSet}
              starredSet={starredSet}
              notes={notes} // Pass notes
              toggleQuestion={toggleQuestion}
              toggleStar={toggleStar}
              onSaveNote={saveNote} // Pass handler
            />
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-400 pb-8">
          <p>Complete your patterns to master Data Structures & Algorithms.</p>
        </footer>
      </main>
    </div>
  );
}