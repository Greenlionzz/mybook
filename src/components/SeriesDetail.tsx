import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen,
  Share2,
  MoreVertical,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SeriesDetailProps {
  series: {
    id: string;
    title: string;
    author: string;
    totalBooks: number;
    completedBooks: number;
    covers: string[];
  } | null;
  onClose: () => void;
}

// Mock data for books within a series
const SERIES_BOOKS = [
  { id: 'b1', title: 'Book 1: The Beginning', duration: '12h 45m', status: 'completed', cover: 'https://picsum.photos/seed/1/200/300' },
  { id: 'b2', title: 'Book 2: The Rising Tide', duration: '10h 20m', status: 'completed', cover: 'https://picsum.photos/seed/2/200/300' },
  { id: 'b3', title: 'Book 3: The Silent Path', duration: '14h 10m', status: 'reading', cover: 'https://picsum.photos/seed/3/200/300' },
  { id: 'b4', title: 'Book 4: Echoes of Time', duration: '11h 55m', status: 'unread', cover: 'https://picsum.photos/seed/4/200/300' },
  { id: 'b5', title: 'Book 5: The Final Chapter', duration: '13h 30m', status: 'unread', cover: 'https://picsum.photos/seed/5/200/300' },
];

export function SeriesDetail({ series, onClose }: SeriesDetailProps) {
  if (!series) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full bg-[#1a1a1a]"
    >
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-20">
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="text-neutral-400 hover:text-white gap-2 pl-0"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Back to Series</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-12">
          
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="relative w-48 h-48 shrink-0">
              {series.covers.slice(0, 3).map((cover, i) => (
                <div 
                  key={i}
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  style={{
                    zIndex: 3 - i,
                    transform: `translateX(${i * 12}px) translateY(${i * -12}px)`,
                    opacity: 1 - (i * 0.2)
                  }}
                >
                  <img src={cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Series Collection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-neutral-100 tracking-tight">
                {series.title}
              </h1>
              <p className="text-xl text-neutral-400 font-medium">By {series.author}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Total Books</span>
                  <span className="text-xl font-bold text-neutral-200">{series.totalBooks}</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Completed</span>
                  <span className="text-xl font-bold text-primary">{series.completedBooks}</span>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Progress</span>
                  <span className="text-xl font-bold text-neutral-200">{Math.round((series.completedBooks / series.totalBooks) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Books List */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-100">Books in Series</h2>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                <Play className="w-4 h-4 fill-current" />
                Resume Series
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {SERIES_BOOKS.map((book, index) => (
                <Card 
                  key={book.id} 
                  className="bg-[#1f1f1f] border-white/5 hover:bg-[#252525] transition-colors cursor-pointer group"
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="text-neutral-500 font-mono text-sm w-6 text-center font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-white/5">
                      <img src={book.cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-100 truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {book.duration}
                        </div>
                        {book.status === 'completed' && (
                          <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </div>
                        )}
                        {book.status === 'reading' && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            <BookOpen className="w-3 h-3" />
                            Reading
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4">
                      {book.status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white">
                          <Play className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* About the Series */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-neutral-100">About the Series</h2>
            <p className="text-neutral-400 leading-relaxed">
              This collection brings together the most influential works of {series.author}. 
              Spanning across multiple volumes, the series explores deep philosophical themes, 
              intricate character developments, and the human condition in a way that has 
              captivated readers for generations. Each book builds upon the last, creating a 
              rich tapestry of narrative that is best experienced in chronological order.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
