const PIP_HTML = `
	<div id="twitchPip" class="twitch-pip-container" draggable="true">
		<div class="twitch-pip-header">
			<span class="twitch-pip-text">Loading ...</span>
			<span class="twitch-pip-controls">
				<span class="twitch-pip-swap" title="Swap streams">
					<i class="fas fa-sync-alt" />
				</span>
				<a class="twitch-pip-open" title="Open stream">
					<i class="fas fa-external-link-alt" />
				</a>
				<span class="twitch-pip-close">
					<i class="fas fa-times" title="Close" />
				</span>
			</span>
		</div>

		<div class="twitch-pip-player">
			<iframe
				frameborder="0"
				scrolling="no"
				allowfullscreen="no">
			</iframe>
		</div>
	</div>
`;

let isMoving = false;

let $pip = null;
let $iFrame = null;

let $closeButton = null;
let $swapButton = null;
let $openButton = null;

// -----
//	Helpers
// -----

const destroyPip = () => {
	// Remove event handlers
	$closeButton.off('click');
	$swapButton.off('click');
	$openButton.off('click');

	$iFrame.off('load');
	$pip.off('mouseenter');

	$pip.remove();

	$pip = null;
	$iFrame = null;
	$closeButton = null;
	$swapButton = null;
	$openButton = null;
};

// createPip()
const createPip = (channel) => {
	$pip = $(PIP_HTML);
	$iFrame = $pip.find('iframe');

	$pip.attr('data-channel', channel);
	$iFrame.attr('src', `https://player.twitch.tv/?channel=${ channel }`);

	$iFrame.on('load', () => {
		const css = `
			<style type="text/css">
				.player-streaminfo { display: none !important; }
				.player-button.player-button--twitch { display: none !important; }
				.player-button.qa-fullscreen-button { display: none !important; }
				.player-button.player-button--settings { display: none !important; }
				.extension-taskbar { display: none !important; }
				.extension-container { display: none !important; }
				.qa-settings-banner-span { display: none !important; }
			</style>
		`;

		$iFrame.contents().find('head').append(css);
	});

	$pip.on('mouseenter', () => {
		const playerText = $iFrame.contents().find('a.qa-display-name');
		const viewers = $iFrame.contents().find('.player-streaminfo__viewers > span > span');

		$pip.find('.twitch-pip-text').text(`${ playerText.text() } (${ viewers.text() })`);
		$pip.find('.twitch-pip-open').attr('href', `https://www.twitch.tv/${ playerText.text() }`);
	});

	$closeButton = $pip.find('.twitch-pip-close');
	$closeButton.on('click', () => {
		destroyPip();
	});

	$swapButton = $pip.find('.twitch-pip-swap');
	$swapButton.on('click', () => {
		const swapTo = $('.channel-header .channel-header__user--selected h5').text();
		const viewerCount = $('[data-a-target="channel-viewers-count"] > .tw-stat__value').text();
		const state = { key: (new Date()).getTime(), state: {} };

		destroyPip();

		history.pushState(state, null, channel);
		const popStateEvent = new PopStateEvent('popstate', { state: state });
		window.dispatchEvent(popStateEvent);

		// Wait a second before creating the pip again. 
		// The only reason for this is so the flashing of destroying and recreating isn't so jarring
		setTimeout(() => {
			createPip(swapTo);
		}, 1000);
	});

	$openButton = $pip.find('.twitch-pip-open');
	$openButton.attr('href', `https://www.twitch.tv/${ channel }`);
	$openButton.attr('target', '_blank');
	$openButton.on('click', () => {
		destroyPip();
	});

	// Handle drag and drop. Should move later
	const pipElement = $pip.get(0);
	const bodyElement = $('body').get(0);

	pipElement.addEventListener('dragstart', (event) => {
		isMoving = true;

	  var style = window.getComputedStyle(event.target, null);
	  const left = parseInt(style.getPropertyValue('left')) - event.clientX;
	  const top = parseInt(style.getPropertyValue('top')) - event.clientY;

	  $('.extension-component__iframe').hide();

	  event.dataTransfer.setData('text/plain', `${ left },${ top }`);
	});

	bodyElement.addEventListener('dragover', (event) => {
		event.preventDefault();
		return false;
	});

	bodyElement.addEventListener('drop', (event) => {
	  var offset = event.dataTransfer.getData('text/plain').split(',');
		const left = `${ event.clientX + parseInt(offset[0]) }px`;
	  const top = `${ event.clientY + parseInt(offset[1]) }px`;
	  $pip.css({ top, left });

	  $('.extension-component__iframe').show();
	  chrome.storage.sync.set({ top, left });
	  isMoving = false;

	  event.preventDefault();
	  return false;
	});

	chrome.storage.sync.get([ 'top', 'left', 'bigger' ], (items) => {
		if ( items.left != null ) {
			$pip.css('left', items.left);
		}
		if ( items.top != null ) {
			$pip.css('top', items.top);
		}

		if ( items.bigger === true ) {
			$pip.addClass('bigger');
		}

		$('body').append($pip);
	});
}; //- createPip()

// openPip() 
const openPip = (channel) => {
	if ( $pip == null ) {
		createPip(channel);
	}
	else {
		$iFrame.attr('src', `https://player.twitch.tv/?channel=${ channel }`);
	}
};

// -----
//	Event Listeners
// -----

// runtime onMessage()
chrome.runtime.onMessage.addListener((request, sender, callback) => {
	if ( request.message === 'open-pip' ) {
		chrome.storage.sync.set({ bigger: request.detail.bigger }, () => {
			openPip(request.detail.channel);
		});
	}
}); //- runtime onMessage()