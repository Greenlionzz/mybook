import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Search, X, FolderHeart, ImagePlus, Clock, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/src/context/AudioContext';
import { fetchCloudLibrary, saveCustomCover } from '../../lib/webdav';

export function CollectionsView() {
  const { currentBook, isPlaying, playBook, togglePlay } = useAudio();
  
  const [cloudBooks, setCloudBooks] = useState<any[]>(() => {
    const cached = localStorage.getItem('koofr_library_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [isLoading, setIsLoading] = useState(cloudBooks.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Changed from selectedFolder to selectedBook for a unified Details Page
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  useEffect(() => {
    if (cloudBooks.length === 0) {
      loadLibrary(false);
    }
  }, []);

  const loadLibrary = async (force: boolean = false) => {
    if (force || cloudBooks.length === 0) setIsLoading(true);
    const files = await fetchCloudLibrary(force); 
    setCloudBooks(files);
    setIsLoading(false);
  };

  const filteredBooks = cloudBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateCover = (book: any) => {
    const newUrl = prompt("Enter the URL of the new cover image:");
    if (newUrl) {
      saveCustomCover(book.id, newUrl);
      if (selectedBook?.id === book.id) {
        setSelectedBook({ ...selectedBook, cover: newUrl });
      }
      loadLibrary(true); 
    }
  };

  // Helper to play a specific part from the details page
  const handlePlayPart = (book: any, url: string, index: number) => {
    const uniquePartId = `${book.id}-part-${index}`;
    const partBook = {
      ...book,
      id: uniquePartId, 
      title: book.audioParts && book.audioParts.length > 1 ? `${book.title} (Part ${index + 1})` : book.title,
      audioUrl: url
    };
    
    if (currentBook?.id === uniquePartId) {
      togglePlay();
    } else {
      playBook(partBook);
    }
  };

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8 relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">My Library</h2>
          <p className="text-neutral-500">
            {isLoading ? 'Scanning cloud...' : `${cloudBooks.length} books synced`}
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..." 
            className="bg-[#1f1f1f] border-white/5 pl-10 text-white focus-visible:ring-1 focus-visible:ring-primary h-10"
          />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }} 
              className="group cursor-pointer relative"
              onClick={() => setSelectedBook(book)} // Opens the Details Page!
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 shadow-lg border border-white/5 relative bg-neutral-800 transition-transform duration-300 group-hover:-translate-y-1">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Folder Icon for Multi-part */}
                {book.audioParts && book.audioParts.length > 1 && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 z-10">
                    <FolderHeart className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                {/* Dark overlay on hover to indicate clickability */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-sm font-bold text-neutral-200 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 truncate">
                {book.audioParts && book.audioParts.length > 1 ? `${book.audioParts.length} Parts` : 'Single File'}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Full Details Page Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#121212]">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col h-full relative"
            >
              {/* Blurred Background Banner */}
              <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden z-0 opacity-30">
                <img src={selectedBook.cover} className="w-full h-full object-cover blur-[100px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]" />
              </div>

              {/* Header Nav */}
              <div className="flex items-center justify-between p-6 z-10 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setSelectedBook(null)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="w-8 h-8" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar z-10 pb-32">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row gap-10 md:gap-16">
                  
                  {/* Left Column: Cover & Edit */}
                  <div className="flex flex-col items-center gap-6 shrink-0 md:w-72">
                    <div 
                      className="w-48 h-48 md:w-full md:h-72 rounded-xl overflow-hidden shadow-2xl relative group cursor-pointer border border-white/10"
                      onClick={() => handleUpdateCover(selectedBook)}
                    >
                      <img src={selectedBook.cover} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <ImagePlus className="w-8 h-8 text-white mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Change Cover</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details & Tracklist */}
                  <div className="flex-1 flex flex-col gap-8">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                        {selectedBook.title}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-neutral-400 font-medium">
                        <span className="text-primary">{selectedBook.author}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Disc className="w-4 h-4" />
                          <span>{selectedBook.audioParts ? selectedBook.audioParts.length : 1} Tracks</span>
                        </div>
                      </div>
                    </div>

                    {/* Master Play Button (Plays Part 1) */}
                    <Button 
                      className="w-full md:w-auto self-center md:self-start bg-primary hover:bg-primary/90 text-white font-bold px-10 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] gap-3"
                      onClick={() => {
                        const urlToPlay = selectedBook.audioParts ? selectedBook.audioParts[0] : selectedBook.audioUrl;
                        handlePlayPart(selectedBook, urlToPlay, 0);
                      }}
                    >
                      <Play className="w-6 h-6 fill-current" />
                      Play Book
                    </Button>

                    <hr className="border-white/5" />

                    {/* Tracklist */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Tracklist</h3>
                      
                      {selectedBook.audioParts ? (
                        // Multi-part folder tracks
                        selectedBook.audioParts.map((url: string, i: number) => {
                          const isThisPartPlaying = currentBook?.id === `${selectedBook.id}-part-${i}` && isPlaying;
                          
                          return (
                            <button
                              key={i}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group
                                ${isThisPartPlaying ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}
                              `}
                              onClick={() => handlePlayPart(selectedBook, url, i)}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm shrink-0
                                ${isThisPartPlaying ? 'bg-primary text-white' : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-white'}
                              `}>
                                {isThisPartPlaying ? <div className="w-3 h-3 bg-white rounded-sm animate-pulse" /> : i + 1}
                              </div>
                              <div className="flex-1 text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">
                                Part {i + 1}
                              </div>
                              {isThisPartPlaying ? (
                                <Pause className="w-5 h-5 text-primary shrink-0" />
                              ) : (
                                <Play className="w-5 h-5 text-neutral-600 group-hover:text-white shrink-0" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        // Single file track
                        <button
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group
                            ${currentBook?.id === `${selectedBook.id}-part-0` && isPlaying ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}
                          `}
                          onClick={() => handlePlayPart(selectedBook, selectedBook.audioUrl, 0)}
                        >
                           <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-white shrink-0">1</div>
                           <div className="flex-1 text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">Main Audio File</div>
                           <Play className="w-5 h-5 text-neutral-600 group-hover:text-white shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
