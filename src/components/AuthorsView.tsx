import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/src/context/AudioContext';

export function AuthorsView() {
  const { playBook } = useAudio();
  const [authors, setAuthors] = useState<any[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<any | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem('koofr_library_cache');
    const cloudBooks = cached ? JSON.parse(cached) : [];

    // Group books by author
    const authorMap = cloudBooks.reduce((acc: any, book: any) => {
      const authorName = book.author || 'Unknown Author';
      if (!acc[authorName]) acc[authorName] = [];
      acc[authorName].push(book);
      return acc;
    }, {});

    // Format into an array for easy rendering
    const authorArray = Object.keys(authorMap).map(name => ({
      name,
      books: authorMap[name],
      bookCount: authorMap[name].length,
      cover: authorMap[name][0].cover // Use their first book's cover as their picture!
    })).sort((a, b) => a.name.localeCompare(b.name));

    setAuthors(authorArray);
  }, []);

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold text-neutral-100">Authors</h2>
        <p className="text-neutral-500">{authors.length} authors in your library</p>
      </header>

      {/* Authors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {authors.map((author, index) => (
          <motion.div
            key={author.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={() => setSelectedAuthor(author)}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-primary transition-colors relative shadow-lg">
              <img src={author.cover} alt={author.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <User className="w-8 h-8 text-white/50 group-hover:text-white/0 transition-colors" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-neutral-200 group-hover:text-primary transition-colors line-clamp-1">{author.name}</h3>
              <p className="text-xs text-neutral-500">{author.bookCount} Books</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Author Detail Modal */}
      <AnimatePresence>
        {selectedAuthor && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#121212]">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="flex-1 flex flex-col h-full relative">
              <div className="flex items-center justify-between p-6 z-10 shrink-0 border-b border-white/5 bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={selectedAuthor.cover} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAuthor.name}</h2>
                    <p className="text-xs text-neutral-400">{selectedAuthor.bookCount} Books Available</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAuthor(null)} className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                  {selectedAuthor.books.map((book: any, i: number) => (
                    <div key={book.id} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer group transition-colors" onClick={() => playBook(book)}>
                      <img src={book.cover} className="w-16 h-16 rounded object-cover shadow-md" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-neutral-200 truncate group-hover:text-primary">{book.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{book.audioParts ? `${book.audioParts.length} Parts` : 'Single File'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-neutral-600 group-hover:text-primary pr-2">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
