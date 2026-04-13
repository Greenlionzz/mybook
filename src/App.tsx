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
import { LibraryView } from './components/LibraryView'; // <-- Our new Wishlist!
import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAudio } from './context/AudioContext';

export default function App() {
  const { currentBook } = useAudio();
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

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
              {/* Library Tab now opens your Koofr Sync! */}
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
              {/* Collections Tab now opens your Wishlist! */}
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
