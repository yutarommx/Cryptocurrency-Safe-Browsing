'use strict';

chrome.storage.sync.get("config", function (storage) {
	chrome.runtime.sendMessage({loaded: true, storage: storage}, function (response) {
		if (response != null && (response.type === "PHISHING" || response.type === "SCAM")) {
			load_jQuery();
			var blockTitle = "";
			if (response.type === "PHISHING") {
				blockTitle = chrome.i18n.getMessage("blockPhishingTitle");
			}
			else if (response.type === "SCAM") {
				blockTitle = chrome.i18n.getMessage("blockScamTitle");
			}

			var siteInfo = response.site;

			var html = `
<section class="hero is-dark is-fullheight is-bold">
	<nav class="navbar" role="navigation" aria-label="main navigation">
		<div class="navbar-brand">
			<span class="tag is-dark">${chrome.i18n.getMessage("badgeTitle")}</span>
		</div>
	</nav>
	<div class="hero-body">
		<div class="container">
			<h1 class="title is-spaced">
				${blockTitle}
			</h1>
			<h2 class="subtitle">
				${siteInfo.url}
			</h2>
		</div>
	</div>
</section>
`;
			var local = chrome.extension.getURL('/');
			$('head').empty().append('<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title></title><link rel="stylesheet" href="' + local + 'ui/bulma.css">');
			$('body').empty().append(html);
		}
	});
});