import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, ChevronRight, Layers, Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SERIES_DATA = [
  {
    id: 's1',
    title: 'The Dostoevsky Collection',
    author: 'Fyodor Dostoevsky',
    totalBooks: 5,
    completedBooks: 2,
    covers: [
      'https://picsum.photos/seed/brothers/200/300',
      'https://picsum.photos/seed/crime/200/300',
      'https://picsum.photos/seed/idiot/200/300',
    ]
  },
  {
    id: 's2',
    title: 'Voyages Extraordinaires',
    author: 'Jules Verne',
    totalBooks: 54,
    completedBooks: 12,
    covers: [
      'https://picsum.photos/seed/center/200/300',
      'https://picsum.photos/seed/sea/200/300',
      'https://picsum.photos/seed/balloon/200/300',
    ]
  },
  {
    id: 's3',
    title: 'The Scientific Romances',
    author: 'H. G. Wells',
    totalBooks: 8,
    completedBooks: 3,
    covers: [
      'https://picsum.photos/seed/war/200/300',
      'https://picsum.photos/seed/time/200/300',
      'https://picsum.photos/seed/island/200/300',
    ]
  },
  {
    id: 's4',
    title: 'The Oz Books',
    author: 'L. Frank Baum',
    totalBooks: 14,
    completedBooks: 1,
    covers: [
      'https://picsum.photos/seed/oz/200/300',
      'https://picsum.photos/seed/land/200/300',
      'https://picsum.photos/seed/emerald/200/300',
    ]
  }
];

interface SeriesViewProps {
  onSelectSeries: (series: any) => void;
}

export function SeriesView({ onSelectSeries }: SeriesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const filteredAndSortedSeries = useMemo(() => {
    let result = SERIES_DATA.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'author') {
      result.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === 'progress') {
      result.sort((a, b) => (b.completedBooks / b.totalBooks) - (a.completedBooks / a.totalBooks));
    }

    return result;
  }, [searchQuery, sortBy]);

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold text-neutral-100">Series</h2>
          <p className="text-neutral-500">Your collections and multi-part journeys.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input 
              placeholder="Search series..." 
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
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedSeries.map((series, index) => (
            <motion.div
              key={series.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectSeries(series)}
              className="cursor-pointer"
            >
            <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden hover:bg-[#252525] transition-colors group">
              <div className="flex flex-col sm:flex-row items-center p-4 gap-6">
                
                {/* Overlapping Covers Stack */}
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  {series.covers.map((cover, i) => (
                    <div 
                      key={i}
                      className="absolute rounded-md overflow-hidden shadow-2xl border border-white/10 transition-transform duration-500 group-hover:translate-y-[-4px]"
                      style={{
                        width: '100px',
                        height: '100px',
                        zIndex: 3 - i,
                        transform: `translateX(${(i - 1) * 15}px) translateY(${i * 4}px) rotate(${(i - 1) * 5}deg)`,
                        opacity: 1 - (i * 0.2)
                      }}
                    >
                      <img 
                        src={cover} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>

                {/* Series Info */}
                <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-primary">
                    <Layers className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Series Collection</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-100 group-hover:text-primary transition-colors">
                    {series.title}
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">
                    {series.author}
                  </p>
                  
                  <div className="mt-4 flex flex-col gap-2 max-w-xs mx-auto sm:mx-0">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                      <span>Progress</span>
                      <span>Book {series.completedBooks + 1} of {series.totalBooks}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(series.completedBooks / series.totalBooks) * 100}%` }}
                        className="h-full bg-primary" 
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-6 py-6 rounded-xl flex items-center gap-3 group/btn">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase tracking-widest opacity-70">Next Up</span>
                      <span>Continue Series</span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

      {/* Empty State / Footer */}
      <div className="flex flex-col items-center justify-center py-12 border-t border-white/5">
        <p className="text-xs text-neutral-600 font-medium">Showing {filteredAndSortedSeries.length} active series in your library.</p>
      </div>
    </div>
  );
}
