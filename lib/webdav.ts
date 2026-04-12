import { createClient } from "webdav";

// Get saved credentials from browser storage
export const getKoofrCredentials = () => {
  return {
    url: localStorage.getItem('koofr_url') || 'https://app.koofr.net/dav/Koofr',
    user: localStorage.getItem('koofr_user') || '',
    pass: localStorage.getItem('koofr_pass') || ''
  };
};

// Test if the login actually works
export const testWebdavConnection = async (url: string, user: string, pass: string) => {
  try {
    const client = createClient(url, { username: user, password: pass });
    // Try to read the root directory
    await client.getDirectoryContents("/");
    return { success: true };
  } catch (error: any) {
    console.error("WebDAV Connection Error:", error);
    return { success: false, message: error.message };
  }
};

// Generate a URL that the HTML5 <audio> tag can stream directly
export const getDirectStreamUrl = (filePath: string) => {
  const { url, user, pass } = getKoofrCredentials();
  if (!user || !pass) return null;
  
  // Split 'https://' from the rest of the URL to inject username and password
  const urlParts = url.split('//');
  const protocol = urlParts[0];
  const domainAndPath = urlParts[1];
  
  // Safely encode special characters in email and password
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);
  
  // Ensure the file path starts with a slash
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const encodedFilePath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  
  // Returns: https://user:pass@app.koofr.net/dav/Koofr/Audiobooks/book.mp3
  return `${protocol}//${encodedUser}:${encodedPass}@${domainAndPath}${encodedFilePath}`;
};

// Fetch and format audio files from a specific Koofr directory
export const fetchCloudLibrary = async (directoryPath: string = "/") => {
  const { url, user, pass } = getKoofrCredentials();
  if (!user || !pass) return [];

  try {
    const client = createClient(url, { username: user, password: pass });
    
    // Read the contents of the directory
    const contents = await client.getDirectoryContents(directoryPath);
    
    // Filter for audio files
    const audioFiles = contents.filter((item: any) => 
      item.type === 'file' && 
      (item.basename.endsWith('.mp3') || item.basename.endsWith('.m4a') || item.basename.endsWith('.m4b'))
    );

    // Map them into your app's Book format
    return audioFiles.map((file: any, index: number) => ({
      id: file.filename,
      title: file.basename.replace(/\.[^/.]+$/, ""), // Removes the file extension for the title
      author: "Unknown Author", // WebDAV doesn't read ID3 tags by default, so we use a placeholder
      cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800", // Placeholder cover art
      description: "Audiobook streamed from Koofr.",
      status: "Unread",
      genre: "Cloud Audio",
      dateAdded: new Date(file.lastmod).toISOString(),
      audioUrl: getDirectStreamUrl(file.filename) // Injects the streamable URL we built earlier!
    }));

  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
};
