import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  MoreHorizontal, 
  SkipBack, 
  RotateCcw, 
  Play, 
  Pause,
  RotateCw, 
  SkipForward, 
  Volume2, 
  Timer, 
  List, 
  Share2,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    title: string;
    author: string;
    cover: string;
  } | null;
}

export function FullPlayer({ isOpen, onClose, book }: FullPlayerProps) {
  if (!book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-[#121212] z-[100] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              <ChevronDown className="w-8 h-8" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Playing from Library</span>
              <span className="text-xs font-bold text-neutral-300">Demo Library</span>
            </div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="min-h-full flex flex-col items-center justify-center px-6 py-8 md:px-8 max-w-2xl mx-auto w-full gap-6 md:gap-12">
              {/* Cover Art */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full aspect-square max-w-[280px] md:max-w-[400px] relative shrink-0"
              >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Title & Author */}
              <div className="text-center flex flex-col gap-1 md:gap-2 w-full">
                <h2 className="text-xl md:text-3xl font-bold text-neutral-100 line-clamp-2 leading-tight">
                  {book.title}
                </h2>
                <div className="flex items-center justify-center gap-2 text-neutral-400 hover:text-primary cursor-pointer transition-colors">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-base md:text-lg font-medium">{book.author}</span>
                </div>
              </div>

              {/* Scrubber */}
              <div className="w-full flex flex-col gap-2">
                <Slider 
                  defaultValue={[14]} 
                  max={100} 
                  step={1} 
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] md:text-[11px] font-mono text-neutral-500 font-bold">
                  <span>07:12</span>
                  <span>-41:08</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-6 md:gap-8 w-full pb-4">
                <div className="flex items-center justify-between w-full max-w-md">
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white w-10 h-10 md:w-12 md:h-12">
                    <SkipBack className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white relative w-10 h-10 md:w-12 md:h-12">
                    <RotateCcw className="w-7 h-7 md:w-8 md:h-8" />
                    <span className="absolute text-[8px] md:text-[10px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">15</span>
                  </Button>
                  
                  <Button size="icon" className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40">
                    <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1 md:ml-2" />
                  </Button>

                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white relative w-10 h-10 md:w-12 md:h-12">
                    <RotateCw className="w-7 h-7 md:w-8 md:h-8" />
                    <span className="absolute text-[8px] md:text-[10px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">15</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white w-10 h-10 md:w-12 md:h-12">
                    <SkipForward className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="h-24 shrink-0 flex items-center justify-around px-6 border-t border-white/5 bg-black/20">
            <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-neutral-400 hover:text-white">
              <span className="text-xs font-bold">1.1x</span>
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">Speed</span>
            </Button>
            <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-neutral-400 hover:text-white">
              <Timer className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">Sleep</span>
            </Button>
            <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-neutral-400 hover:text-white">
              <List className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">Chapters</span>
            </Button>
            <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-neutral-400 hover:text-white">
              <Share2 className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider font-bold opacity-50">Share</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
