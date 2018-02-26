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

function doCheckAction(currentUrl, eventType, tabActive) {

	var temp_uri = new URI(currentUrl);
	var hostName = temp_uri.hostname();
	var domainName = temp_uri.domain();

	var punycodeStr = "xn--";
	var check_type = "";
	if (whiteList.indexOf(hostName) >= 0 || whiteList.indexOf(domainName) >= 0) {
		check_type = "WHITE";
	}
	else if (typeof(badList[hostName]) !== "undefined" || typeof(badList[domainName]) !== "undefined") {
		var badSite = {};
		if(typeof(badList[hostName]) !== "undefined"){
			badSite = badList[hostName];
		}else{
			badSite = badList[domainName];
		}
		if(badSite.category.toUpperCase() === "PHISHING"){
			check_type = "PHISHING";
		}else{
			check_type = "SCAM";
		}
	}
	else if (domainName.indexOf(punycodeStr) >= 0) {
		check_type = "PUNY";
	}

	chrome.storage.sync.get("config", function (storage) {

		if (check_type === "PHISHING") {

			if (storage["config"]["cheAlert"] && eventType === "onRequest" && chrome.storage["lastDomain"] !== domainName) {
				var textTitle = chrome.i18n.getMessage("alePhishingNotificationTitle");
				var textBody = chrome.i18n.getMessage("alePhishingNotificationBody");

				new Notification(textTitle, {
					icon: '/img/red_48.png',
					body: textBody + domainName
				});
			}

			if (tabActive) {
				chrome.browserAction.setIcon({path: "/img/red.png"});
				chrome.browserAction.setBadgeText({"text": "BAD"});
				chrome.browserAction.setBadgeBackgroundColor({color: "red"});
				chrome.browserAction.setTitle({title: chrome.i18n.getMessage("alePhishingNotificationTitle")});
			}

		}
		else if (check_type === "SCAM") {

			if (storage["config"]["cheAlert"] && eventType === "onRequest" && chrome.storage["lastDomain"] !== domainName) {
				var textTitle = chrome.i18n.getMessage("aleScamNotificationTitle");
				var textBody = chrome.i18n.getMessage("aleScamNotificationBody");

				new Notification(textTitle, {
					icon: '/img/red_48.png',
					body: textBody + domainName
				});
			}

			if (tabActive) {
				chrome.browserAction.setIcon({path: "/img/red.png"});
				chrome.browserAction.setBadgeText({"text": "BAD"});
				chrome.browserAction.setBadgeBackgroundColor({color: "red"});
				chrome.browserAction.setTitle({title: chrome.i18n.getMessage("aleScamNotificationTitle")});
			}

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

			if (tabActive) {
				chrome.browserAction.setIcon({path: "/img/red.png"});
				chrome.browserAction.setBadgeText({"text": "Puny"});
				chrome.browserAction.setBadgeBackgroundColor({color: "red"});
				chrome.browserAction.setTitle({title: chrome.i18n.getMessage("alePunyNotificationTitle")});
			}

		}
		else if (check_type === "WHITE") {
			if (tabActive) {
				chrome.browserAction.setIcon({path: "/img/green.png"});
				chrome.browserAction.setBadgeText({"text": "✔"});
				chrome.browserAction.setBadgeBackgroundColor({color: "green"});
				chrome.browserAction.setTitle({title: chrome.i18n.getMessage("trustedTitle")});
			}
		}
		else {
			if (tabActive) {
				chrome.browserAction.setTitle({title: chrome.i18n.getMessage("badgeTitle")});
				chrome.browserAction.setBadgeText({"text": ""});
				chrome.browserAction.setIcon({path: "/img/blue.png"});
			}
		}

		if (storage["config"]["cheAlert"] && eventType === "onRequest") {
			chrome.storage["lastDomain"] = domainName;
		}
	});
}

chrome.extension.onRequest.addListener(function (request, sender) {
	if (request.loaded) {
		var tabId = sender.tab.id;
		chrome.tabs.query({}, function (tabArray) {
			tabArray.forEach(function (tab) {
				if (tab.id === tabId) {
					var currentURL = tab.url;
					doCheckAction(currentURL, "onRequest", tab.active);
				}
			});
		});
	}
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
	var tabId = activeInfo.tabId;
	chrome.tabs.query({active: true}, function (tabArray) {
		tabArray.forEach(function (tab) {
			if (tab.id === tabId) {
				var currentURL = tab.url;
				doCheckAction(currentURL, "onActivated", tab.active);
			}
		});
	});
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
	chrome.tabs.query({active: true}, function (tabs) {
		tabs.forEach(function (tab) {
			if (tab.windowId === windowId) {
				var currentURL = tab.url;
				doCheckAction(currentURL, "onActivated", tab.active);
			}
		});
	});
});
