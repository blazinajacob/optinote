// This file handles PWA-specific functionality

export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Check for updates every hour
      setInterval(async () => {
        await registration.update();
      }, 60 * 60 * 1000);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show notification to user
              showUpdateNotification();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
}

function showUpdateNotification() {
  // Create a notification to inform the user about the update
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 left-4 z-50 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg';
  notification.innerHTML = `
    <div class="flex items-center">
      <span>New version available! </span>
      <button class="ml-4 px-3 py-1 bg-white text-primary-700 rounded text-sm font-medium">Refresh</button>
    </div>
  `;
  
  // Add event listener to the button
  notification.querySelector('button')?.addEventListener('click', () => {
    window.location.reload();
  });
  
  document.body.appendChild(notification);
}

// Cache dynamic content for offline use
export function cachePageContent() {
  if ('caches' in window) {
    const contentCache = 'eyecare-dynamic-content';
    
    // Cache current page content
    caches.open(contentCache).then(cache => {
      cache.add(window.location.href);
    });
    
    // Limit cache size (keep only the most recent 50 pages)
    caches.open(contentCache).then(async cache => {
      const keys = await cache.keys();
      if (keys.length > 50) {
        // Delete oldest items
        for (let i = 0; i < keys.length - 50; i++) {
          cache.delete(keys[i]);
        }
      }
    });
  }
}