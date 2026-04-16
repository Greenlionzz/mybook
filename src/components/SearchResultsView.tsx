import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, User, Layers } from 'lucide-react';
import { BookCard } from './BookCard';

interface SearchResultsViewProps {
  query?: string; // Made optional just in case
  library?: any[]; // Made optional just in case
  onSelectBook: (book: any) => void;
}

// 1. We assign default values right in the parameters so they are NEVER undefined
export function SearchResultsView({ 
  query = '', 
  library = [], 
  onSelectBook 
}: SearchResultsViewProps) {
  
  // 2. We double-check that library is actually an array before filtering
  const safeLibrary = Array.isArray(library) ? library : [];
  const safeQuery = query.toLowerCase();

  const filteredBooks = safeLibrary.filter(book => {
    // 3. We use optional chaining (book?.title) just in case a book object is malformed
    const titleMatch = (book?.title || '').toLowerCase().includes(safeQuery);
    const authorMatch = (book?.author || '').toLowerCase().includes(safeQuery);
    return titleMatch || authorMatch;
  });

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-neutral-100 flex items-center gap-3">
          <Search className="w-6 h-6 text-primary" />
          Search Results for "{query}"
        </h2>
        <p className="text-neutral-500">{filteredBooks.length} results found</p>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-6 gap-y-10">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book?.id || index} // Fallback key
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <BookCard 
                  id={book?.id}
                  title={book?.title || 'Unknown Title'}
                  author={book?.author || 'Unknown Author'}
                  cover={book?.cover}
                  onClick={() => onSelectBook(book)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-4">
          <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
            <Search className="w-10 h-10 opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-300">No matches found</p>
            <p className="text-sm">Try searching for something else</p>
          </div>
        </div>
      )}
    </div>
  );
}