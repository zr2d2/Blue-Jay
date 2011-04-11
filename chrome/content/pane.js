
if (typeof(Cc) == 'undefined')
	var Cc = Components.classes;
if (typeof(Ci) == 'undefined')
	var Ci = Components.interfaces;
if (typeof(Cu) == 'undefined')
	var Cu = Components.utils;
if (typeof(Cr) == 'undefined')
	var Cr = Components.results;
	

// Make a namespace.
if (typeof Bluejay == 'undefined') {
  var Bluejay = {};
}

Cu.import("resource://app/jsmodules/sbProperties.jsm");



//var paneChooseSong = Bluejay.Controller.doHelloWorld();

/**
 * Controller for pane.xul
 */
Bluejay.PaneController = {

  /**
   * Called when the pane is instantiated
   */
  onLoad: function() {
    this._initialized = true;

	//include('main.js');
    
    // Make a local variable for this controller so that
    // it is easy to access from closures.
    var controller = this;
	var mainController = Bluejay.Controller; //pane.js doesn't know what main.js is
	var engine = TimeBasedRecommendor;
    
    // Hook up the action button
    this._mixbutton = document.getElementById("action-button");
    this._mixbutton.addEventListener("command", 
         function() { engine.recommend(); }, false);
		 
	this._savebutton = document.getElementById("save-button");
    this._savebutton.addEventListener("command", 
         function() { controller.popUpProgress(); }, false);
		 
  },
  
  /**
   * Called when the pane is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },
  
  //Give me a siiiiiiign
  sayHello: function() {
    var greeting = "Hi there!";
	alert(greeting);
	//Bluejay.Controller.doHelloWorld();
	},
  
  popUpProgress: function() {
    //do we want a progress bar for anything? 
  },
  
  /**
   * Load the Display Pane documentation in the main browser pane
   */
  loadHelpPage: function() {
    // Ask the window containing this pane (likely the main player window)
    // to load the display pane documentation
    top.loadURI("http://wiki.songbirdnest.com/Developer/Articles/Getting_Started/Display_Panes");
  }
  
};

window.addEventListener("load", function(e) { Bluejay.PaneController.onLoad(e); }, false);
window.addEventListener("unload", function(e) { Bluejay.PaneController.onUnLoad(e); }, false);