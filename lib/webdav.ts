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
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  return `${urlParts[0]}//${encodedUser}:${encodedPass}@${urlParts[1]}${encodedFilePath}`;
};

// NEW: Save a custom cover URL to the device memory and wipe the old cache
export const saveCustomCover = (bookId: string, coverUrl: string) => {
  const covers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  covers[bookId] = coverUrl;
  localStorage.setItem('custom_covers', JSON.stringify(covers));
  localStorage.removeItem(`koofr_library_cache_/Audiobooks`); // Force UI to rebuild
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

export const fetchCloudLibrary = async (directoryPath: string = "/", forceRefresh: boolean = false) => {
  const CACHE_KEY = `koofr_library_cache_${directoryPath}`;

  if (!forceRefresh) {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try { return JSON.parse(cachedData); } catch (e) { console.error(e); }
    }
  }

  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  // NEW: Load saved custom covers before scanning
  const customCovers = JSON.parse(localStorage.getItem('custom_covers') || '{}');
  const defaultCover = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800";

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

    // Standalone Files
    const standaloneFiles = data.files.filter((item: any) => 
      item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
    );

    const standaloneBooks = standaloneFiles.map((file: any) => {
      const fullPath = safePath === '/' ? `/${file.name}` : `${safePath}/${file.name}`;
      return {
        id: file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: "Cloud Library",
        cover: customCovers[file.name] || defaultCover, // Apply custom cover here!
        description: "Single audio file.",
        status: "Unread",
        genre: "Cloud Audio",
        dateAdded: new Date().toISOString(),
        audioUrl: getDirectStreamUrl(fullPath)
      };
    });
    
    allBooks = [...standaloneBooks];

    // Folders
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
              cover: customCovers[folder.name] || defaultCover, // Apply custom cover here!
              description: `${audioParts.length} parts found.`,
              status: "Unread",
              genre: "Cloud Audio",
              dateAdded: new Date().toISOString(),
              audioUrl: getDirectStreamUrl(firstPartPath),
              audioParts: audioParts.map((part: any) => getDirectStreamUrl(`${folderPath}/${part.name}`))
            };
          }
        }
      } catch (e) { }
      return null;
    }));

    allBooks = [...allBooks, ...folderBooks.filter(book => book !== null)];
    localStorage.setItem(CACHE_KEY, JSON.stringify(allBooks));
    return allBooks;

  } catch (error) {
    return [];
  }
};
