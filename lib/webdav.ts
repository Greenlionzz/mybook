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
    const response = await fetch('https://app.koofr.net/api/v2/mounts/primary/files/list?path=/', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) {
      return { success: false, message: `Server returned status ${response.status}` };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Connection Error:", error);
    return { success: false, message: error.message };
  }
};

export const fetchCloudLibrary = async (directoryPath: string = "/") => {
  const { user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  try {
    const auth = btoa(user + ':' + pass);
    const safePath = directoryPath.startsWith('/') ? directoryPath : `/${directoryPath}`;

    const response = await fetch(`https://app.koofr.net/api/v2/mounts/primary/files/list?path=${safePath}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch folder");

    const data = await response.json();
    
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
