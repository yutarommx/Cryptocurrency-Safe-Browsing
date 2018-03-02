"use strict";

var lastTabDomains = {};
var dictConfig = null;

chrome.storage.sync.get("config", function (storage) {
	dictConfig = storage["config"];

	if (dictConfig == null || dictConfig["cheWhiteAlert"] == null || dictConfig["cheBlockPage"] == null || dictConfig["chePunyAlert"] == null) {

		dictConfig = {};
		dictConfig["cheAlert"] = true;
		dictConfig["cheWhiteAlert"] = true;
		dictConfig["cheBlockPage"] = true;
		dictConfig["chePunyAlert"] = true;
		dictConfig["manual_list"] = {};

		chrome.storage.sync.set({'config': dictConfig}, function () {
		});
	}
});

function easyCheckList(currentUrl) {
	var temp_uri = new URI(currentUrl);
	var hostName = temp_uri.hostname();
	var domainName = temp_uri.domain();

	var punycodeStr = "xn--";
	var check_type = "";
	var badSite = {};
	if (typeof dictConfig["manual_list"][hostName] !== "undefined" || typeof dictConfig["manual_list"][domainName] !== "undefined") {
		check_type = "MANUAL";
	}
	else if (typeof whiteList[hostName] !== "undefined" || typeof whiteList[domainName] !== "undefined") {
		check_type = "WHITE";
	}
	else if (typeof badList[hostName] !== "undefined" || typeof badList[domainName] !== "undefined") {
		if (typeof badList[hostName] !== "undefined") {
			badSite = badList[hostName];
		} else {
			badSite = badList[domainName];
		}
		if (badSite.category.toUpperCase() === "PHISHING") {
			check_type = "PHISHING";
		} else {
			check_type = "SCAM";
		}
	}
	else if (domainName.indexOf(punycodeStr) >= 0) {
		check_type = "PUNY";
	}

	var ret_val = {
		type: check_type,
		site: badSite
	};

	return ret_val;
}

function doCheckAction(currentUrl, eventType, tabActive, tabId) {

	var temp_uri = new URI(currentUrl);
	var hostName = temp_uri.hostname();
	var domainName = temp_uri.domain();

	var punycodeStr = "xn--";
	var check_type = "";
	var whiteSite = {};
	var badSite = {};
	if (typeof dictConfig["manual_list"][hostName] !== "undefined" || typeof dictConfig["manual_list"][domainName] !== "undefined") {
		check_type = "MANUAL";
	}
	else if (typeof whiteList[hostName] !== "undefined" || typeof whiteList[domainName] !== "undefined") {
		check_type = "WHITE";
		if (typeof whiteList[hostName] !== "undefined") {
			whiteSite = whiteList[hostName];
		} else {
			whiteSite = whiteList[domainName];
		}
	}
	else if (typeof badList[hostName] !== "undefined" || typeof badList[domainName] !== "undefined") {
		if (typeof badList[hostName] !== "undefined") {
			badSite = badList[hostName];
		} else {
			badSite = badList[domainName];
		}
		if (badSite.category.toUpperCase() === "PHISHING") {
			check_type = "PHISHING";
		} else {
			check_type = "SCAM";
		}
	}
	else if (domainName.indexOf(punycodeStr) >= 0) {
		check_type = "PUNY";
	}

	chrome.notifications.getAll(function (notifications) {
		var keys = Object.keys(notifications);
		for (var i = 0, l = keys.length; i < l; i += 1) {

			if (keys[i] !== "tabId_" + tabId) {
				chrome.notifications.clear(keys[i]);
			}
			else {
				if (lastTabDomains["tabId_" + tabId] !== domainName) {
					chrome.notifications.clear(keys[i]);
				}
			}
		}
	});


	if (check_type === "PHISHING") {

		if (dictConfig["cheAlert"]/* && (lastTabDomains["tabId_" + tabId] == null || lastTabDomains["tabId_" + tabId] !== domainName) && eventType === "onRequest"*/) {
			var textTitle = chrome.i18n.getMessage("alePhishingNotificationTitle");
			var textBody = chrome.i18n.getMessage("alePhishingNotificationBody");

			chrome.notifications.create("tabId_" + tabId, {
					type: "basic",
					title: textTitle,
					iconUrl: "img/red_48.png",
					message: textBody + hostName,
					contextMessage: chrome.i18n.getMessage("badgeTitle"),
					requireInteraction: true,
					isClickable: true
				}, function (notificationId) {
				}
			);
		}

		chrome.browserAction.setIcon({path: "img/red.png"});
		chrome.browserAction.setBadgeText({"text": "BAD"});
		chrome.browserAction.setBadgeBackgroundColor({color: "red"});
		chrome.browserAction.setTitle({title: chrome.i18n.getMessage("alePhishingNotificationTitle")});
	}
	else if (check_type === "SCAM") {

		if (dictConfig["cheAlert"]/* && (lastTabDomains["tabId_" + tabId] == null || lastTabDomains["tabId_" + tabId] !== domainName) && eventType === "onRequest"*/) {
			var textTitle = chrome.i18n.getMessage("aleScamNotificationTitle");
			var textBody = chrome.i18n.getMessage("aleScamNotificationBody");

			chrome.notifications.create("tabId_" + tabId, {
					type: "basic",
					title: textTitle,
					iconUrl: "img/red_48.png",
					message: textBody + hostName,
					contextMessage: chrome.i18n.getMessage("badgeTitle"),
					requireInteraction: true,
					isClickable: true
				}, function (notificationId) {
				}
			);
		}

		chrome.browserAction.setIcon({path: "img/red.png"});
		chrome.browserAction.setBadgeText({"text": "BAD"});
		chrome.browserAction.setBadgeBackgroundColor({color: "red"});
		chrome.browserAction.setTitle({title: chrome.i18n.getMessage("aleScamNotificationTitle")});
	}
	else if (check_type === "PUNY") {

		var do_notificationFlag = false;
		if (eventType === "onRequest") {
			if (dictConfig["chePunyAlert"] && (lastTabDomains["tabId_" + tabId] == null || lastTabDomains["tabId_" + tabId] !== domainName)) {
				do_notificationFlag = true;
			}
		}
		else if (eventType !== "onRequest" && dictConfig["chePunyAlert"]) {
			do_notificationFlag = true;
		}

		if (do_notificationFlag) {
			var textTitle = chrome.i18n.getMessage("alePunyNotificationTitle");
			var textBody = chrome.i18n.getMessage("alePunyNotificationBody");

			chrome.notifications.create("tabId_" + tabId, {
					type: "basic",
					title: textTitle,
					iconUrl: "img/red_48.png",
					message: textBody + domainName,
					contextMessage: chrome.i18n.getMessage("badgeTitle"),
					requireInteraction: false,
					isClickable: true
				}, function (notificationId) {
				}
			);
		}

		chrome.browserAction.setIcon({path: "img/red.png"});
		chrome.browserAction.setBadgeText({"text": "Puny"});
		chrome.browserAction.setBadgeBackgroundColor({color: "red"});
		chrome.browserAction.setTitle({title: chrome.i18n.getMessage("alePunyNotificationTitle")});
	}
	else if (check_type === "WHITE") {

		var do_notificationFlag = false;
		if (dictConfig["cheWhiteAlert"] && (lastTabDomains["tabId_" + tabId] == null || lastTabDomains["tabId_" + tabId] !== domainName)) {
			do_notificationFlag = true;
		}

		if (do_notificationFlag) {
			//var textTitle = chrome.i18n.getMessage("aleWhiteNotificationTitle");
			var textBody = chrome.i18n.getMessage("aleWhiteNotificationBody");

			chrome.notifications.create("tabId_" + tabId, {
					type: "basic",
					title: whiteSite.title,
					iconUrl: "img/green_48.png",
					message: textBody,
					contextMessage: chrome.i18n.getMessage("badgeTitle"),
					requireInteraction: false,
					isClickable: true
				}, function (notificationId) {
				}
			);
		}

		chrome.browserAction.setIcon({path: "img/green.png"});
		chrome.browserAction.setBadgeText({"text": "✔"});
		chrome.browserAction.setBadgeBackgroundColor({color: "green"});
		var trustedTitle = '"' + whiteSite.title + '" ' + chrome.i18n.getMessage("aleWhiteNotificationTitle");
		chrome.browserAction.setTitle({title: trustedTitle});
	}
	else {
		chrome.browserAction.setTitle({title: chrome.i18n.getMessage("badgeTitle")});
		chrome.browserAction.setBadgeText({"text": ""});
		chrome.browserAction.setIcon({path: "img/blue.png"});
	}

	if (dictConfig["cheAlert"] || dictConfig["chePunyAlert"] || dictConfig["cheWhiteAlert"]/* && eventType === "onRequest"*/) {
		lastTabDomains["tabId_" + tabId] = domainName;
	}
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.loaded) {
		var tabId = sender.tab.id;
		chrome.tabs.query({active: true}, function (tabArray) {
			tabArray.forEach(function (tab) {
				if (tab.id === tabId) {
					var currentURL = tab.url;
					doCheckAction(currentURL, "onRequest", tab.active, tab.id);
				}
			});
		});
		if (dictConfig["cheBlockPage"]) {
			sendResponse(easyCheckList(sender.url));
		} else {
			sendResponse(null);
		}
	} else {
		dictConfig = message.storageConfig;
	}
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
	var tabId = activeInfo.tabId;
	chrome.tabs.query({active: true}, function (tabArray) {
		tabArray.forEach(function (tab) {
			if (tab.id === tabId) {
				var currentURL = tab.url;
				doCheckAction(currentURL, "onActivated", tab.active, tab.id);
			}
		});
	});
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
	//if (windowId === chrome.windows.WINDOW_ID_NONE) {
	//clearAllNotifications();
	//}
	//else {
	chrome.tabs.query({active: true}, function (tabs) {
		tabs.forEach(function (tab) {
			if (tab.windowId === windowId) {
				var currentURL = tab.url;
				doCheckAction(currentURL, "onActivated", tab.active, tab.id);
			}
		});
	});
	//}
});

chrome.notifications.onClicked.addListener(function (notificationId) {
	chrome.notifications.clear(notificationId);
});

/*
function checkBrowserFocus() {
	chrome.windows.getCurrent(function (browser) {
		if (!browser.focused) {
			clearAllNotifications();
		}
	})
}

function clearAllNotifications() {
	chrome.notifications.getAll(function (notifications) {
		var keys = Object.keys(notifications);
		for (var i = 0, l = keys.length; i < l; i += 1) {
			chrome.notifications.clear(keys[i]);
		}
	});
}

window.setInterval(checkBrowserFocus, 5000);
*/