// -----
//	Event Listeners
// -----

// runtime onMessage()
chrome.runtime.onMessage.addListener((request, sender, callback) => {
	if ( request.message === 'open-pip' ) {
		console.log('open pip for', request.detail.channel);
	}
}); //- runtime onMessage()