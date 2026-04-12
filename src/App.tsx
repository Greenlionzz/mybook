/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PlayerBar } from './components/PlayerBar';
import { BookCard } from './components/BookCard';
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
import { BOOKS } from './constants';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

import { useAudio } from './context/AudioContext';

const ITEMS_PER_PAGE = 12;

export default function App() {
  const { currentBook } = useAudio();
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('author');
  const [filterBy, setFilterBy] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedSeries(null);
    setGlobalSearchQuery('');
  };
  
  // Infinite Scroll State
  const [visibleBooks, setVisibleBooks] = useState<typeof BOOKS>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Initial load and page change
  useEffect(() => {
    if (currentView !== 'library') return;
    
    const loadBooks = () => {
      setIsLoading(true);
      // Simulate network delay
      setTimeout(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        
        // Filter and Sort BOOKS
        let filtered = [...BOOKS];
        if (filterBy !== 'all') {
          filtered = filtered.filter(b => (b as any).status === filterBy);
        }
        if (genreFilter !== 'all') {
          filtered = filtered.filter(b => (b as any).genre === genreFilter);
        }

        filtered.sort((a: any, b: any) => {
          if (sortBy === 'author') return a.author.localeCompare(b.author);
          if (sortBy === 'title') return a.title.localeCompare(b.title);
          if (sortBy === 'added') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          return 0;
        });

        // For demo purposes, we can still loop if we want, but let's just show the filtered/sorted list
        // and stop when we reach the end of the filtered list.
        const newBatch = filtered.slice(start, end);
        
        setVisibleBooks(prev => page === 1 ? newBatch : [...prev, ...newBatch]);
        setIsLoading(false);
        
        if (end >= filtered.length) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }, 600);
    };

    loadBooks();
  }, [page, currentView, sortBy, filterBy, genreFilter]);

  // Reset when view changes back to library or sort/filter changes
  useEffect(() => {
    if (currentView === 'library') {
      setPage(1);
      setVisibleBooks([]);
      setHasMore(true);
    }
  }, [currentView, sortBy, filterBy, genreFilter]);

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
            <>
              {/* Content Header */}
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#1a1a1a]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-300">{visibleBooks.length} Books Loaded</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox id="collapse" className="border-neutral-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <label htmlFor="collapse" className="text-xs font-medium text-neutral-400 cursor-pointer select-none">
                      Collapse Series
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={genreFilter} onValueChange={setGenreFilter}>
                      <SelectTrigger className="w-[100px] h-8 bg-[#2a2a2a] border-none text-xs focus:ring-0">
                        <SelectValue placeholder="Genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-white/10 text-white">
                        <SelectItem value="all">All Genres</SelectItem>
                        <SelectItem value="Adventure">Adventure</SelectItem>
                        <SelectItem value="Classic">Classic</SelectItem>
                        <SelectItem value="Philosophy">Philosophy</SelectItem>
                        <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                        <SelectItem value="Fantasy">Fantasy</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-[80px] h-8 bg-[#2a2a2a] border-none text-xs focus:ring-0">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-white/10 text-white">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px] h-8 bg-[#2a2a2a] border-none text-xs focus:ring-0">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-white/10 text-white">
                        <SelectItem value="author">Author (First Last)</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="added">Date Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Grid Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pb-32">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-6 gap-y-10">
                    {visibleBooks.map((book, index) => {
                      if (visibleBooks.length === index + 1) {
                        return (
                          <div ref={lastBookElementRef} key={`${book.id}-${index}`}>
                            <BookCard 
                              id={book.id}
                              title={book.title}
                              author={book.author}
                              cover={book.cover}
                              onClick={() => setSelectedBook(book)}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <BookCard 
                            key={`${book.id}-${index}`}
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            cover={book.cover}
                            onClick={() => setSelectedBook(book)}
                          />
                        );
                      }
                    })}
                  </div>
                  
                  {isLoading && (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </>
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
              <CollectionsView />
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
