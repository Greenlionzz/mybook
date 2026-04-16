import { CapacitorHttp } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/**
 * Gets the current configuration from localStorage.
 */
export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || '',
    proxy: localStorage.getItem('koofr_proxy') || '' 
  };
};

export const saveCustomCover = (bookId: string, coverUrl: string) => {
  const covers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  covers[bookId] = coverUrl;
  localStorage.setItem('custom_covers', JSON.stringify(covers));
  localStorage.removeItem(`koofr_library_cache`); 
};

// Save the current playback time (in seconds) for a specific book
export const saveBookProgress = (bookId: string, currentTime: number) => {
  if (!bookId || currentTime === undefined) return;
  const progress = JSON.parse(localStorage.getItem('book_progress') || '{}');
  progress[bookId] = currentTime;
  localStorage.setItem('book_progress', JSON.stringify(progress));
};

// Get the saved playback time for a specific book
export const getBookProgress = (bookId: string): number => {
  if (!bookId) return 0;
  const progress = JSON.parse(localStorage.getItem('book_progress') || '{}');
  return progress[bookId] || 0;
};

/**
 * Saves custom Title, Author, and Series to local storage.
 */
export const saveBookMetadata = (bookId: string, title: string, author: string, series: string) => {
  const meta = JSON.parse(localStorage.getItem('custom_meta') || '{}');
  meta[bookId] = { title, author, series };
  localStorage.setItem('custom_meta', JSON.stringify(meta));
  localStorage.removeItem(`koofr_library_cache`); 
};

/**
 * Generates the streaming URL using the user-defined proxy.
 */
export const getDirectStreamUrl = (fullWebdavPath: string) => {
  const { user, pass, proxy } = getKoofrCredentials();
  if (!user || !pass || !proxy) return null;
  
  const authToken = btoa(user + ':' + pass);
  const path = fullWebdavPath.startsWith('/') ? fullWebdavPath : `/${fullWebdavPath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  
  const cleanProxy = proxy.endsWith('/') ? proxy.slice(0, -1) : proxy;
  return `${cleanProxy}${encodedFilePath}?auth=${authToken}`;
};

export const testWebdavConnection = async (url: string, user: string, pass: string) => {
  try {
    const auth = btoa(user + ':' + pass);
    const response = await CapacitorHttp.get({
      url: 'https://app.koofr.net/api/v2/mounts/primary/files/list?path=/',
      headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
      responseType: 'text'
    });
    if (response.status !== 200) return { success: false, message: `Status ${response.status}` };
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const exportLibraryData = async () => {
  try {
    const data = {
      meta: localStorage.getItem('custom_meta'),
      covers: localStorage.getItem('custom_covers'),
      stats: localStorage.getItem('koofr_listening_stats'),
      proxy: localStorage.getItem('koofr_proxy'),
      progress: localStorage.getItem('book_progress'), 
      creds: {
        user: localStorage.getItem('koofr_user'),
        pass: localStorage.getItem('koofr_pass'),
        url: localStorage.getItem('koofr_url')
      }
    };
    
    const fileName = `sirin-backup-${new Date().toISOString().split('T')[0]}.json`;
    const fileContent = JSON.stringify(data, null, 2);
    const file = new File([fileContent], fileName, { type: 'application/json' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'SIRIN Backup',
        text: 'Here is your SIRIN audiobook library backup.'
      });
    } else {
      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      alert(`Export Failed!\nReason: ${error.message || JSON.stringify(error)}`);
    }
  }
};

export const importLibraryData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.meta) localStorage.setItem('custom_meta', data.meta);
    if (data.covers) localStorage.setItem('custom_covers', data.covers);
    if (data.stats) localStorage.setItem('koofr_listening_stats', data.stats);
    if (data.proxy) localStorage.setItem('koofr_proxy', data.proxy);
    if (data.progress) localStorage.setItem('book_progress', data.progress);
    if (data.creds) {
      if (data.creds.user) localStorage.setItem('koofr_user', data.creds.user);
      if (data.creds.pass) localStorage.setItem('koofr_pass', data.creds.pass);
      if (data.creds.url) localStorage.setItem('koofr_url', data.creds.url);
    }
    
    localStorage.removeItem('koofr_library_cache');
    alert("Backup restored! Please restart the app or refresh the library.");
    window.location.reload(); 
  } catch (e) {
    alert("Failed to restore backup. The file might be corrupted.");
    console.error(e);
  }
};

export const fetchCloudLibrary = async (forceRefresh: boolean = false) => {
  const CACHE_KEY = `koofr_library_cache`;
  
  if (!forceRefresh) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try { return JSON.parse(cachedData); } catch (e) { console.error(e); }
    }
  }

  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];
  
  const auth = btoa(user + ':' + pass);
  const customCovers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  const customMeta = JSON.parse(localStorage.getItem('custom_meta') || '{}');
  const defaultCover = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800";

  const isAudio = (name: string) => /\.(mp3|m4a|m4b)$/i.test(name);
  const isM4B = (name: string) => /\.m4b$/i.test(name);

  const getSmartTitle = (path: string, fileName?: string) => {
    const parts = path.split('/').filter(Boolean);
    let name = fileName ? fileName.replace(/\.[^/.]+$/, "") : (parts[parts.length - 1] || 'Unknown');
    
    if (/^(\d+|cd\s*\d+|vol\s*\d+|volume\s*\d+|part\s*\d+|book\s*\d+)$/i.test(name) && parts.length >= 2) {
       name = `${parts[parts.length - 2]} - ${name}`;
    }
    return name;
  };

  // --- 🕷️ THE SMARTER RECURSIVE SPIDER ---
  // Notice the new 'isRoot' parameter here
  const crawlKoofrDirectory = async (mountId: string, currentPath: string, webdavPrefix: string, source: string, isRoot: boolean): Promise<any[]> => {
    try {
      const response = await CapacitorHttp.get({
        url: `https://app.koofr.net/api/v2/mounts/${mountId}/files/list?path=${encodeURIComponent(currentPath)}`,
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
        responseType: 'text'
      });

      if (response.status !== 200) return [];
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      let books: any[] = [];
      
      const audioFiles = data.files.filter((item: any) => item.type === 'file' && isAudio(item.name))
                                   .sort((a: any, b: any) => a.name.localeCompare(b.name));
      const folders = data.files.filter((item: any) => item.type === 'dir');

      if (isRoot) {
        // 1. ROOT LEVEL: Every audio file here is its own standalone book
        for (const file of audioFiles) {
          const fullWebdavPath = `${webdavPrefix}${currentPath === '/' ? '' : currentPath}/${file.name}`;
          const meta = customMeta[file.name] || {}; 
          const smartTitle = getSmartTitle(currentPath, file.name);

          books.push({
            id: `${currentPath}/${file.name}`, 
            title: meta.title || smartTitle,
            author: meta.author || source,
            series: meta.series || null,
            cover: customCovers[file.name] || customCovers[currentPath] || defaultCover,
            description: isM4B(file.name) ? "Audiobook (M4B)" : "Single audio file.",
            status: "Unread",
            genre: "Cloud Audio",
            dateAdded: new Date().toISOString(),
            audioUrl: getDirectStreamUrl(fullWebdavPath)
          });
        }
      } else {
        // 2. SUBFOLDER LEVEL: Group MP3s together, but keep M4Bs standalone
        
        // A. Process M4B files (ALWAYS Standalone Books)
        const m4bFiles = audioFiles.filter((f: any) => isM4B(f.name));
        for (const file of m4bFiles) {
          const fullWebdavPath = `${webdavPrefix}${currentPath === '/' ? '' : currentPath}/${file.name}`;
          const meta = customMeta[file.name] || {}; 
          const smartTitle = getSmartTitle(currentPath, file.name);

          books.push({
            id: `${currentPath}/${file.name}`,
            title: meta.title || smartTitle,
            author: meta.author || source,
            series: meta.series || null,
            cover: customCovers[file.name] || customCovers[currentPath] || defaultCover,
            description: "Audiobook (M4B)",
            status: "Unread",
            genre: "Cloud Audio",
            dateAdded: new Date().toISOString(),
            audioUrl: getDirectStreamUrl(fullWebdavPath)
          });
        }

        // B. Process MP3/M4A files (Grouped by their parent folder)
        const partsFiles = audioFiles.filter((f: any) => !isM4B(f.name));
        if (partsFiles.length > 0) {
          const fullWebdavPathPrefix = `${webdavPrefix}${currentPath === '/' ? '' : currentPath}`;
          const meta = customMeta[currentPath] || {};
          const smartTitle = getSmartTitle(currentPath);
          const firstPartPath = `${fullWebdavPathPrefix}/${partsFiles[0].name}`;

          books.push({
            id: currentPath, 
            title: meta.title || smartTitle,
            author: meta.author || source,
            series: meta.series || null,
            cover: customCovers[currentPath] || defaultCover,
            description: `${partsFiles.length} parts found.`,
            status: "Unread",
            genre: "Cloud Audio",
            dateAdded: new Date().toISOString(),
            audioUrl: getDirectStreamUrl(firstPartPath),
            audioParts: partsFiles.map((part: any) => getDirectStreamUrl(`${fullWebdavPathPrefix}/${part.name}`))
          });
        }
      }

      // C. Dive deeper sequentially (Pass 'false' for isRoot because we are going into a folder)
      for (const folder of folders) {
        const subfolderPath = currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`;
        const deeperBooks = await crawlKoofrDirectory(mountId, subfolderPath, webdavPrefix, source, false);
        books = [...books, ...deeperBooks];
      }

      return books;
    } catch (error) {
      console.error(`Error crawling ${currentPath}:`, error);
      return [];
    }
  };

  // --- END SPIDER FUNCTION ---

  let allBooks: any[] = [];
  const locationsToScan = [
    { mountId: 'primary', path: '/Audiobooks', webdavPrefix: '/Koofr', source: 'Koofr' },
    { mountId: 'cbca00de-d02a-434b-8dae-23f2c2ac66fc', path: '/Audiobook', webdavPrefix: '/Google Drive', source: 'Google Drive' }
  ];

  for (const loc of locationsToScan) {
    try {
      // Pass 'true' for the initial scan because we are starting at the root!
      const locBooks = await crawlKoofrDirectory(loc.mountId, loc.path, loc.webdavPrefix, loc.source, true);
      allBooks = [...allBooks, ...locBooks];
    } catch (error) {
      console.error(`Error scanning ${loc.source}:`, error);
    }
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(allBooks));
  return allBooks;
};