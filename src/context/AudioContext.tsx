import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Initialize audio element
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

  const playBook = (book: Book) => {
    if (!audioRef.current) return;

    if (currentBook?.id !== book.id) {
      setCurrentBook(book);
      // It will use your cloud stream if provided, otherwise default to the demo track
      audioRef.current.src = book.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      audioRef.current.play();
      setIsPlaying(true);
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
