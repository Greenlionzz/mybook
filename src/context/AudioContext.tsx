import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveBookProgress, getBookProgress } from '@/lib/webdav';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  status: string;
  genre: string;
  dateAdded: string;
  audioUrl?: string; // Added to hold the direct stream URL from Koofr/WebDAV
}

interface AudioContextType {
  currentBook: Book | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playBook: (book: Book) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Initialize Audio Element & Basic Listeners
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // 2. NEW: Save Progress Periodically
  useEffect(() => {
    if (!currentBook || !audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Save the time every 5 seconds while playing
    const progressInterval = setInterval(() => {
      if (!audio.paused && audio.currentTime > 0) {
        saveBookProgress(currentBook.id, audio.currentTime);
      }
    }, 5000);

    // Clean up interval and save one final time when switching books or closing app
    return () => {
      clearInterval(progressInterval);
      saveBookProgress(currentBook.id, audio.currentTime);
    };
  }, [currentBook]);

  // 3. Media Session Setup (Lock screen controls)
  useEffect(() => {
    if (currentBook && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentBook.title,
        artist: currentBook.author,
        artwork: [
          { src: currentBook.cover, sizes: '96x96', type: 'image/png' },
          { src: currentBook.cover, sizes: '128x128', type: 'image/png' },
          { src: currentBook.cover, sizes: '192x192', type: 'image/png' },
          { src: currentBook.cover, sizes: '256x256', type: 'image/png' },
          { src: currentBook.cover, sizes: '384x384', type: 'image/png' },
          { src: currentBook.cover, sizes: '512x512', type: 'image/png' },
        ]
      });
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
    }
  }, [currentBook]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // 4. Play Book & Load Progress
  const playBook = (book: Book) => {
    if (!audioRef.current) return;

    if (currentBook?.id !== book.id) {
      // 1. Save current book's progress before switching
      if (currentBook) {
        saveBookProgress(currentBook.id, audioRef.current.currentTime);
      }

      setCurrentBook(book);
      const audio = audioRef.current;
      
      // 2. Pause and swap the source
      audio.pause();
      audio.src = book.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      const savedTime = getBookProgress(book.id);

      // 3. THE BULLETPROOF SEEK LOGIC
      const onReadyToPlay = () => {
        if (savedTime > 0) {
          audio.currentTime = savedTime;
          setCurrentTime(savedTime); // Update the React UI instantly
        }
        audio.play();
        setIsPlaying(true);
        
        // Remove listener so it doesn't fire randomly during playback
        audio.removeEventListener('canplay', onReadyToPlay);
      };

      // Listen for 'canplay' instead of 'loadedmetadata'
      audio.addEventListener('canplay', onReadyToPlay);
      
      // 4. Force Android to fetch the stream (Crucial for Capacitor!)
      audio.load();

    } else {
      togglePlay();
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentBook) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  return (
    <AudioContext.Provider value={{ 
       currentBook, 
       isPlaying, 
       currentTime, 
       duration, 
       playBook, 
       togglePlay, 
       seek, 
       skip 
     }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};