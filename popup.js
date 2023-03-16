const collectionsList = document.getElementById('collections-list');
const darkModeSwitch = document.getElementById('dark-mode-switch');

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

async function updateCollectionsList() {
  try {
    const collections = await fetchTopCollections();
    collectionsList.innerHTML = '';

    collections.forEach(collection => {
      const listItem = document.createElement('li');
      const img = document.createElement('img');
      img.src = collection.image_url;
      img.alt = collection.name;
      listItem.appendChild(img);

      const name = document.createTextNode(collection.name);
      listItem.appendChild(name);

      const floorPrice = document.createTextNode(`${collection.stats.floor_price} ETH`);
      listItem.appendChild(floorPrice);

      collectionsList.appendChild(listItem);
    });
  } catch (error) {
    console.error(error);
    collectionsList.innerHTML = 'Failed to fetch data';
  }
}

function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

darkModeSwitch.addEventListener('change', () => {
  const darkModeEnabled = darkModeSwitch.checked;
  setDarkMode(darkModeEnabled);
  chrome.storage.sync.set({ darkMode: darkModeEnabled });
});

chrome.storage.sync.get(['darkMode'], data => {
  const darkModeEnabled = data.darkMode || false;
  darkModeSwitch.checked = darkModeEnabled;
  setDarkMode(darkModeEnabled);
});

updateCollectionsList();
