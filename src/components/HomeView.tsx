import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Flame, 
  Clock, 
  ChevronRight, 
  Plus, 
  History,
  TrendingUp,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BOOKS } from '@/src/constants';

export function HomeView() {
  const currentlyPlaying = BOOKS[6]; // The Call of the Wild
  const recentlyAdded = BOOKS.slice(0, 8);
  const upNext = BOOKS.slice(8, 11);

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto w-full flex flex-col gap-10">
      {/* Hero & Daily Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Listening Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-[#1f1f1f] border-white/5 overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={currentlyPlaying.cover} 
                  alt={currentlyPlaying.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Continue Listening</span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-4xl font-black text-neutral-100 tracking-tight line-clamp-2">
                    {currentlyPlaying.title}
                  </h2>
                  <p className="text-lg text-neutral-400 font-medium">{currentlyPlaying.author}</p>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <span>52:28 / 1:45:00</span>
                    <span>49% Complete</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '49%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                    />
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-xl mt-2 w-full md:w-fit gap-3 group/btn shadow-xl shadow-primary/20">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="text-lg">Resume Playback</span>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Goal Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1f1f1f] border-white/5 h-full flex flex-col p-6 items-center justify-center text-center gap-6 group">
            <div className="relative w-32 h-32">
              {/* Circular Progress Background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-neutral-800"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 * (1 - 15/30) }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-neutral-100">15</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">/ 30 min</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-neutral-100">Daily Goal</h3>
              <p className="text-xs text-neutral-500">You're halfway there today!</p>
            </div>

            <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-neutral-100">12 Day Streak</p>
                  <p className="text-[10px] text-neutral-500">Personal Best!</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recently Added Row */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <Plus className="w-5 h-5" />
            <h3 className="text-lg font-bold uppercase tracking-widest text-sm">Recently Added</h3>
          </div>
          <Button variant="ghost" className="text-xs font-bold text-primary hover:text-primary/80 hover:bg-primary/5">
            VIEW ALL
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar -mx-2 px-2">
          {recentlyAdded.map((book, i) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-32 md:w-40 shrink-0 group cursor-pointer"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg border border-white/5 group-hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="text-sm font-bold text-neutral-200 line-clamp-1 group-hover:text-primary transition-colors">
                {book.title}
              </h4>
              <p className="text-xs text-neutral-500 truncate">{book.author}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Up Next Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-neutral-400">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-bold uppercase tracking-widest text-sm">Up Next</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upNext.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-[#1f1f1f] border-white/5 hover:bg-[#252525] transition-colors cursor-pointer group p-3">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-white/5">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral-100 truncate group-hover:text-primary transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <BookOpen className="w-3 h-3 text-neutral-600" />
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Queued</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-neutral-600 group-hover:text-primary">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
