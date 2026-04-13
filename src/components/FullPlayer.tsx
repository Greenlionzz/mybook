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
  Timer, 
  List, 
  Share2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/src/context/AudioContext';

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
  const { currentBook, isPlaying, currentTime, duration, togglePlay, skip, seek } = useAudio();
  
  const activeBook = currentBook || book;

  if (!activeBook) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          // Using 100dvh ensures it respects mobile browser UI bars perfectly
          className="fixed inset-0 bg-[#121212] z-[100] flex flex-col h-[100dvh]"
        >
          {/* Header (Fixed Height) */}
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

          {/* Main Content Area (Flexible Height) */}
          <div className="flex-1 flex flex-col items-center justify-between px-6 py-4 md:py-8 max-w-2xl mx-auto w-full min-h-0">
            
            {/* Cover Art Wrapper - This shrinks if needed! */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                // Added max-h-full so the image never breaks out of the flex container
                className="w-full h-full aspect-square max-w-[280px] max-h-[280px] md:max-w-[400px] md:max-h-[400px] relative shrink"
              >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img 
                  src={activeBook.cover} 
                  alt={activeBook.title} 
                  className="w-full h-full object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Title & Scrubber Area (Fixed Height) */}
            <div className="shrink-0 w-full flex flex-col gap-6 pt-6">
              {/* Title & Author */}
              <div className="text-center flex flex-col gap-1 md:gap-2 w-full">
                <h2 className="text-xl md:text-3xl font-bold text-neutral-100 line-clamp-2 leading-tight">
                  {activeBook.title}
                </h2>
                <div className="flex items-center justify-center gap-2 text-neutral-400 hover:text-primary cursor-pointer transition-colors">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-base md:text-lg font-medium">{activeBook.author}</span>
                </div>
              </div>

              {/* Scrubber */}
              <div className="w-full flex flex-col gap-2">
                <Slider 
                  value={[progress]} 
                  max={100} 
                  step={0.1} 
                  onValueChange={(val) => seek((val[0] / 100) * duration)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] md:text-[11px] font-mono text-neutral-500 font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full max-w-md">
                  <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white w-10 h-10 md:w-12 md:h-12">
                    <SkipBack className="w-6 h-6 md:w-7 md:h-7 fill-current" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-neutral-400 hover:text-white relative w-10 h-10 md:w-12 md:h-12"
                    onClick={() => skip(-15)}
                  >
                    <RotateCcw className="w-7 h-7 md:w-8 md:h-8" />
                    <span className="absolute text-[8px] md:text-[10px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">15</span>
                  </Button>
                  
                  <Button 
                    size="icon" 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 shrink-0"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1 md:ml-2" />
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-neutral-400 hover:text-white relative w-10 h-10 md:w-12 md:h-12"
                    onClick={() => skip(15)}
                  >
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

          {/* Footer Actions (Fixed Height) */}
          <div className="h-20 shrink-0 flex items-center justify-around px-6 border-t border-white/5 bg-black/20 pb-safe">
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
