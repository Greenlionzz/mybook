import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, BookOpen, Trash2, X, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WishlistBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  notes: string;
}

export function LibraryView() {
  const [wishlist, setWishlist] = useState<WishlistBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<WishlistBook | null>(null);

  // Load wishlist from local storage when page opens
  useEffect(() => {
    const saved = localStorage.getItem('wishlist_books');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const saveWishlist = (newWishlist: WishlistBook[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('wishlist_books', JSON.stringify(newWishlist));
  };

  // Add a new book manually
  const handleAddBook = () => {
    const title = prompt("Enter book title:");
    if (!title) return;
    const author = prompt("Enter author:");
    const cover = prompt("Enter cover image URL:") || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800";
    const notes = prompt("Any notes? (e.g., 'Recommended by John', 'Releasing next month')") || "No details added.";
    
    const newBook = { id: Date.now().toString(), title, author: author || 'Unknown Author', cover, notes };
    saveWishlist([newBook, ...wishlist]);
  };

  // Remove book and close modal
  const handleRemoveBook = (id: string) => {
    saveWishlist(wishlist.filter(book => book.id !== id));
    setSelectedFolder(null); // Close modal if it was open
  };

  // Safe wrapper to close modal
  const setSelectedFolder = (val: any) => setSelectedBook(val);

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto w-full flex flex-col gap-8 relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">For Later</h2>
          <p className="text-neutral-500">Your personal wishlist of books to listen to.</p>
        </div>
        <Button onClick={handleAddBook} className="bg-primary hover:bg-primary/90 text-white font-bold gap-2">
          <Plus className="w-4 h-4" />
          Add Book
        </Button>
      </header>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
          <BookOpen className="w-16 h-16 text-neutral-500 mb-4" />
          <h3 className="text-xl font-bold text-white">Your wishlist is empty</h3>
          <p className="text-neutral-400 text-sm mt-2">Tap "Add Book" to start tracking what you want to read.</p>
        </div>
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {wishlist.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3 shadow-lg border border-white/5 bg-neutral-800 transition-transform duration-300 group-hover:-translate-y-1">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-neutral-200 line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h4>
                <p className="text-xs text-neutral-500 mt-1 truncate">{book.author}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Details Popup Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBook(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-[#1f1f1f] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Large Header Image */}
              <div className="w-full aspect-square relative bg-neutral-900">
                <img src={selectedBook.cover} alt={selectedBook.title} className="w-full h-full object-cover opacity-80" />
                
                {/* Gradient overlay to make text readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] via-[#1f1f1f]/50 to-transparent" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-full" 
                  onClick={() => setSelectedBook(null)}
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Title & Author over the image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1">
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedBook.title}</h3>
                  <p className="text-primary font-medium">{selectedBook.author}</p>
                </div>
              </div>

              {/* Details & Actions Section */}
              <div className="p-6 flex flex-col gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Details & Notes</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {selectedBook.notes}
                  </p>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full font-bold gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                  onClick={() => handleRemoveBook(selectedBook.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove from Wishlist
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
