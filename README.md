# SIRIN 🕊️

**SIRIN** is a premium, high-performance audiobook player built with React 19, Tailwind CSS 4, and Capacitor. Designed for the self-hosting enthusiast, SIRIN streams your library directly from **Koofr** or **Google Drive** without the need for complex server setups like Audiobookshelf or Jellyfin.

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-6-cyan)

## 📸 Gallery

### 🏠 Dashboard & Stats
<p align="center">
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_232950_SIRIN.jpg" width="48%" alt="Home Dashboard" />
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233132_SIRIN.jpg" width="48%" alt="Listening Statistics" />
</p>

### 📚 Library & Organization
<p align="center">
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233004_SIRIN.jpg" width="32%" alt="Library View" />
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233102_SIRIN.jpg" width="32%" alt="Series View" />
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233111_SIRIN.jpg" width="32%" alt="Authors View" />
</p>

### 🎧 Player Experience
<p align="center">
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233052_SIRIN.jpg" width="32%" alt="Book Details" />
  <img src="https://raw.githubusercontent.com/Greenlionzz/mybook/main/screenshots/Screenshot_20260413_233122_SIRIN.jpg" width="32%" alt="Full Player UI" />
  <img src="screenshots/Screenshot_20260413_234557_SIRIN.jpg" width="32%" alt="Player Controls" />
</p>

---

## ✨ Features

* **Cloud Native:** No local storage needed. Stream your books directly from the cloud.
* **Deep Scanner:** Automatically detects multi-part folders and standalone audio files.
* **Metadata Editor:** Manually tag Authors and Series directly in-app to organize your library.
* **Collections & Series:** Beautifully grouped views for series with progress tracking and overlapping cover stacks.
* **Live Listening Stats:** Real-time tracking of daily goals, streaks, and lifetime listening hours.
* **Immersive Experience:** Full-screen, edge-to-edge UI designed for tablets and mobile devices.
* **Privacy First:** All credentials and metadata stay on your device. No third-party tracking.
## Note
* some buttons, options are just placeholders. i am not a developer, rather i am an mbbs student, i made it with help of gemini on my tablet, i needed an app which can play audiobooks from cloud gdrive and koofr, but i cant find any good app, i cloned audiobookshelf ui, the app name is still audiobookshelf :). Gemini hallucinated, cant change the app name.I cant manage to connect gdrive directly, so i connected gdrive with koofr instead. It needs more improvement, if anyone can help, would be very helpful
---

## 🚀 Getting Started

---

### 1. The CORS Proxy (Required)
To stream audio directly from Koofr to a web/mobile app, you need a proxy to bypass CORS restrictions. The easiest way is using a free **Cloudflare Worker**.

1. Create a free [Cloudflare Worker](https://workers.cloudflare.com/).
2. Paste the following script into your Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetPath = url.pathname
  const authHeader = url.searchParams.get('auth')

  // Maps to your Koofr WebDAV endpoint
  const targetUrl = '[https://app.koofr.net/dav](https://app.koofr.net/dav)' + targetPath

  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      'Authorization': 'Basic ' + authHeader,
    }
  })

  const response = await fetch(newRequest)
  const newResponse = new Response(response.body, response)
  
  // Necessary headers for streaming and CORS
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', 'Authorization')
  
  return newResponse
}

---

# 🛠️ Configuration

Once the app is running:

1. Go to **Settings**.
2. Enter your **Koofr Username** and **App Password**.
3. Enter your **Cloudflare Worker URL** (e.g., `https://your-worker.workers.dev`).
4. Hit **Refresh Library** on the Home or Collections tab.