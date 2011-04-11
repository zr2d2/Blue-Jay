
// Make a namespace.
if (typeof Bluejay == 'undefined') {
  var Bluejay = {};
}

/**
 * UI controller that is loaded into the main player window
 */
Bluejay.Controller = {

  /**
   * Called when the window finishes loading
   */
  onLoad: function() {

    // initialization code
    this._initialized = true;
    this._strings = document.getElementById("bluejay-strings");
    
    // Perform extra actions the first time the extension is run
    if (Application.prefs.get("extensions.bluejay.firstrun").value) {
      Application.prefs.setValue("extensions.bluejay.firstrun", false);
      this._firstRunSetup();
    }


    // Add the toolbar button to the default item set of the browser toolbar.
    // TODO: Should only do this on first run, but Bug 6778 requires doing it
    // every load.
    this._insertToolbarItem("nav-bar", "subscription-button");

    

    // Make a local variable for this controller so that
    // it is easy to access from closures.
    var controller = this;
    var controller = this;
    
    // Attach doHelloWorld to our helloworld command
    this._helloWorldCmd = document.getElementById("bluejay-helloworld-cmd");
    this._helloWorldCmd.addEventListener("command", 
         function() { controller.doHelloWorld(); }, false);





  },
  

  /**
   * Called when the window is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },
  

  /**
   * Sample command action
   */
  doHelloWorld : function() {
    var message = "Bluejay: " + this._strings.getString("helloMessage");
    alert(message);
    //this.chooseSong();
  },

    chooseSong : function() {
    var songName = "Come on Eileen";
    alert("selecting song named " + songName);
    const properties = Cc["@songbirdnest.com/Songbird/Properties/MutablePropertyArray;1"].createInstance(Ci.sbIMutablePropertyArray);
    //properties.appendProperty(SBProperties.artistName, "Dexys Midnight Runners");
    properties.appendProperty(SBProperties.trackName, songName);
    var tracks = LibraryUtils.mainLibrary.getItemsByProperties(properties);
    //var tracks = LibraryUtils.mainLibrary.getItemsByProperty(SBProperties.artistName, "Dexys Midnight Runners");
    var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
    gMM.sequencer.playView(gMM.sequencer.view,gMM.sequencer.view.getIndexForItem(tracks.enumerate().getNext())); 
    alert("done selecting song");

  },
  
  /**
   * Perform extra setup the first time the extension is run
   */
  _firstRunSetup : function() {
  
    // Call this.doHelloWorld() after a 3 second timeout
    setTimeout(function(controller) { controller.doHelloWorld(); }, 3000, this); 
    
  },
  
  

  /**
   * Helper to add a toolbaritem within a given toolbar
   * 
   *   toolbar - the ID of a toolbar element
   *   newItem - the ID of a toolbaritem element within the 
   *            associated toolbarpalette
   *   insertAfter - ID of an toolbaritem after which newItem should appear
   */
  _insertToolbarItem: function(toolbar, newItem, insertAfter) {
    var toolbar = document.getElementById(toolbar);
    var list = toolbar.currentSet || "";
    list = list.split(",");
    
    // If this item is not already in the current set, add it
    if (list.indexOf(newItem) == -1)
    {
      // Add to the array, then recombine
      insertAfter = list.indexOf(insertAfter);
      if (insertAfter == -1) {
        list.push(newItem);
      } else {
        list.splice(insertAfter + 1, 0, newItem);
      }
      list = list.join(",");
      
      toolbar.setAttribute("currentset", list);
      toolbar.currentSet = list;
      document.persist(toolbar.id, "currentset");
    }
  }

  
};

window.addEventListener("load", function(e) { Bluejay.Controller.onLoad(e); }, false);
window.addEventListener("unload", function(e) { Bluejay.Controller.onUnLoad(e); }, false);
