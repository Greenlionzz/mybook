import { CapacitorHttp } from '@capacitor/core';

/**
 * Gets the current configuration from localStorage.
 * This now includes the proxy URL so users can set their own.
 */
export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || '',
    proxy: localStorage.getItem('koofr_proxy') || '' // Dynamically pulled from settings
  };
};

export const saveCustomCover = (bookId: string, coverUrl: string) => {
  const covers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  covers[bookId] = coverUrl;
  localStorage.setItem('custom_covers', JSON.stringify(covers));
  localStorage.removeItem(`koofr_library_cache`); 
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
  
  // If no proxy is set, the app won't be able to bypass CORS
  if (!user || !pass || !proxy) return null;
    
  const authToken = btoa(user + ':' + pass);
  const path = fullWebdavPath.startsWith('/') ? fullWebdavPath : `/${fullWebdavPath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
    
  // Clean up proxy URL to ensure it doesn't end with a trailing slash
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

// --- Add these to the bottom of src/lib/webdav.ts ---

export const exportLibraryData = () => {
  const data = {
    meta: localStorage.getItem('custom_meta'),
    covers: localStorage.getItem('custom_covers'),
    stats: localStorage.getItem('koofr_listening_stats'),
    proxy: localStorage.getItem('koofr_proxy'),
    creds: {
      user: localStorage.getItem('koofr_user'),
      pass: localStorage.getItem('koofr_pass'),
      url: localStorage.getItem('koofr_url')
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sirin-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importLibraryData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.meta) localStorage.setItem('custom_meta', data.meta);
    if (data.covers) localStorage.setItem('custom_covers', data.covers);
    if (data.stats) localStorage.setItem('koofr_listening_stats', data.stats);
    if (data.proxy) localStorage.setItem('koofr_proxy', data.proxy);
    if (data.creds) {
      if (data.creds.user) localStorage.setItem('koofr_user', data.creds.user);
      if (data.creds.pass) localStorage.setItem('koofr_pass', data.creds.pass);
      if (data.creds.url) localStorage.setItem('koofr_url', data.creds.url);
    }
    
    // Clear cache so it rebuilds with the imported metadata
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

  let allBooks: any[] = [];

  const locationsToScan = [
    { mountId: 'primary', path: '/Audiobooks', webdavPrefix: '/Koofr', source: 'Koofr' },
    { mountId: 'cbca00de-d02a-434b-8dae-23f2c2ac66fc', path: '/Audiobook', webdavPrefix: '/Google Drive', source: 'Google Drive' }
  ];

  for (const loc of locationsToScan) {
    try {
      const response = await CapacitorHttp.get({
        url: `https://app.koofr.net/api/v2/mounts/${loc.mountId}/files/list?path=${encodeURIComponent(loc.path)}`,
        headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
        responseType: 'text'
      });

      if (response.status !== 200) continue; 
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            
      const standaloneFiles = data.files.filter((item: any) => 
        item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
      );

      const standaloneBooks = standaloneFiles.map((file: any) => {
        const fullWebdavPath = `${loc.webdavPrefix}${loc.path}/${file.name}`;
        const meta = customMeta[file.name] || {}; 
        return {
          id: file.name,
          title: meta.title || file.name.replace(/\.[^/.]+$/, ""),
          author: meta.author || loc.source,
          series: meta.series || null,
          cover: customCovers[file.name] || defaultCover,
          description: "Single audio file.",
          status: "Unread",
          genre: "Cloud Audio",
          dateAdded: new Date().toISOString(),
          audioUrl: getDirectStreamUrl(fullWebdavPath)
        };
      });
            
      allBooks = [...allBooks, ...standaloneBooks];

      const folders = data.files.filter((item: any) => item.type === 'dir');
      const folderBooks = await Promise.all(folders.map(async (folder: any) => {
        const folderPath = `${loc.path}/${folder.name}`;
        const fullWebdavPathPrefix = `${loc.webdavPrefix}${folderPath}`;
        const meta = customMeta[folder.name] || {}; 
                
        try {
          const folderRes = await CapacitorHttp.get({
            url: `https://app.koofr.net/api/v2/mounts/${loc.mountId}/files/list?path=${encodeURIComponent(folderPath)}`,
            headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
            responseType: 'text'
          });

          if (folderRes.status === 200) {
            const folderData = typeof folderRes.data === 'string' ? JSON.parse(folderRes.data) : folderRes.data;
            const audioParts = folderData.files.filter((item: any) => 
              item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
            ).sort((a: any, b: any) => a.name.localeCompare(b.name));

            if (audioParts.length > 0) {
              const firstPartPath = `${fullWebdavPathPrefix}/${audioParts[0].name}`;
              return {
                id: folder.name,
                title: meta.title || folder.name,
                author: meta.author || loc.source,
                series: meta.series || null,
                cover: customCovers[folder.name] || defaultCover,
                description: `${audioParts.length} parts found.`,
                status: "Unread",
                genre: "Cloud Audio",
                dateAdded: new Date().toISOString(),
                audioUrl: getDirectStreamUrl(firstPartPath),
                audioParts: audioParts.map((part: any) => getDirectStreamUrl(`${fullWebdavPathPrefix}/${part.name}`))
              };
            }
          }
        } catch (e) { }
        return null;
      }));

      allBooks = [...allBooks, ...folderBooks.filter(book => book !== null)];
    } catch (error) {
      console.error(`Error scanning ${loc.source}:`, error);
    }
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(allBooks));
  return allBooks;
};