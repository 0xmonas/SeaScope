const TOP_COLLECTIONS_KEY = 'topCollections';
const NOTIFICATION_ID = 'newCollectionNotification';

async function fetchTopCollections() {
  // Replace 'YOUR_API_KEY' with your actual Opensea API key
  const apiKey = 'YOUR_API_KEY';
  const response = await fetch('https://api.opensea.io/api/v1/collections?order_by=stats.floor_price&order_direction=desc&offset=0&limit=10', {
    headers: {
      'X-API-KEY': apiKey
    }
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Failed to fetch top collections');
  }
}

function findNewCollections(oldCollections, newCollections) {
  const oldSlugs = oldCollections.map(c => c.slug);
  return newCollections.filter(c => !oldSlugs.includes(c.slug));
}

async function checkForNewCollections() {
  const oldCollections = await new Promise(resolve => {
    chrome.storage.local.get([TOP_COLLECTIONS_KEY], data => resolve(data[TOP_COLLECTIONS_KEY] || []));
  });

  const newCollections = await fetchTopCollections();

  chrome.storage.local.set({ [TOP_COLLECTIONS_KEY]: newCollections });

  const newTopCollections = findNewCollections(oldCollections, newCollections);

  newTopCollections.forEach(collection => {
    const notificationOptions = {
      type: 'basic',
      iconUrl: collection.image_url,
      title: 'New Top-10 Collection',
      message: `${collection.name} just entered the Top-10 with a floor price of ${collection.stats.floor_price} ETH.`,
      priority: 1,
      requireInteraction: true
    };

    // Play notification sound
    const audio = new Audio('https://notificationsounds.com/notification-sounds/bird-calling-555/download/mp3');
    audio.play();

    // Show notification
    chrome.notifications.create(NOTIFICATION_ID, notificationOptions);
  });
}

// Check for new collections every 5 minutes
const CHECK_INTERVAL = 5 * 60 * 1000;
setInterval(checkForNewCollections, CHECK_INTERVAL);

// Check for new collections on background script start
checkForNewCollections();
