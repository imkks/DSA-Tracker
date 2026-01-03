import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Moon, Sun, Linkedin, Code2 } from 'lucide-react'; // Added Linkedin, Code2

import { RAW_DATA } from './data/dsaData';
import { hydrateData } from './utils/helpers';
import CategoryAccordion from './components/CategoryAccordion';

export default function App() {
  // ... (Keep all your existing state and useEffect logic exactly the same) ...
  // For brevity, I am not repeating the state logic here, just the return statement.
  
  // PASTE YOUR EXISTING STATE & USEEFFECT CODE HERE
  const [data, setData] = useState([]);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [starredSet, setStarredSet] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const processed = hydrateData(RAW_DATA);
    setData(processed);
    try {
      const savedProgress = localStorage.getItem('dsa-tracker-progress');
      if (savedProgress) setCompletedSet(new Set(JSON.parse(savedProgress)));
      const savedStarred = localStorage.getItem('dsa-tracker-starred');
      if (savedStarred) setStarredSet(new Set(JSON.parse(savedStarred)));
      const savedNotes = localStorage.getItem('dsa-tracker-notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      const savedTheme = localStorage.getItem('dsa-tracker-theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) { console.error(e); }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dsa-tracker-progress', JSON.stringify([...completedSet]));
    localStorage.setItem('dsa-tracker-starred', JSON.stringify([...starredSet]));
    localStorage.setItem('dsa-tracker-notes', JSON.stringify(notes));
  }, [completedSet, starredSet, notes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dsa-tracker-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode, isLoaded]);

  const toggleQuestion = (uid) => {
    const newSet = new Set(completedSet);
    if (newSet.has(uid)) newSet.delete(uid); else newSet.add(uid);
    setCompletedSet(newSet);
  };
  const toggleStar = (uid) => {
    const newSet = new Set(starredSet);
    if (newSet.has(uid)) newSet.delete(uid); else newSet.add(uid);
    setStarredSet(newSet);
  };
  const saveNote = (uid, content) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (!content || content.trim() === "") delete updated[uid];
      else updated[uid] = content;
      return updated;
    });
  };
  const resetProgress = () => {
    if (confirm("Reset all progress?")) {
      setCompletedSet(new Set());
      setStarredSet(new Set());
      setNotes({});
    }
  };

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

  // --- RETURN STATEMENT UPDATES ---

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            
            {/* LOGO AREA */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none">DSA Tracker</h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Master the Patterns</p>
              </div>
            </div>
            
            {/* CONTROLS */}
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
          
          {/* PROGRESS BAR */}
          <div className="flex items-center gap-4 mt-4">
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

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {data.map(category => (
            <CategoryAccordion 
              key={category.id} 
              category={category} 
              completedSet={completedSet}
              starredSet={starredSet}
              notes={notes}
              toggleQuestion={toggleQuestion}
              toggleStar={toggleStar}
              onSaveNote={saveNote}
            />
          ))}
        </div>

        {/* FOOTER WITH LINKEDIN */}
        <footer className="mt-12 mb-6 border-t border-gray-100 dark:border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-400">
              Complete your patterns to master Data Structures & Algorithms.
            </p>
            
            <a 
              href="https://www.linkedin.com/in/imkks/" /* <--- PUT YOUR LINKEDIN URL HERE */
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Created by <span className="font-bold text-gray-700 dark:text-gray-200">Krishna K Singh</span>
              </span>
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}