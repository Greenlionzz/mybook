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

// Upgraded Deep-Scan Library Fetcher
export const fetchCloudLibrary = async (directoryPath: string = "/") => {
  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  try {
    const auth = btoa(user + ':' + pass);
    const safePath = directoryPath.startsWith('/') ? directoryPath : `/${directoryPath}`;

    // 1. Look at the main folder (e.g., /Audiobooks)
    const response = await CapacitorHttp.get({
      url: `https://app.koofr.net/api/v2/mounts/primary/files/list?path=${safePath}`,
      headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
      responseType: 'text'
    });

    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    let allBooks: any[] = [];

    // 2. Handle Standalone Files (If you have any random MP3s lying around)
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

    // 3. Handle Folders (Deep Scan)
    const folders = data.files.filter((item: any) => item.type === 'dir');

    // Make the app look inside every folder simultaneously
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
          
          // Find all audio files in the folder and SORT them alphabetically so Part 1 is first
          const audioParts = folderData.files.filter((item: any) => 
            item.type === 'file' && (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
          ).sort((a: any, b: any) => a.name.localeCompare(b.name));

          if (audioParts.length > 0) {
            // Treat the folder itself as the "Book"
            const firstPartPath = `${folderPath}/${audioParts[0].name}`;
            
            return {
              id: folder.name,
              title: folder.name, // Using folder name as book title
              author: "Cloud Library",
              cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
              description: `${audioParts.length} parts found inside.`,
              status: "Unread",
              genre: "Cloud Audio",
              dateAdded: new Date().toISOString(),
              // Stream the very first part immediately when clicked
              audioUrl: getDirectStreamUrl(firstPartPath),
              // Save the rest of the parts for continuous playback later
              audioParts: audioParts.map((part: any) => getDirectStreamUrl(`${folderPath}/${part.name}`))
            };
          }
        }
      } catch (e) {
         console.error(`Failed to scan folder: ${folder.name}`);
      }
      return null;
    }));

    // Filter out empty folders and add the valid books to the library
    const validFolderBooks = folderBooks.filter(book => book !== null);
    allBooks = [...allBooks, ...validFolderBooks];

    return allBooks;

  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};
