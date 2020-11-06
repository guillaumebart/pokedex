sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"pokedexPokedex/utils/formatter"
], function(Controller, MessageBox, JSONModel, formatter) {
	"use strict";

	return Controller.extend("pokedexPokedex.controller.App", {
		
		formatter:formatter,
		
		onInit: function() {
			MessageBox.information("Bienvenue dans mon pokédex !");

			this.getPokemonList();

		},

		getPokemonList: function() {
			var oData = jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "https://pokeapi.co/api/v2/pokemon?offset=0&limit=151",
				dataType: "json",
				async: false,
				success: function(response, status) {
					if (status !== "success") {
						this._errorMessage();
					}
				}.bind(this),
				error: function() {
					this._errorMessage();
				}.bind(this)
			});

			var aData = oData.responseJSON;
			var oPokemonList = new JSONModel(aData);
			this.getView().setModel(oPokemonList, "modelPokemonList");

		},

		onPokemonPress: function(oEvent) {
			var sPokemonName = oEvent.getSource().getProperty("title");
			var oPokemonList = this.getView().getModel("modelPokemonList");
			var aList = oPokemonList.getData().results;

			var oPokemonLink = (aList.find(element => element.name === sPokemonName));

			var oData = jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: oPokemonLink.url,
				dataType: "json",
				async: false,
				success: function(response, status) {
					if (status !== "success") {
						this._errorMessage();
					}
				}.bind(this),
				error: function() {
					this._errorMessage();
				}.bind(this)
			});

			var oPokemon = new JSONModel(oData.responseJSON);
			this.getView().setModel(oPokemon, "modelPokemon");

		},

		// getImage: function() {
			
		// 	this.getView().getModel("modelPokemon")
			
			
			
		// 	var oData = jQuery.ajax({
		// 		type: "GET",
		// 		contentType: "application/json",
		// 		url: "https://pokeapi.co/api/v2/pokemon",
		// 		dataType: "json",
		// 		async: false,
		// 		success: function(response, status) {
		// 			if (status !== "success") {
		// 				this._errorMessage();
		// 			}
		// 		}.bind(this),
		// 		error: function() {
		// 			this._errorMessage();
		// 		}.bind(this)
		// 	});

		// 	var aData = oData.responseJSON;
		// 	var oPokemonList = new JSONModel(aData);
		// 	this.getView().setModel(oPokemonList, "modelPokemonList");

		// },
	});
});