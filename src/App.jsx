import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Moon, Sun, Linkedin, Search, Filter, X } from 'lucide-react';

import { DSA_DATA } from './data/processedData';
import CategoryAccordion from './components/CategoryAccordion';

export default function App() {
  // --- STATE ---
  const [data, setData] = useState(DSA_DATA);
  
  // User Progress State
  const [completedSet, setCompletedSet] = useState(new Set());
  const [starredSet, setStarredSet] = useState(new Set());
  const [notes, setNotes] = useState({});
  
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All"); // All, Easy, Medium, Hard
  const [statusFilter, setStatusFilter] = useState("All");         // All, Completed, Incomplete, Starred

  // --- INITIALIZATION (Load from LocalStorage) ---
  useEffect(() => {
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
    } catch (e) {
      console.error("Failed to load state", e);
    }
    setIsLoaded(true);
  }, []);

  // --- PERSISTENCE ---
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

  // --- HANDLERS ---
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
    if (confirm("Are you sure you want to reset all progress, stars, and notes?")) {
      setCompletedSet(new Set());
      setStarredSet(new Set());
      setNotes({});
    }
  };

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    // If no filters are active, return original data
    if (!searchQuery && difficultyFilter === "All" && statusFilter === "All") {
      return data;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return data.map(category => {
      // 1. Filter Patterns inside Category
      const filteredPatterns = category.patterns.map(pattern => {
        // 2. Filter Questions inside Pattern
        const filteredQuestions = pattern.questions.filter(q => {
          // A. Search Match
          const matchesSearch = 
            q.title.toLowerCase().includes(lowerQuery) || 
            q.id.toString().includes(lowerQuery);

          // B. Difficulty Match
          const matchesDifficulty = 
            difficultyFilter === "All" || 
            q.difficulty === difficultyFilter;

          // C. Status Match
          let matchesStatus = true;
          if (statusFilter === "Completed") matchesStatus = completedSet.has(q.uid);
          else if (statusFilter === "Incomplete") matchesStatus = !completedSet.has(q.uid);
          else if (statusFilter === "Starred") matchesStatus = starredSet.has(q.uid);

          return matchesSearch && matchesDifficulty && matchesStatus;
        });

        // Return pattern with filtered questions (or null if empty)
        if (filteredQuestions.length > 0) {
          return { ...pattern, questions: filteredQuestions };
        }
        return null;
      }).filter(Boolean); // Remove null patterns

      // Return category with filtered patterns (or null if empty)
      if (filteredPatterns.length > 0) {
        return { ...category, patterns: filteredPatterns };
      }
      return null;
    }).filter(Boolean); // Remove null categories

  }, [data, searchQuery, difficultyFilter, statusFilter, completedSet, starredSet]);

  // --- STATS CALCULATION (Based on ALL data, not filtered) ---
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
      
      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight leading-none">DSA Tracker</h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Master the Patterns</p>
              </div>
            </div>
            
            {/* Right Controls */}
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
          
          {/* Progress Bar */}
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

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Starred">Starred ⭐</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Difficulty Filter */}
            <div className="relative min-w-[130px]">
              <select 
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-6">
          {filteredData.length > 0 ? (
            filteredData.map(category => (
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
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No questions found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-12 mb-6 border-t border-gray-100 dark:border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-400">
              Complete your patterns to master Data Structures & Algorithms.
            </p>
            
            <a 
              href="https://www.linkedin.com/in/YOUR_USERNAME_HERE/"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Created by <span className="font-bold text-gray-700 dark:text-gray-200">[Your Name]</span>
              </span>
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Simple Helper for the Dropdown Icon
const ChevronDownIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);