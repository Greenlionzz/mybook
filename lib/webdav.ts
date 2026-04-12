import { CapacitorHttp } from '@capacitor/core';

export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || ''
  };
};

export const getDirectStreamUrl = (filePath: string) => {
  const { url, user, pass } = getKoofrCredentials();
  if (!user || !pass) return null;
  
  const urlParts = url.split('//');
  const protocol = urlParts[0];
  const domainAndPath = urlParts[1];
  
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);
  
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  
  return `${protocol}//${encodedUser}:${encodedPass}@${domainAndPath}${encodedFilePath}`;
};

export const testWebdavConnection = async (url: string, user: string, pass: string) => {
  try {
    const auth = btoa(user + ':' + pass);
    const response = await CapacitorHttp.get({
      url: 'https://app.koofr.net/api/v2/mounts/primary/files/list?path=/',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      responseType: 'text'
    });

    if (response.status !== 200) {
      return { success: false, message: `Server rejected credentials (Status ${response.status}).` };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Connection Error:", error);
    return { success: false, message: error.message };
  }
};

// Upgraded Deep-Scan Library Fetcher WITH CACHING
export const fetchCloudLibrary = async (directoryPath: string = "/", forceRefresh: boolean = false) => {
  const CACHE_KEY = `koofr_library_cache_${directoryPath}`;

  // 1. If we aren't forcing a refresh, check the cache first!
  if (!forceRefresh) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        return JSON.parse(cachedData); // Return instantly!
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
  }

  // 2. If forced refresh or no cache, scan Koofr...
  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  try {
    const auth = btoa(user + ':' + pass);
    const safePath = directoryPath.startsWith('/') ? directoryPath : `/${directoryPath}`;

    const response = await CapacitorHttp.get({
      url: `https://app.koofr.net/api/v2/mounts/primary/files/list?path=${safePath}`,
      headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
      responseType: 'text'
    });

    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    let allBooks: any[] = [];

    // Handle Standalone Files
    const standaloneFiles = data.files.filter((item: any) => 
      item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
    );

    const standaloneBooks = standaloneFiles.map((file: any) => {
      const fullPath = safePath === '/' ? `/${file.name}` : `${safePath}/${file.name}`;
      return {
        id: file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: "Cloud Library",
        cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
        description: "Single audio file.",
        status: "Unread",
        genre: "Cloud Audio",
        dateAdded: new Date().toISOString(),
        audioUrl: getDirectStreamUrl(fullPath)
      };
    });
    
    allBooks = [...standaloneBooks];

    // Handle Folders
    const folders = data.files.filter((item: any) => item.type === 'dir');
    const folderBooks = await Promise.all(folders.map(async (folder: any) => {
      const folderPath = safePath === '/' ? `/${folder.name}` : `${safePath}/${folder.name}`;
      
      try {
        const folderRes = await CapacitorHttp.get({
          url: `https://app.koofr.net/api/v2/mounts/primary/files/list?path=${folderPath}`,
          headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
          responseType: 'text'
        });

        if (folderRes.status === 200) {
          const folderData = typeof folderRes.data === 'string' ? JSON.parse(folderRes.data) : folderRes.data;
          
          const audioParts = folderData.files.filter((item: any) => 
            item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
          ).sort((a: any, b: any) => a.name.localeCompare(b.name));

          if (audioParts.length > 0) {
            const firstPartPath = `${folderPath}/${audioParts[0].name}`;
            return {
              id: folder.name,
              title: folder.name,
              author: "Cloud Library",
              cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
              description: `${audioParts.length} parts found inside.`,
              status: "Unread",
              genre: "Cloud Audio",
              dateAdded: new Date().toISOString(),
              audioUrl: getDirectStreamUrl(firstPartPath),
              audioParts: audioParts.map((part: any) => getDirectStreamUrl(`${folderPath}/${part.name}`))
            };
          }
        }
      } catch (e) {
         console.error(`Failed to scan folder: ${folder.name}`);
      }
      return null;
    }));

    allBooks = [...allBooks, ...folderBooks.filter(book => book !== null)];

    // 3. Save the final list to cache before returning!
    localStorage.setItem(CACHE_KEY, JSON.stringify(allBooks));

    return allBooks;

  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};
