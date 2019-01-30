const channel = document.querySelector('#channel');
channel.addEventListener('keyup', (event) => {
	if ( event.keyCode === 13 && channel.value.trim().length > 0 ) {
		const query = { active: true, currentWindow: true};
		chrome.tabs.query(query, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, { 
				message: 'open-pip',
				detail: {
					channel: channel.value
				}
			});  
		});
	}
});