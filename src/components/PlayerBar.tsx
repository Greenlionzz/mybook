import { 
  SkipBack, 
  RotateCcw, 
  Play, 
  Pause,
  RotateCw, 
  SkipForward, 
  Volume2, 
  Timer, 
  Bookmark, 
  List, 
  AlignJustify, 
  Moon,
  X,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudio } from '@/src/context/AudioContext';

interface PlayerBarProps {
  onOpenFullPlayer?: () => void;
  onClose?: () => void;
}

export function PlayerBar({ onOpenFullPlayer, onClose }: PlayerBarProps) {
  const { currentBook, isPlaying, currentTime, duration, togglePlay, skip, seek } = useAudio();
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);

  if (!currentBook) return null;

  const timerOptions = [
    { label: 'Off', value: null },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: 'End of Chapter', value: 0 },
  ];

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1f1f1f] border-t border-white/5 z-50 select-none">
      <div className="flex items-center justify-between px-4 py-2 h-16 md:h-20">
        {/* Left: Book Info - Clickable to open full player */}
        <div 
          className="flex items-center gap-3 md:gap-4 w-1/2 md:w-1/3 cursor-pointer hover:bg-white/5 transition-colors p-1 rounded-lg"
          onClick={onOpenFullPlayer}
        >
          <img 
            src={currentBook.cover} 
            alt={currentBook.title} 
            className="w-10 h-10 md:w-12 md:h-12 rounded shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm font-semibold truncate text-neutral-100">{currentBook.title}</span>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-neutral-400">
              <User className="w-3 h-3" />
              <span className="truncate">{currentBook.author}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-1 w-auto md:w-1/3">
          <div className="flex items-center gap-2 md:gap-6">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden sm:flex">
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white relative"
              onClick={() => skip(-15)}
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute text-[7px] md:text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5">15</span>
            </Button>
            <Button 
              size="icon" 
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-400 hover:text-white relative"
              onClick={() => skip(15)}
            >
              <RotateCw className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute text-[7px] md:text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5">15</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden sm:flex">
              <SkipForward className="w-5 h-5 fill-current" />
            </Button>
            <span className="text-[10px] md:text-xs font-bold text-neutral-400 ml-1 md:ml-2">1.0X</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-0.5 md:gap-1 w-auto md:w-1/3">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden lg:flex">
            <Volume2 className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`text-neutral-400 hover:text-white hidden lg:flex ${activeTimer !== null ? 'text-primary' : ''}`}
              onClick={() => setShowSleepTimer(!showSleepTimer)}
            >
              <Timer className="w-5 h-5" />
            </Button>
            
            <AnimatePresence>
              {showSleepTimer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-4 w-48 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                >
                  <div className="p-3 border-b border-white/5 bg-black/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Sleep Timer</span>
                  </div>
                  <div className="p-1">
                    {timerOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setActiveTimer(option.value);
                          setShowSleepTimer(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5 flex items-center justify-between ${activeTimer === option.value ? 'text-primary bg-primary/5' : 'text-neutral-300'}`}
                      >
                        {option.label}
                        {activeTimer === option.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden md:flex">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden md:flex">
            <List className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white hidden sm:flex">
            <AlignJustify className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
            <Moon className="w-5 h-5" />
          </Button>
          <div className="w-2 md:w-4" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        <div 
          className="h-1 bg-white/10 w-full relative group cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seek(percentage * duration);
          }}
        >
          <div className="absolute top-0 left-0 h-full bg-white/20 w-full" />
          <div 
            className="absolute top-0 left-0 h-full bg-primary group-hover:h-1.5 transition-all" 
            style={{ width: `${progress}%` }}
          />
          
          {/* Chapter Markers */}
          <div className="absolute top-0 left-1/4 h-full w-[1px] bg-black/40" />
          <div className="absolute top-0 left-[45%] h-full w-[1px] bg-black/40" />
          <div className="absolute top-0 left-[60%] h-full w-[1px] bg-black/40" />
          <div className="absolute top-0 left-[85%] h-full w-[1px] bg-black/40" />
        </div>
        
        {/* Time Info */}
        <div className="flex justify-between px-3 py-0.5 text-[9px] md:text-[10px] text-neutral-500 font-mono bg-black/20">
          <span>{formatTime(currentTime)} / {Math.round(progress)}%</span>
          <span className="uppercase tracking-[0.2em] font-bold text-neutral-400">Chapter 2</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </div>
      </div>
    </div>
  );
}
