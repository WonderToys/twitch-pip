// -----
// 	Helpers
// -----

// setPopup()
const setPopup = (tab) => {
	if ( tab.url.indexOf('twitch.tv') < 0 ) {
		chrome.browserAction.setPopup({
			tabId: tab.id,
			popup: 'popups/not-found.html'
		});
	}
	else {
		chrome.browserAction.setPopup({
			tabId: tab.id,
			popup: 'popups/found.html'
		});
	}
}; //- setPopup()


// -----
//	Event Listeners
// -----

chrome.runtime.onStartup.addListener(() => setPopup(chrome.activeTab));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => setPopup(tab));