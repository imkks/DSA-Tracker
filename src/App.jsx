import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Moon, Sun, Linkedin, Search, Filter, X, Layout, FileText, List } from 'lucide-react';

// Data Sources
import { DSA_DATA } from './data/processedData';
import { LAST_MINUTE_RAW, DSA_SHEET_RAW } from './data/extraSheets';

// Components
import CategoryAccordion from './components/CategoryAccordion';
import { transformSheet } from './utils/transformData';

// --- TAB CONFIGURATION ---
const TABS = {
  patterns: {
    id: 'patterns',
    label: 'DSA Patterns',
    icon: Layout,
    data: DSA_DATA,
    storageKey: 'dsa-tracker' 
  },
  lastMinute: {
    id: 'lastMinute',
    label: 'Last Minute 100',
    icon: FileText,
    data: transformSheet(LAST_MINUTE_RAW, 'lm'),
    storageKey: 'last-minute'
  },
  sheet: {
    id: 'sheet',
    label: 'DSA Sheet',
    icon: List,
    data: transformSheet(DSA_SHEET_RAW, 'sheet'),
    storageKey: 'dsa-sheet'
  }
};

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('patterns');
  
  // We store ALL user progress in one state object, keyed by tab ID
  // Structure: { patterns: { completed: Set, starred: Set, notes: {} }, lastMinute: { ... } }
  const [userData, setUserData] = useState({
    patterns: { completed: new Set(), starred: new Set(), notes: {} },
    lastMinute: { completed: new Set(), starred: new Set(), notes: {} },
    sheet: { completed: new Set(), starred: new Set(), notes: {} }
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All"); 
  const [statusFilter, setStatusFilter] = useState("All");

  // --- INITIALIZATION ---
  useEffect(() => {
    const newUserData = { ...userData };

    // Load data for EACH tab from its own local storage key
    Object.values(TABS).forEach(tab => {
      try {
        const savedProgress = localStorage.getItem(`${tab.storageKey}-progress`);
        const savedStarred = localStorage.getItem(`${tab.storageKey}-starred`);
        const savedNotes = localStorage.getItem(`${tab.storageKey}-notes`);

        if (savedProgress) newUserData[tab.id].completed = new Set(JSON.parse(savedProgress));
        if (savedStarred) newUserData[tab.id].starred = new Set(JSON.parse(savedStarred));
        if (savedNotes) newUserData[tab.id].notes = JSON.parse(savedNotes);
      } catch (e) {
        console.error(`Failed to load data for ${tab.id}`, e);
      }
    });

    setUserData(newUserData);

    // Theme
    const savedTheme = localStorage.getItem('dsa-tracker-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    setIsLoaded(true);
  }, []);

  // --- PERSISTENCE ---
  // Whenever userData changes, save the *active* tab's data to LS
  useEffect(() => {
    if (!isLoaded) return;
    
    const current = userData[activeTab];
    const key = TABS[activeTab].storageKey;

    localStorage.setItem(`${key}-progress`, JSON.stringify([...current.completed]));
    localStorage.setItem(`${key}-starred`, JSON.stringify([...current.starred]));
    localStorage.setItem(`${key}-notes`, JSON.stringify(current.notes));
    
  }, [userData, activeTab, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('dsa-tracker-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode, isLoaded]);

  // --- ACTIONS ---
  // Helper to update state for the current tab
  const updateCurrentTab = (field, updateFn) => {
    setUserData(prev => {
      const currentTabState = prev[activeTab];
      const newVal = updateFn(currentTabState[field]);
      return {
        ...prev,
        [activeTab]: {
          ...currentTabState,
          [field]: newVal
        }
      };
    });
  };

  const toggleQuestion = (uid) => {
    updateCurrentTab('completed', (set) => {
      const newSet = new Set(set);
      if (newSet.has(uid)) newSet.delete(uid); else newSet.add(uid);
      return newSet;
    });
  };

  const toggleStar = (uid) => {
    updateCurrentTab('starred', (set) => {
      const newSet = new Set(set);
      if (newSet.has(uid)) newSet.delete(uid); else newSet.add(uid);
      return newSet;
    });
  };

  const saveNote = (uid, content) => {
    updateCurrentTab('notes', (notes) => {
      const updated = { ...notes };
      if (!content || content.trim() === "") delete updated[uid];
      else updated[uid] = content;
      return updated;
    });
  };

  const resetProgress = () => {
    if (confirm("Reset progress for THIS tab?")) {
      setUserData(prev => ({
        ...prev,
        [activeTab]: { completed: new Set(), starred: new Set(), notes: {} }
      }));
    }
  };

  // --- DERIVED DATA (Current View) ---
  const currentTabData = TABS[activeTab].data;
  const { completed: currentCompleted, starred: currentStarred, notes: currentNotes } = userData[activeTab];

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery && difficultyFilter === "All" && statusFilter === "All") {
      return currentTabData;
    }

    const lowerQuery = searchQuery.toLowerCase();

    return currentTabData.map(category => {
      const filteredPatterns = category.patterns.map(pattern => {
        const filteredQuestions = pattern.questions.filter(q => {
          const matchesSearch = q.title.toLowerCase().includes(lowerQuery);
          const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
          let matchesStatus = true;
          if (statusFilter === "Completed") matchesStatus = currentCompleted.has(q.uid);
          else if (statusFilter === "Incomplete") matchesStatus = !currentCompleted.has(q.uid);
          else if (statusFilter === "Starred") matchesStatus = currentStarred.has(q.uid);

          return matchesSearch && matchesDifficulty && matchesStatus;
        });

        if (filteredQuestions.length > 0) return { ...pattern, questions: filteredQuestions };
        return null;
      }).filter(Boolean);

      if (filteredPatterns.length > 0) return { ...category, patterns: filteredPatterns };
      return null;
    }).filter(Boolean);

  }, [currentTabData, searchQuery, difficultyFilter, statusFilter, currentCompleted, currentStarred]);

  // Stats
  const stats = useMemo(() => {
    let total = 0;
    let completedCount = 0;
    currentTabData.forEach(cat => {
      cat.patterns.forEach(pat => {
        total += pat.questions.length;
        completedCount += pat.questions.filter(q => currentCompleted.has(q.uid)).length;
      });
    });
    return { total, completed: completedCount, percent: total === 0 ? 0 : Math.round((completedCount / total) * 100) };
  }, [currentTabData, currentCompleted]);

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight leading-none">DSA Tracker</h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Master the Patterns</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={resetProgress} className="text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 transition-colors">
                Reset Tab
              </button>
            </div>
          </div>

          {/* TAB BAR */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4 overflow-x-auto">
            {Object.values(TABS).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 flex-1 justify-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* PROGRESS */}
          <div className="flex items-center gap-4">
             <div className="flex-grow">
               <div className="flex justify-between text-xs mb-1 font-medium text-gray-500 dark:text-gray-400">
                 <span>{TABS[activeTab].label} Progress</span>
                 <span className={stats.percent === 100 ? 'text-green-500' : ''}>{stats.completed} / {stats.total} Solved</span>
               </div>
               <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 transition-all duration-700 ease-out" style={{ width: `${stats.percent}%` }} />
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
        
        {/* FILTERS */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" placeholder="Search questions..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Starred">Starred</option>
            </select>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {filteredData.length > 0 ? (
            filteredData.map(category => (
              <CategoryAccordion 
                key={category.id} 
                category={category} 
                completedSet={currentCompleted}
                starredSet={currentStarred}
                notes={currentNotes}
                toggleQuestion={toggleQuestion}
                toggleStar={toggleStar}
                onSaveNote={saveNote}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No questions found</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-12 mb-6 border-t border-gray-100 dark:border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-400">
              Complete your patterns to master Data Structures & Algorithms.
            </p>
            <a href="https://www.linkedin.com/in/YOUR_USERNAME_HERE/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group">
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