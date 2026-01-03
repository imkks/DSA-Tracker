import React, { useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, Star, StickyNote, Save, X } from 'lucide-react';

const QuestionItem = ({ question, isCompleted, isStarred, note, onToggle, onToggleStar, onSaveNote }) => {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(note || "");

  // Update local state if the prop changes (e.g. from localStorage load)
  React.useEffect(() => {
    setNoteText(note || "");
  }, [note]);

  const handleSave = () => {
    onSaveNote(question.uid, noteText);
    setShowNote(false);
  };

  const handleCancel = () => {
    setNoteText(note || ""); // Revert to saved version
    setShowNote(false);
  };

  const hasNote = note && note.trim().length > 0;

  return (
    <div className={`flex flex-col rounded-lg border transition-all duration-200 ${
        isCompleted 
          ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' 
          : 'bg-white border-gray-100 hover:border-indigo-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-indigo-700'
      }`}>
      
      {/* Question Row */}
      <div className="flex items-center gap-3 p-3">
        <button 
          onClick={() => onToggle(question.uid)}
          className="flex-shrink-0 focus:outline-none"
          title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100 dark:fill-green-900" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 dark:text-gray-600" />
          )}
        </button>
        
        <a 
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-grow text-sm leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 min-w-0 ${
            isCompleted ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-300' : 'text-gray-700 dark:text-gray-200'
          }`}
        >
          <span className="font-mono text-xs text-gray-400 min-w-[24px] inline-block flex-shrink-0">{question.id}.</span>
          <span className="truncate">{question.title}</span>
          <ExternalLink className="w-3 h-3 opacity-0 hover:opacity-100 ml-1 flex-shrink-0" />
        </a>

        {/* Note Button */}
        <button
          onClick={() => setShowNote(!showNote)}
          className={`flex-shrink-0 focus:outline-none transition-colors ${
            hasNote ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400'
          }`}
          title="Add/Edit Note"
        >
           <StickyNote className="w-4 h-4 fill-current" />
        </button>

        {/* Star Button */}
        <button
          onClick={() => onToggleStar(question.uid)}
          className="flex-shrink-0 focus:outline-none opacity-40 hover:opacity-100 transition-opacity"
          title={isStarred ? "Remove star" : "Add star for revision"}
        >
           <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400 opacity-100' : 'text-gray-400 dark:text-gray-600'}`} />
        </button>
      </div>

      {/* Note Editor Section */}
      {showNote && (
        <div className="px-3 pb-3 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your notes here (e.g., Time Complexity, specific tricks)..."
            className="w-full text-sm p-2 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y min-h-[80px]"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
            >
              <Save className="w-3 h-3" /> Save Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;