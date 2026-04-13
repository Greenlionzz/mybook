import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PlayerBar } from './components/PlayerBar';
import { BookDetails } from './components/BookDetails';
import { FullPlayer } from './components/FullPlayer';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { AuthorsView } from './components/AuthorsView';
import { SeriesView } from './components/SeriesView';
import { SeriesDetail } from './components/SeriesDetail';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { CollectionsView } from './components/CollectionsView';
import { LibraryView } from './components/LibraryView'; 
import { useState, useEffect } from 'react'; 
import { AnimatePresence } from 'motion/react';
import { useAudio } from './context/AudioContext';

export default function App() {
  // NEW: Grab isPlaying from the context as well!
  const { currentBook, isPlaying } = useAudio(); 
  
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false); 
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // NEW: Now watches for ANY play action or book change
  useEffect(() => {
    if (currentBook) {
      setIsPlayerVisible(true);
    }
  }, [currentBook, isPlaying]); // <-- Added isPlaying here so it triggers on play!
  
    // ... existing code ...
  // NEW: This automatically brings the mini player back up whenever a book is played!
  useEffect(() => {
    if (currentBook) {
      setIsPlayerVisible(true);
    }
  }, [currentBook, isPlaying]);

  // ---> PASTE THIS NEW BLOCK RIGHT HERE <---
  // NEW: Global Listening Time & Streak Tracker
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        // Get current date reliably as YYYY-MM-DD
        const today = new Date().toLocaleDateString('en-CA'); 
        let stats = JSON.parse(localStorage.getItem('koofr_listening_stats') || 'null');

        // If it's the first time ever playing
        if (!stats) {
          stats = { date: today, secondsListened: 0, streak: 1 };
        }

        // If the date rolled over to a new day
        if (stats.date !== today) {
          const lastDate = new Date(stats.date);
          const currentDate = new Date(today);
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / 86400000);

          let newStreak = stats.streak;
          if (diffDays === 1) {
             newStreak += 1; // Played consecutive days! Add to streak.
          } else if (diffDays > 1) {
             newStreak = 1; // Missed a day. Streak broken.
          }

          stats.date = today;
          stats.secondsListened = 0;
          stats.streak = newStreak;
        }

        // Add 1 second of listening time
        stats.secondsListened += 1;
        localStorage.setItem('koofr_listening_stats', JSON.stringify(stats));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);
  // -----------------------------------------

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedSeries(null);
    setGlobalSearchQuery('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      <TopNav 
        searchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {globalSearchQuery ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <SearchResultsView 
                query={globalSearchQuery} 
                onSelectBook={setSelectedBook} 
              />
            </div>
          ) : currentView === 'home' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <HomeView />
            </div>
          ) : currentView === 'library' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <CollectionsView /> 
            </div>
          ) : currentView === 'stats' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <StatsView />
            </div>
          ) : currentView === 'settings' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <SettingsView />
            </div>
          ) : currentView === 'authors' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AuthorsView />
            </div>
          ) : currentView === 'series' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {selectedSeries ? (
                  <SeriesDetail 
                    series={selectedSeries} 
                    onClose={() => setSelectedSeries(null)} 
                  />
                ) : (
                  <SeriesView 
                    onSelectSeries={setSelectedSeries} 
                  />
                )}
              </AnimatePresence>
            </div>
          ) : currentView === 'collections' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <LibraryView />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
              <p className="text-lg font-medium">View for "{currentView}" is coming soon.</p>
            </div>
          )}
        </main>
      </div>

      <BookDetails 
        book={selectedBook} 
        isOpen={!!selectedBook} 
        onClose={() => setSelectedBook(null)} 
      />

      <FullPlayer 
        isOpen={isFullPlayerOpen} 
        onClose={() => setIsFullPlayerOpen(false)} 
        book={currentBook as any}
      />

      {isPlayerVisible && (
        <PlayerBar 
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)} 
          onClose={() => setIsPlayerVisible(false)}
        />
      )}
    </div>
  );
}
  