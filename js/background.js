"use strict";
if (chrome.storage["lastDomain"] == null) {
	chrome.storage["lastDomain"] = "";
}

chrome.storage.sync.get("config", function (storage) {
	var dictConfig = storage["config"];

	if (typeof(dictConfig) === "undefined") {

		dictConfig = {};
		dictConfig["cheAlert"] = true;

		chrome.storage.sync.set({'config': dictConfig}, function () {
		});
	}
});

function doCheckAction(currentUrl, eventType) {

	var temp_uri = new URI(currentUrl);
	var hostName = temp_uri.hostname();
	var domainName = temp_uri.domain();

	chrome.browserAction.setTitle({title: chrome.i18n.getMessage("badgeTitle")});
	chrome.browserAction.setBadgeText({"text": ""});
	chrome.browserAction.setIcon({path: "/img/blue.png"});

	var punycodeStr = "xn--";
	var check_type = "";
	if (whiteList.indexOf(hostName) >= 0 || whiteList.indexOf(domainName) >= 0) {
		check_type = "WHITE";
	}
	else if (badList.indexOf(hostName) >= 0 || badList.indexOf(domainName) >= 0) {
		check_type = "SCAM";
	}
	else if (domainName.indexOf(punycodeStr) >= 0) {
		check_type = "PUNY";
	}

	chrome.storage.sync.get("config", function (storage) {

		if (check_type === "SCAM") {

			if (storage["config"]["cheAlert"] && eventType === "onRequest" && chrome.storage["lastDomain"] !== domainName) {
				var textTitle = chrome.i18n.getMessage("aleScamNotificationTitle");
				var textBody = chrome.i18n.getMessage("aleScamNotificationBody");

				new Notification(textTitle, {
					icon: '/img/red_48.png',
					body: textBody + domainName
				});
			}

			chrome.browserAction.setIcon({path: "/img/red.png"});
			chrome.browserAction.setBadgeText({"text": "BAD"});
			chrome.browserAction.setBadgeBackgroundColor({color: "red"});
			chrome.browserAction.setTitle({title: chrome.i18n.getMessage("aleScamNotificationTitle")});

		}
		else if (check_type === "PUNY") {

			if (storage["config"]["cheAlert"] && eventType === "onRequest" && chrome.storage["lastDomain"] !== domainName) {
				var textTitle = chrome.i18n.getMessage("alePunyNotificationTitle");
				var textBody = chrome.i18n.getMessage("alePunyNotificationBody");

				new Notification(textTitle, {
					icon: '/img/red_48.png',
					body: textBody + domainName
				});
			}

			chrome.browserAction.setIcon({path: "/img/red.png"});
			chrome.browserAction.setBadgeText({"text": "Puny"});
			chrome.browserAction.setBadgeBackgroundColor({color: "red"});
			chrome.browserAction.setTitle({title: chrome.i18n.getMessage("alePunyNotificationTitle")});

		}
		else if (check_type === "WHITE") {
			chrome.browserAction.setIcon({path: "/img/green.png"});
			chrome.browserAction.setBadgeText({"text": "✔"});
			chrome.browserAction.setBadgeBackgroundColor({color: "green"});
			chrome.browserAction.setTitle({title: chrome.i18n.getMessage("trustedTitle")});
		}

		if (storage["config"]["cheAlert"] && eventType === "onRequest") {
			chrome.storage["lastDomain"] = domainName;
		}
	});
}

chrome.extension.onRequest.addListener(function (request, sender) {
	if (request.loaded) {
		chrome.tabs.query({active: true}, function (tabArray) {
			var currentURL = tabArray[0].url;
			doCheckAction(currentURL, "onRequest");
		});
	}
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
	chrome.tabs.query({active: true}, function (tabArray) {
		var currentURL = tabArray[0].url;
		doCheckAction(currentURL, "onActivated");
	});
});
