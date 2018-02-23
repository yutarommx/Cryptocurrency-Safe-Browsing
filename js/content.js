(function () {
	'use strict';

	chrome.extension.sendRequest({loaded: true});

	if (0) {
		var local = chrome.extension.getURL('/');
		var js = document.createElement('script');
		js.setAttribute('src', local + 'js/injection.js');
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(js);
	}
}());