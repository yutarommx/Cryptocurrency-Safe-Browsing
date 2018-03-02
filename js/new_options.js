"use strict";

load_jQuery();

function saveConfiguration() {

	var dictConfig = {};
	dictConfig["cheAlert"] = document.getElementById('cheAlert').checked;
	dictConfig["cheWhiteAlert"] = document.getElementById('cheWhiteAlert').checked;
	dictConfig["cheBlockPage"] = document.getElementById('cheBlockPage').checked;
	dictConfig["chePunyAlert"] = document.getElementById('chePunyAlert').checked;

	var manual_list = {};
	$("#tbl_manual_list .domain").each(function (index, elem) {
		var tmp_url = new URL('http://' + $(elem).text());
		if (tmp_url != null) {
			manual_list[tmp_url.hostname] = {
				"url": tmp_url.hostname
			};
		}
	});
	dictConfig["manual_list"] = manual_list;

	chrome.storage.sync.set({'config': dictConfig}, function () {
		chrome.runtime.sendMessage({loaded: false, storageConfig: dictConfig}, function (response) {
		});
	});
}

document.addEventListener('DOMContentLoaded', function () {

	chrome.storage.sync.get("config", function (storage) {
		var dictConfig = storage["config"];
		var element = document.getElementById('cheAlert');
		var element2 = document.getElementById('cheWhiteAlert');
		var element3 = document.getElementById('cheBlockPage');
		var element4 = document.getElementById('chePunyAlert');

		if (dictConfig == null) {

			dictConfig["cheAlert"] = true;
			dictConfig["cheWhiteAlert"] = true;
			dictConfig["cheBlockPage"] = true;
			dictConfig["chePunyAlert"] = true;
			dictConfig["manual_list"] = {};

			chrome.storage.sync.set({'config': dictConfig}, function () {
				element.checked = dictConfig["cheAlert"];
				element2.checked = dictConfig["cheWhiteAlert"];
				element3.checked = dictConfig["cheBlockPage"];
				element4.checked = dictConfig["chePunyAlert"];
			});
		} else {
			element.checked = dictConfig["cheAlert"];
			element2.checked = dictConfig["cheWhiteAlert"];
			element3.checked = dictConfig["cheBlockPage"];
			element4.checked = dictConfig["chePunyAlert"];

			var manual_list = dictConfig["manual_list"];
			var tbl_manual_list = $("#tbl_manual_list>tbody");
			Object.keys(manual_list).forEach(function (key) {
				tbl_manual_list.append('<tr><td><div class="message-header"><div class="icon_url"><span class="icon"><img src="http://www.google.com/s2/favicons?domain='+manual_list[key].url+'"></span><span class="domain">'+manual_list[key].url+'</span></div><button class="delete"></button></div></td></tr>');
			});

			$("#tbl_manual_list .delete").on('click', function(e) {
				e.preventDefault();
				$(this).off("click").closest("tr").remove();
				saveConfiguration();
			});
		}
	});

	document.getElementById('cheAlert').addEventListener('change', saveConfiguration);
	document.getElementById('cheWhiteAlert').addEventListener('change', saveConfiguration);
	document.getElementById('cheBlockPage').addEventListener('change', saveConfiguration);
	document.getElementById('chePunyAlert').addEventListener('change', saveConfiguration);

	$("#add_manual_url").on('click', function(e) {
		e.preventDefault();
		var input_obj = $("#manual_url");
		var url_val = input_obj.val();
		if(url_val == ""){
			return;
		}
		try{
			url_val = new URL(url_val);
		}catch(e){
			try{
				url_val = new URL('http://'+url_val);
			}catch(ee){
				input_obj.addClass("is-danger");
				return;
			}
		}
		input_obj.removeClass("is-danger");
		input_obj.val("");
		var tbl_manual_list = $("#tbl_manual_list>tbody");
		tbl_manual_list.append('<tr><td><div class="message-header"><div class="icon_url"><span class="icon"><img src="http://www.google.com/s2/favicons?domain='+url_val.hostname+'"></span><span class="domain">'+url_val.hostname+'</span></div><button class="delete"></button></div></td></tr>');

		saveConfiguration();

		$("#tbl_manual_list .delete").on('click', function(e) {
			e.preventDefault();
			$(this).off("click").closest("tr").remove();
			saveConfiguration();
		});
	});
});
