"use strict";

function saveConfiguration() {

	var dictConfig = {};
	dictConfig["cheAlert"] = document.getElementById('cheAlert').checked;

	chrome.storage.sync.set({'config': dictConfig}, function () {
	});
}

document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.sync.get("config", function (storage) {
		var dictConfig = storage["config"];

		if (typeof(dictConfig) === "undefined") {

			dictConfig["cheAlert"] = true;

			chrome.storage.sync.set({'config': dictConfig}, function () {

				var element = document.getElementById('cheAlert');
				element.checked = dictConfig["cheAlert"];
			});
		} else {
			var element = document.getElementById('cheAlert');
			element.checked = dictConfig["cheAlert"];
		}
	});

	document.getElementById('cheAlert').addEventListener('change', saveConfiguration);
});
