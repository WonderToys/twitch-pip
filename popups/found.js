const channel = document.querySelector('#channel');
const bigger = document.querySelector('#bigger');
const openButton = document.querySelector('#openButton');

const openPip = () => {
	const query = { active: true, currentWindow: true};
	chrome.tabs.query(query, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, { 
			message: 'open-pip',
			detail: {
				channel: channel.value,
				bigger: bigger.checked
			}
		});  

		window.close();
	});
}

channel.addEventListener('keyup', (event) => {
	if ( event.keyCode === 13 && channel.value.trim().length > 0 ) {
		openPip();
	}
});

chrome.storage.sync.get([ 'bigger' ], (items) => {
	if ( items.bigger === true ) {
		bigger.checked = true;
	}
	else {
		bigger.checked = false;
	}
});

openButton.addEventListener('click', openPip);