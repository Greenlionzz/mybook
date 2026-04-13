import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Play,
  Pause, 
  CheckCircle2, 
  BookOpen,
  Share2,
  MoreVertical,
  Layers,
  Disc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAudio } from '@/src/context/AudioContext';

interface SeriesDetailProps {
  series: {
    id: string;
    title: string;
    author: string;
    totalBooks: number;
    completedBooks: number;
    covers: string[];
    books: any[]; // The actual books passed from SeriesView!
  } | null;
  onClose: () => void;
}

export function SeriesDetail({ series, onClose }: SeriesDetailProps) {
  const { currentBook, isPlaying, playBook, togglePlay } = useAudio();

  if (!series) return null;

  const handlePlayBook = (book: any) => {
    // If it's a folder, play the first part by default
    if (book.audioParts && book.audioParts.length > 0) {
      const uniquePartId = `${book.id}-part-0`;
      const partBook = {
        ...book,
        id: uniquePartId,
        title: `${book.title} (Part 1)`,
        audioUrl: book.audioParts[0]
      };
      
      if (currentBook?.id === uniquePartId) {
        togglePlay();
      } else {
        playBook(partBook);
      }
    } else {
      // Single file fallback
      const singleFileId = `${book.id}-part-0`;
      if (currentBook?.id === singleFileId) {
        togglePlay();
      } else {
        playBook({ ...book, id: singleFileId, audioUrl: book.audioUrl });
      }
    }
  };

  const handleResumeSeries = () => {
    if (series.books.length > 0) {
      handlePlayBook(series.books[0]);
    }
  };

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
            <div className="relative w-48 h-48 shrink-0 ml-4">
              {series.covers.map((cover, i) => (
                <div 
                  key={i}
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  style={{
                    zIndex: 3 - i,
                    transform: `translateX(${i * -12}px) translateY(${i * 12}px)`,
                    opacity: 1 - (i * 0.2)
                  }}
                >
                  <img src={cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 text-center md:text-left flex-1 mt-4 md:mt-0">
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
                  <span className="text-xl font-bold text-neutral-200">
                    {series.totalBooks > 0 ? Math.round((series.completedBooks / series.totalBooks) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Books List */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-100">Books in Series</h2>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                onClick={handleResumeSeries}
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Series
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {series.books.map((book, index) => {
                const isThisBookPlaying = currentBook?.id.startsWith(book.id) && isPlaying;

                return (
                  <Card 
                    key={book.id} 
                    className="bg-[#1f1f1f] border-white/5 hover:bg-[#252525] transition-colors cursor-pointer group"
                    onClick={() => handlePlayBook(book)}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="text-neutral-500 font-mono text-sm w-6 text-center font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-white/5">
                        <img src={book.cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold truncate transition-colors ${isThisBookPlaying ? 'text-primary' : 'text-neutral-100 group-hover:text-primary'}`}>
                          {book.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            <Disc className="w-3 h-3" />
                            {book.audioParts ? `${book.audioParts.length} Parts` : 'Single File'}
                          </div>
                          {isThisBookPlaying && (
                            <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                              <BookOpen className="w-3 h-3" />
                              Now Playing
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-4 pr-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`${isThisBookPlaying ? 'text-primary' : 'text-neutral-500 hover:text-white'}`}
                        >
                          {isThisBookPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* About the Series */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-neutral-100">About the Series</h2>
            <p className="text-neutral-400 leading-relaxed">
              This collection brings together the works of {series.author}. 
              Spanning across multiple volumes, the series explores deep themes, 
              intricate developments, and narratives in a way that captivates listeners. 
              Each book builds upon the last, creating a rich tapestry of audio that is best experienced in chronological order.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
