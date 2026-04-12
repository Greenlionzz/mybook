import { CapacitorHttp } from '@capacitor/core';

export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || ''
  };
};

// Generate the direct WebDAV streaming URL for the <audio> tag
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

// Test Connection using explicit CapacitorHttp
export const testWebdavConnection = async (url: string, user: string, pass: string) => {
  try {
    const auth = btoa(user + ':' + pass);
    
    // Bypassing fetch() to avoid the JSON parse crash
    const response = await CapacitorHttp.get({
      url: 'https://app.koofr.net/api/v2/mounts/primary/files/list?path=/',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      responseType: 'text' // Forces Capacitor to stop guessing and crashing
    });

    if (response.status !== 200) {
      return { success: false, message: `Server rejected credentials (Status ${response.status}). Check your App Password.` };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Connection Error:", error);
    return { success: false, message: error.message };
  }
};

// Fetch Library using explicit CapacitorHttp
export const fetchCloudLibrary = async (directoryPath: string = "/") => {
  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  try {
    const auth = btoa(user + ':' + pass);
    const safePath = directoryPath.startsWith('/') ? directoryPath : `/${directoryPath}`;

    const response = await CapacitorHttp.get({
      url: `https://app.koofr.net/api/v2/mounts/primary/files/list?path=${safePath}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      },
      responseType: 'text'
    });

    if (response.status !== 200) throw new Error(`Status ${response.status}`);

    // Parse the JSON safely ourselves
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    const audioFiles = data.files.filter((item: any) => 
      item.type === 'file' && 
      (item.name.endsWith('.mp3') || item.name.endsWith('.m4a') || item.name.endsWith('.m4b'))
    );

    return audioFiles.map((file: any) => {
      const fullPath = safePath === '/' ? `/${file.name}` : `${safePath}/${file.name}`;
      
      return {
        id: file.name,
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: "Cloud Library",
        cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
        description: "Audiobook streamed from Koofr.",
        status: "Unread",
        genre: "Cloud Audio",
        dateAdded: new Date().toISOString(),
        audioUrl: getDirectStreamUrl(fullPath)
      };
    });

  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};
