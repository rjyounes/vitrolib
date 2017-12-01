/* $This file is distributed under the terms of the license in /doc/license.txt$ */

//In this particular case, we are using this JavaScript in the case where we are employing an external template
//And NOT generating fields
//For now, we are only using this when creating an entirely new object, but later will incorporate editing functionality as well

var lookupWithContext = {
		  onLoad: function() {
	    	 	this.mixIn();  
	    	 	this.initObjects();
	    	 	this.initPage();
	    	 	this.bindEventListeners();
	            
	        },
	        mixIn: function() {

	            // Get the custom form data from the page
	            $.extend(this, customFormData);
	            $.extend(this, i18nStrings);
	        },
	        
	        initObjects:function() {
	        	this.searchSubmit = $("#searchButton");
	        	 this.searchTerm = $('#searchTerm');
	        	 this.maxNumberAlternateLabels = 4;
	        	 this.showHideSearchResults = $("#showHideResults");
	        	 this.loadingIndicator = $("#indicator");
	        },

	        // Initial page setup. Called only at page load.
	        initPage: function() {
	        	this.retrieveExistingValues();
	                           
	        },
	      
	        bindEventListeners:function() {
	        	this.searchSubmit.click(function() {
	        		//lookupWithContext.clearErrors();
	                lookupWithContext.submitSearchTerm();
	                return false;
	        	});
	        },
	        submitSearchTerm: function() {
	        	//Get value of search term
	        	var searchValue = this.searchTerm.val();
	        	var dataServiceUrl = lookupWithContext.dataServiceUrl + "&searchTerm=" + encodeURIComponent(searchValue);
	            //Show the loading icon until the results appear
	        	lookupWithContext.loadingIndicator.removeClass("hidden");
	        	//remove the old search results if there are any
	        	//$("#selectedConcept").empty();
	        	//Hide and reset the show more button
	        	//lookupWithContext.resetShowHideMultipleSearchResults();
	        	//This should return an object including the concept list or any errors if there are any
	        	$.getJSON(dataServiceUrl, function(results) {
	                var htmlAdd = "";
	                var vocabUnavailable = "<p>" + lookupWithContext.vocServiceUnavailable + "</p>";
	                if ( results== null  || results.semanticServicesError != null || results.conceptList == null) {
	                	htmlAdd = vocabUnavailable;
	                }
	                else {
	                	//array is an array of objects representing concept information
	                	//loop through and find all the best matches
	                	var allResults = [];
	                	if("conceptList" in results) {
	                		allResults = results.conceptList;
	                	}
	                	var numberTotalMatches = allResults.length;
	                	  if(numberTotalMatches > 0) {
		                    	htmlAdd = "<div class='container'><ul class='dd' id='concepts' name='concepts'>";
		                    	htmlAdd+= lookupWithContext.addResultsHeader();
		                    	//No division between "best" and "alternate" such as in VIVO so loop through all results
		    	                for(i = 0; i < numberTotalMatches; i++) {
		    	                	var conceptResult = allResults[i];
		    	                	htmlAdd+= lookupWithContext.displayConceptSearchResult(conceptResult);
		    	                }
		    	               
		    	                htmlAdd+= "</ul></div>";
		                    } else {
		                    	htmlAdd+= "<p>No Results Found</p>";
		                    }
	                	
	                
	                }
	                
	                if(htmlAdd.length) {
	                	//hide the loading icon again
	                	lookupWithContext.loadingIndicator.addClass("hidden");
	                	$('#selectedConcept').html(htmlAdd);
	                	if (htmlAdd.indexOf("No search results") >= 0) {
	                		//lookupWithContext.showHiddenElements(hasResults);
	                	}
	                	else {
	                	   hasResults = true;
	                	   $('#selectedConcept').show();
	                	   //lookupWithContext.showHiddenElements(hasResults);
	                       //Here, tweak the display based on the number of results
	                	   //lookupWithContext.displayUptoMaxResults();
	                	   //lookupWithContext.showHideSearchResults.show();
	                    }
	                	//bind events for opening term links
	                	lookupWithContext.bindTermResultsEvents();
	                }
	                
	                
	              });
	              
	            return true;
	        },
	        
	        addResultsHeader:function() {
	        	var htmlAdd = "<li class='concepts'><div class='row'><div class='col-12'><div class='column conceptLabel'>" +
	        	"Genre Form" + " </div><div class='column conceptDefinition'>Notes</div><div class='column additionalInfo'>Additional Info</div></div></div></li>";
	        	return htmlAdd;
	    },
	    displayConceptSearchResult:function(conceptResult) {
	    	var conceptId = conceptResult.conceptId;
	    	var label = conceptResult.label;
	    	var definition = conceptResult.definition;
	    	var definedBy = conceptResult.definedBy;
	    	var type = conceptResult.type;
	    	var uri = conceptResult.uri;
	    	//also adding broader and narrower uris wherever they exist
	    	var broaderUris = conceptResult.broaderURIList;
	    	var narrowerUris = conceptResult.narrowerURIList;
	    	var exactMatchUris = conceptResult.exactMatchURIList;
	    	//this will be null if there are no alternate labels
	    	var altLabels = conceptResult.altLabelList;
	    	return lookupWithContext.generateIndividualConceptDisplay(uri, label, altLabels, definition, type, definedBy, broaderUris, narrowerUris, exactMatchUris);
	},
	 generateIndividualConceptDisplay: function(cuiURI, label, altLabels, definition, type, definedBy, broaderUris, narrowerUris, exactMatchUris) {
	    	var htmlAdd = "<li class='concepts'>" + 
	    	"<div class='row'>" +
	        "<div class='col-12'>" +
	    	"<div class='column conceptLabel'>" +
	    	lookupWithContext.generateIndividualCUIInput(cuiURI, label, type, definedBy, broaderUris, narrowerUris) +  
	    	lookupWithContext.generateIndividualLabelsDisplay(cuiURI, label, altLabels) + lookupWithContext.generateIndividualTypeDisplay(type) + "</div>" + 
	    	lookupWithContext.generateIndividualDefinitionDisplay(definition) +
	    	lookupWithContext.generateIndividualAdditionalInfoDisplay(broaderUris, narrowerUris, exactMatchUris) +
	    	"</div>" +
	        "</div>" +
	        "</li>";
	    	return htmlAdd;
	    }, 
	    generateIndividualCUIInput:function(cuiURI, label, type, definedBy, broaderUris, narrowerUris) {
	    	return 	"<input type='checkbox'  name='CUI' value='" + cuiURI + "' label='" + 
	    		label + "' conceptType='" + type + "' conceptDefinedBy='" + definedBy + "' " +
	    		"broaderUris='" + broaderUris + "' narrowerUris='" + narrowerUris + "'/>";
	    },
	    //In case there are multiple labels display those
	    generateIndividualLabelsDisplay:function(cuiURI, label, altLabels) {
	    	var labelDisplay = "<a href='#' uri='" + cuiURI + "' class='openAuth'>" + label + "</a>";
	    	var displayAltLabels = altLabels;
	    	if(altLabels != null && altLabels.length > 0) {
	    		//Certain vocabulary services might return a long list of alternate labels, in which case we will show fewer 
	    		//display only upto a certain number of alternate labels and use an ellipsis to signify there
	    		//are additional terms
	    		/*
	    		if(altLabels.length > lookupWithContext.maxNumberAlternateLabels) {
	    			displayAltLabels = altLabels.slice(0, lookupWithContext.maxNumberAlternateLabels) + ",...";
	    		}*/
	    		displayAltLabels = lookupWithContext.generateAltLabelsDisplay(altLabels);
	    		labelDisplay += "<br> Alternate Labels:" + displayAltLabels + "";
	    	}
	    	return labelDisplay;
	    },
	    generateAltLabelsDisplay:function(altLabels) {
	    	var html = "";
	    	var d;
	    	var len = altLabels.length;
	    	
	    	for(d = 0; d < len; d++) {
	    		var altLabel = altLabels[d];
	    		html += "<li class='conceptInfoListItem'>" + altLabel + "</li>";
	    	}
	    	if(len > 0) {
	    		html = "<ul>" + html + "</ul>";
	    	}
	    	return  html;
	    },
	    generateIndividualTypeDisplay:function(type) {
	    	if(type != null && type.length > 0) {
	    		return " (" + type + ")";
	    	}
	    	return "";
	    },
	    generateIndividualDefinitionDisplay:function(definition) {
	    	//The definition in some cases may be an empty string, so to prevent the div
	    	//from not appearing, we are replacing with 
	    	if(definition == null || definition.length == 0) {
	    		//definition = "&nbsp;";
	    		definition = "No definition provided.";
	    	}
	    	return "<div class='column conceptDefinition'>" + definition + "</div>";
	},
	generateIndividualAdditionalInfoDisplay:function(broaderUris, narrowerUris, exactMatchUris) {
		var htmlAdditionalInfo = "";
		if(broaderUris != null && broaderUris.length > 0) {
    		var b;
    		htmlAdditionalInfo = "<b>Broader:</b> <br/>";
    		htmlAdditionalInfo += lookupWithContext.generateRelatedURIsDisplay(broaderUris);
    	}
		if(narrowerUris != null && narrowerUris.length > 0) {
    		var b;
    		htmlAdditionalInfo = "<b>Narrower:</b> <br/>";
    		htmlAdditionalInfo += lookupWithContext.generateRelatedURIsDisplay(narrowerUris);
    	}
		if(exactMatchUris != null && exactMatchUris.length > 0) {
    		var b;
    		htmlAdditionalInfo = "Exact Match: <br/>";
    		htmlAdditionalInfo += lookupWithContext.generateRelatedURIsDisplay(exactMatchUris);
    	}
    	return "<div class='column additionalInfo'>" + htmlAdditionalInfo + "</div>";
		
	},
	
	//relatedURIs are of the format [ {uri: , id: , label: }]
	generateRelatedURIsDisplay:function(relatedURIs) {
		var htmlAdd = "";
		var len = relatedURIs.length;
		var i;
		for(i = 0; i < len; i++) {
			var uriInfo = relatedURIs[i];
			var label = uriInfo["label"];
			var uri = uriInfo["uri"];
			htmlAdd += "<li class='conceptInfoListItem'><a href='" + uri + "'>" + label + "</a></li>";
		}
		if(len > 0) {
			htmlAdd = "<ul>" + htmlAdd + "</ul>";
		}
		return htmlAdd;
	},
	/**Get all existing genre form relationships - for now hardcoding this but need to see how to tie this into custom form work**/
	retrieveExistingValues:function() {
		//Do ajax request
		var query = lookupConfig["existingValuesQuery"];
		//Replace subject with subject URI and predicate with predicate URI
		query = query.replace("?subject", "<" + lookupWithContext.subjectURI + ">");
		query = query.replace("?predicate", "<" + lookupWithContext.predicateURI + ">");
		var URL = lookupWithContext.queryAJAXURL + "?query=" + encodeURIComponent(query);
		$.getJSON(URL, function(results) {
			if((results != null) && ("results" in results) && ("bindings" in results["results"])) {
				var bindings = results["results"]["bindings"];
				//Array of var name to value
				var len = bindings.length;
				
				var html = "";
				var b;
				for(b = 0; b < len; b++) {
					var binding = bindings[b];
					if("object" in binding && "label" in binding) {
						var uri = binding["object"]["value"];
						var label = binding["label"]["value"];
						html += lookupWithContext.generateExistingValueRow(uri, label);
						
					}
				}
				
				$("#existingConcepts").append(html);
				$("#existingConcepts").show();
				//Bind event listeners to existing concepts here
				lookupWithContext.bindExistingTermEvents();
			}
		});
	},
	generateExistingValueRow:function(uri, label) {
		var html = "<li class='existingConcept conceptsListContainer'>" + 
            "<div class='container'>" + 
                "<div class='row'>" + 
                    "<div class='col-12'>" + 
                        "<div class='column conceptLabelInfo'><a href='#' uri='" + uri + "' class='openAuth'>" + label + "</a>"  +  
                        "</div>" + 
                        "<div class='column conceptRemoval'>" + 
                            "<a href='" + lookupWithContext.primitiveEdit + "' class='remove' title='remove' uri='" + uri + "'>Remove</a>" + 
                        "</div>" + 
                    "</div>" + 
                "</div>" + 
            "</div>" + 
        "</li>";
		return html;
	},
	bindExistingTermEvents:function() {
		//Bind opening of auth
		$("#existingConcepts a.openAuth").click(function(e) {
			var uri = $(this).attr("uri");
    		lookupWithContext.openAuthURL(uri, e);
            return false;
		});
		
	},
	bindTermResultsEvents:function() {
		//Bind term result events
		$("#selectedConcept a.openAuth").click(function(e) {
			var uri = $(this).attr("uri");
    		lookupWithContext.openAuthURL(uri, e);
            return false;
		});
	},
	openAuthURL:function(uri, e) {
		//open new window with 
		 window.open(uri);
		 e.preventDefault();
	}
	
	        

};

$(document).ready(function() {   
    lookupWithContext.onLoad();
}); 