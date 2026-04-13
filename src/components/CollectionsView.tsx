import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Play, Pause, Search, X, FolderHeart, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/src/context/AudioContext';
import { fetchCloudLibrary, saveCustomCover } from '../../lib/webdav';

export function CollectionsView() {
  const { currentBook, isPlaying, playBook, togglePlay } = useAudio();
  
  const [cloudBooks, setCloudBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for our new Tracklist Modal
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);

  // Load from cache instantly when you switch to this tab!
  useEffect(() => {
    loadLibrary(false);
  }, []);

  const loadLibrary = async (force: boolean = false) => {
    setIsLoading(true);
    const files = await fetchCloudLibrary('/Audiobooks', force); 
    setCloudBooks(files);
    setIsLoading(false);
  };

  // Filter books based on search bar
  const filteredBooks = cloudBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle clicking a book card
  const handleBookClick = (book: any) => {
    if (book.audioParts && book.audioParts.length > 1) {
      // It's a folder with multiple parts! Open the modal.
      setSelectedFolder(book);
    } else {
      // It's a single file. Play it immediately.
      playBook(book);
    }
  };

  // Handle updating the cover image
  const handleUpdateCover = (book: any) => {
    const newUrl = prompt("Enter the URL of the new cover image:");
    if (newUrl) {
      saveCustomCover(book.id, newUrl); // Saves to device memory
      
      // Update the modal instantly if it's currently open
      if (selectedFolder?.id === book.id) {
        setSelectedFolder({ ...selectedFolder, cover: newUrl });
      }
      
      // Force refresh the library to show the new cover on the grid
      loadLibrary(true); 
    }
  };

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8 relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">My Library</h2>
          <p className="text-neutral-500">
            {isLoading ? 'Loading your audiobooks...' : `${cloudBooks.length} books synced from Koofr`}
          </p>
        </div>
        
        {/* Search Bar */}
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

      {/* Main Grid of All Books */}
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
              className="group cursor-pointer"
              onClick={() => handleBookClick(book)}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 shadow-lg border border-white/5 group-hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1 relative bg-neutral-800">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Change Cover Button (Top Left) */}
                <div 
                  className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/80 z-20"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent playing the book when clicking the edit button
                    handleUpdateCover(book);
                  }}
                >
                  <ImagePlus className="w-4 h-4 text-white" />
                </div>

                {/* Folder Icon Badge if it has multiple parts (Top Right) */}
                {book.audioParts && book.audioParts.length > 1 && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 z-10">
                    <FolderHeart className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    {currentBook?.id === book.id && isPlaying && (!book.audioParts || book.audioParts.length === 1) ? (
                      <Pause className="w-6 h-6 text-white fill-current" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                    )}
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-neutral-200 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {book.title}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 truncate">
                {book.audioParts && book.audioParts.length > 1 ? `${book.audioParts.length} Parts` : book.author}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tracklist Modal (Appears when you click a folder) */}
      <AnimatePresence>
        {selectedFolder && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedFolder(null)}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-[#1f1f1f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 flex gap-4 items-center border-b border-white/5 bg-neutral-900/50">
                {/* Clickable Cover Image to Update */}
                <div 
                  className="relative w-16 h-16 shrink-0 group/cover cursor-pointer"
                  onClick={() => handleUpdateCover(selectedFolder)}
                >
                  <img src={selectedFolder.cover} className="w-full h-full rounded-lg object-cover shadow-md" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                    <ImagePlus className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white line-clamp-1">{selectedFolder.title}</h3>
                  <p className="text-sm text-neutral-400 font-medium tracking-wide">
                    {selectedFolder.audioParts?.length || 0} Tracks Found
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-neutral-400 hover:text-white hover:bg-white/10" onClick={() => setSelectedFolder(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Scrollable Tracklist */}
              <div className="overflow-y-auto p-3 custom-scrollbar flex-1">
                {selectedFolder.audioParts?.map((url: string, i: number) => {
                  const uniquePartId = `${selectedFolder.id}-part-${i}`;
                  const isThisPartPlaying = currentBook?.id === uniquePartId && isPlaying;

                  return (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group
                        ${currentBook?.id === uniquePartId ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}
                      `}
                      onClick={() => {
                        const partBook = {
                          ...selectedFolder,
                          id: uniquePartId, 
                          title: `${selectedFolder.title} (Part ${i + 1})`,
                          audioUrl: url
                        };
                        
                        if (currentBook?.id === uniquePartId) {
                          togglePlay();
                        } else {
                          playBook(partBook);
                        }
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm
                        ${currentBook?.id === uniquePartId ? 'bg-primary text-white' : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-white'}
                      `}>
                        {isThisPartPlaying ? <div className="w-3 h-3 bg-white rounded-sm animate-pulse" /> : i + 1}
                      </div>
                      
                      <div className="flex-1 truncate text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">
                        Part {i + 1}
                      </div>
                      
                      {isThisPartPlaying ? (
                        <Pause className="w-5 h-5 text-primary" />
                      ) : (
                        <Play className={`w-5 h-5 ${currentBook?.id === uniquePartId ? 'text-primary' : 'text-neutral-600 group-hover:text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
