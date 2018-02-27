"use strict";

function saveConfiguration() {

	var dictConfig = {};
	dictConfig["cheAlert"] = document.getElementById('cheAlert').checked;
	dictConfig["cheWhiteAlert"] = document.getElementById('cheWhiteAlert').checked;

	chrome.storage.sync.set({'config': dictConfig}, function () {
	});
}

document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.sync.get("config", function (storage) {
		var dictConfig = storage["config"];

		if (typeof(dictConfig) === "undefined") {

			dictConfig["cheAlert"] = true;
			dictConfig["cheWhiteAlert"] = true;

			chrome.storage.sync.set({'config': dictConfig}, function () {

				var element = document.getElementById('cheAlert');
				element.checked = dictConfig["cheAlert"];
				var element2 = document.getElementById('cheWhiteAlert');
				element2.checked = dictConfig["cheWhiteAlert"];
			});
		} else {
			var element = document.getElementById('cheAlert');
			element.checked = dictConfig["cheAlert"];
			var element2 = document.getElementById('cheWhiteAlert');
			element2.checked = dictConfig["cheWhiteAlert"];
		}
	});

	document.getElementById('cheAlert').addEventListener('change', saveConfiguration);
	document.getElementById('cheWhiteAlert').addEventListener('change', saveConfiguration);
});
