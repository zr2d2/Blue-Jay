
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

// test class
function A()
{
    this.x = 1;
};
//function TimeBasedRecommendor();
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
	//alert("initializing");
    //TimeBasedRecommendor.constructor();
	//this.engine = RecommendorFactory.recommendor();
	this.engine = new TimeBasedRecommendor();
	//alert("engine is " + this.engine);
	//alert("constructed successfully");
    //var engine = new A();
    
    // Hook up the action button
    this._mixbutton = document.getElementById("action-button");
    this._mixbutton.addEventListener("command", 
         function() { controller.test(); }, false);
		 
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
  
  readFiles : function() {
    alert("pane reading files");
    //TimeBasedRecommendor.constructor();
    // for testing, write to the file first
    //FileIO.writeFile("bluejay_ratings.txt", "Jeff's successful file IO test", 0);
    // now read the file
    this.engine.readFiles();
    //this.engine.makeRecommendation();
  },
  
  test : function() {
    this.engine.readFiles();
    this.engine.makeRecommendation();
    //this.engine.
    //this.engine.test();
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