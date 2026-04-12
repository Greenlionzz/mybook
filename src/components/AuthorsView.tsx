import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, BookOpen, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKS } from '@/src/constants';

export function AuthorsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Derive authors from BOOKS constant
  const authors = useMemo(() => {
    const authorMap = new Map<string, { name: string; bookCount: number; avatar: string }>();
    
    BOOKS.forEach(book => {
      const authorNames = book.author.split(',').map(a => a.trim());
      authorNames.forEach(name => {
        const existing = authorMap.get(name);
        if (existing) {
          existing.bookCount += 1;
        } else {
          authorMap.set(name, {
            name,
            bookCount: 1,
            avatar: `https://picsum.photos/seed/${name}/200/200`
          });
        }
      });
    });

    const authorList = Array.from(authorMap.values());
    
    if (sortBy === 'name') {
      return authorList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'count') {
      return authorList.sort((a, b) => b.bookCount - a.bookCount);
    }
    
    return authorList;
  }, [sortBy]);

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Search Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">Authors</h2>
          <p className="text-neutral-500">Browse your library by your favorite writers.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input 
              placeholder="Search authors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1f1f1f] border-white/5 pl-10 focus-visible:ring-1 focus-visible:ring-primary h-11"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <ArrowUpDown className="w-3 h-3" />
              Sort By
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-11 bg-[#1f1f1f] border-white/5 text-sm focus:ring-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="count">Book Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredAuthors.map((author, index) => (
            <motion.div
              key={author.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.2,
                delay: index * 0.05
              }}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-white/5 group-hover:border-primary/50 transition-colors duration-300">
                  <AvatarImage src={author.avatar} alt={author.name} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-neutral-800">
                    <User className="w-8 h-8 text-neutral-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              
              <h3 className="font-bold text-neutral-100 group-hover:text-primary transition-colors line-clamp-1">
                {author.name}
              </h3>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
                {author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAuthors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <User className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No authors found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
