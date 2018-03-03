"use strict";

load_jQuery();

document.addEventListener('DOMContentLoaded', function () {

	chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {
		if (tabArray[0] != null) {
			chrome.runtime.sendMessage({loaded: "popup", sendUrl: tabArray[0].url}, function (response) {
				console.log(response);
				var msg_title = "";
				var msg_body = "";
				var hostname = "";
				var img_src = "../img/gray_48.png";
				if (response.type === "PUNY") {
					hostname = response.site.url;
					img_src = "../img/red_48.png";
					msg_title = chrome.i18n.getMessage("alePunyNotificationTitle");
					msg_body = chrome.i18n.getMessage("alePunyNotificationBody");
				}
				else if (response.type === "PHISHING") {
					hostname = response.site.url;
					img_src = "../img/red_48.png";
					msg_title = chrome.i18n.getMessage("alePhishingNotificationTitle");
					msg_body = chrome.i18n.getMessage("alePhishingNotificationBody");
				}
				else if (response.type === "SCAM") {
					hostname = response.site.url;
					img_src = "../img/red_48.png";
					msg_title = chrome.i18n.getMessage("aleScamNotificationTitle");
					msg_body = chrome.i18n.getMessage("aleScamNotificationBody");
				}
				else if (response.type === "WHITE") {
					hostname = response.site.url;
					img_src = "../img/green_48.png";
					msg_title = response.site.title;
					msg_body = chrome.i18n.getMessage("aleWhiteNotificationBody");
				}
				$("#img_icon").attr({src: img_src});
				$("#msg_title").text(msg_title.replace('\n', ''));
				$("#msg_body").text(msg_body.replace('\n', ''));
				$("#hostname").text(hostname);
			});
		}
	});


});
