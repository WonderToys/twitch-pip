let DO_SWAP = null;

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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if ( changeInfo.status === 'complete' ) {
		if ( DO_SWAP != null && tab.id === DO_SWAP.tab ) {
			chrome.tabs.sendMessage(DO_SWAP.tab, { 
				message: 'open-pip',
				detail: {
					channel: DO_SWAP.channel
				}
			});  
			DO_SWAP = null;
		}

		chrome.tabs.sendMessage(tabId, { message: 'tab-loaded' }); 
	}

	setPopup(tab)
});

chrome.runtime.onMessage.addListener((message, sender) => {
	const query = { active: true, currentWindow: true};
	chrome.tabs.query(query, (tabs) => {
		DO_SWAP = {
			channel: message.detail.pip,
			tab: tabs[0].id
		};

		chrome.tabs.update({ url: `https://www.twitch.tv/${ message.detail.large }` });
	});
});