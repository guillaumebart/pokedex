sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "pokedexPokedex/utils/formatter",
    'sap/ui/model/Filter',
    'sap/ui/core/Fragment'
], function (Controller, MessageBox, JSONModel, formatter, Filter, Fragment) {
    "use strict";

    return Controller.extend("pokedexPokedex.controller.App", {

        formatter: formatter,

        onInit: function () {
            MessageBox.information("Bienvenue dans mon pokédex !");

            this.getPokemonList();

        },

        getPokemonList: function () {
            var oData = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "https://pokeapi.co/api/v2/pokemon?offset=0&limit=898",
                dataType: "json",
                async: false,
                success: function (response, status) {
                    if (status !== "success") {
                        this._errorMessage();
                    }
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            });

            var aData = oData.responseJSON;
            for (const element of aData.results) {
                element.number = formatter.number(element.url);
            }
            var oPokemonList = new JSONModel(aData);
            this.getView().setModel(oPokemonList, "modelPokemonList");

        },

        onSearch: function (oEvt) {
            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filterName = new Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filterName);
                var filterUrl = new Filter("number", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filterUrl);
                var oFilter = new Filter({
                    filters: aFilters,
                    and: false
                });
                var aFilter = [];
                aFilter.push(oFilter);
            }


            // update list binding
            var list = this.byId("pokemonList");
            var binding = list.getBinding("items");
            binding.filter(aFilter, "Application");
        },

        onPokemonPress: function (oEvent) {
            var sPokemonName = oEvent.getSource().getProperty("title");
            var oPokemonList = this.getView().getModel("modelPokemonList");
            var aList = oPokemonList.getData().results;

            var oPokemonLink = (aList.find(element => element.name === sPokemonName));
            this.getPokemon(oPokemonLink.url);
        },

        getPokemon: function (url) {
            var oView = this.getView();
            var oData = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                dataType: "json",
                async: false,
                success: function (response, status) {
                    if (status !== "success") {
                        this._errorMessage();
                    }
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            });

            var oPokemon = new JSONModel(oData.responseJSON);
            this.getView().setModel(oPokemon, "modelPokemon");

            this.setColoredType(oPokemon);

            //evolution
            //get species
            let oDataSpecies = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: oData.responseJSON.species.url,
                dataType: "json",
                async: false,
                success: function (response, status) {
                    let oDataEvolution = jQuery.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: response.evolution_chain.url,
                        dataType: "json",
                        async: false,
                        success: function (response, status) {
                            var oEvolution = new JSONModel(response);
                            oView.setModel(oEvolution, "modelEvolution");
                            if (status !== "success") {
                                this._errorMessage();
                            }
                        }.bind(this),
                        error: function () {
                            this._errorMessage();
                        }.bind(this)
                    })
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            })

            this.evolutionChain();
            this.oProcessFlow = this.getView().byId("processflow");
            this.oProcessFlow.updateModel();
        },

        evolutionChain: function () {
            var oEvolution = this.getView().getModel("modelEvolution").getData();
            var oEvolutionChain = { "nodes": [] };
            this.getView().setModel(new JSONModel(oEvolutionChain), "modelEvolutionChain");
            // var oBaseSpecies = oEvolution.chain.species;
            //add the base species
            this.addSpecies(0, oEvolution.chain);
            this.addLanes();

        },

        addSpecies: function (lane, pokemon) {
            var oThis = this;
            var oView = this.getView();
            var oData = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: pokemon.species.url,
                dataType: "json",
                async: false,
                success: function (response, status) {
                    if (status !== "success") {
                        this._errorMessage();
                    }
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            });
            var oData2 = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: oData.responseJSON.varieties[0].pokemon.url,
                dataType: "json",
                async: false,
                success: function (response, status) {
                    var oModel = oView.getModel("modelEvolutionChain");
                    response.lane = lane;
                    response.children = [];
                    if (this.getView().getModel('modelPokemon').getData().id === response.id) {
                        response.focused = true;
                    } else {
                        response.focused = false;
                    }
                    oThis.addChildren(response, pokemon.evolves_to, lane);
                    oModel.getData().nodes.push(response);
                    oView.setModel(oModel, "modelEvolutionChain");
                    if (status !== "success") {
                        this._errorMessage();
                    }
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            });
        },

        addChildren: function (object, children, lane) {
            for (const element of children) {
                var oData = jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: element.species.url,
                    dataType: "json",
                    async: false,
                    success: function (response, status) {
                        object.children.push(response.id);
                    }.bind(this)
                });

                this.addSpecies(lane + 1, element);


            }
        },

        addLanes: function () {
            var aLanes = [
                {
                    "id": "0",
                    "position": 0,
                    "icon": "sap-icon://employee",
                    "text": "Base"
                },
                {
                    "id": "1",
                    "position": 1,
                    "icon": "sap-icon://employee",
                    "text": "Evolution 1"
                },
                {
                    "id": "2",
                    "position": 2,
                    "icon": "sap-icon://employee",
                    "text": "Evolution 2"
                }
            ];

            var oEvolutionChain = this.getView().getModel("modelEvolutionChain");
            oEvolutionChain.getData().lanes = aLanes;
            this.getView().setModel(oEvolutionChain, "modelEvolutionChain");

        },

        onMovePress: function (oEvent) {
            var oSource = oEvent.getSource(),
                oView = this.getView();
            var selectedMove = oSource.oBindingContexts.modelPokemon.getPath().substr(7);
            var url = this.getView().getModel('modelPokemon').getData().moves[selectedMove].move.url;
            let oData = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                dataType: "json",
                async: false,
                success: function (response, status) {
                    if (status !== "success") {
                        this._errorMessage();
                    }
                }.bind(this),
                error: function () {
                    this._errorMessage();
                }.bind(this)
            })

            var oMove = new JSONModel(oData.responseJSON);
            // create popover
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "pokedexPokedex.view.MovePopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    // oPopover.setModel(oMove, "modelMove");
                    // oPopover.bindElement("/moves/0");
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.setModel(oMove, "modelMove");
                oPopover.openBy(oSource.getCells()[0]._getTitleControl());
            });
        },

        onNodePress: function (oEvent) {
            if (!oEvent.getParameters().getProperty("focused")) {
                var nodeId = oEvent.getParameters().getProperty("nodeId");
                var url = "https://pokeapi.co/api/v2/pokemon/" + nodeId;
                this.getPokemon(url);
            }
        },

        setColoredType: function (oPokemon) {
            var typeNumber = 0;
            for(const element of oPokemon.getData().types){
                var id = "type" + typeNumber;
                var oTypeText = this.byId(id);
                oTypeText.aCustomStyleClasses=[];
                oTypeText.aCustomStyleClasses.push(element.type.name);
                // oTypeText.addStyleClass(element.type.name);
                typeNumber = typeNumber + 1;
            }
        },

        handleIconTabBarSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            if (sKey === 'evolution') {


            }

        },
    });
});