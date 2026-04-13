import { CapacitorHttp } from '@capacitor/core';

// ---> PASTE YOUR CLOUDFLARE WORKER URL HERE <---
const PROXY_BASE_URL = 'https://odd-dawn-a77d.bagpallab48.workers.dev';

export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || ''
  };
};

export const saveCustomCover = (bookId: string, coverUrl: string) => {
  const covers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  covers[bookId] = coverUrl;
  localStorage.setItem('custom_covers', JSON.stringify(covers));
  localStorage.removeItem(`koofr_library_cache`); 
};

// NEW: Saves custom Title, Author, and Series to local storage
export const saveBookMetadata = (bookId: string, title: string, author: string, series: string) => {
  const meta = JSON.parse(localStorage.getItem('custom_meta') || '{}');
  meta[bookId] = { title, author, series };
  localStorage.setItem('custom_meta', JSON.stringify(meta));
  localStorage.removeItem(`koofr_library_cache`); 
};

export const getDirectStreamUrl = (fullWebdavPath: string) => {
  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return null;
  
  const authToken = btoa(user + ':' + pass);
  const path = fullWebdavPath.startsWith('/') ? fullWebdavPath : `/${fullWebdavPath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  
  return `${PROXY_BASE_URL}${encodedFilePath}?auth=${authToken}`;
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
  // NEW: Grab custom metadata from memory
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
      
      // Standalone Files
      const standaloneFiles = data.files.filter((item: any) => 
        item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
      );

      const standaloneBooks = standaloneFiles.map((file: any) => {
        const fullWebdavPath = `${loc.webdavPrefix}${loc.path}/${file.name}`;
        const meta = customMeta[file.name] || {}; // Pull saved tags
        return {
          id: file.name,
          title: meta.title || file.name.replace(/\.[^/.]+$/, ""),
          author: meta.author || loc.source,
          series: meta.series || null, // Add series!
          cover: customCovers[file.name] || defaultCover,
          description: "Single audio file.",
          status: "Unread",
          genre: "Cloud Audio",
          dateAdded: new Date().toISOString(),
          audioUrl: getDirectStreamUrl(fullWebdavPath)
        };
      });
      
      allBooks = [...allBooks, ...standaloneBooks];

      // Folders
      const folders = data.files.filter((item: any) => item.type === 'dir');
      const folderBooks = await Promise.all(folders.map(async (folder: any) => {
        const folderPath = `${loc.path}/${folder.name}`;
        const fullWebdavPathPrefix = `${loc.webdavPrefix}${folderPath}`;
        const meta = customMeta[folder.name] || {}; // Pull saved tags
        
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
                series: meta.series || null, // Add series!
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
