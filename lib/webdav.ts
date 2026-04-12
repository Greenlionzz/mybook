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
