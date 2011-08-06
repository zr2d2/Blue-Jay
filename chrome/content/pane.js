/*
Copyright (C) 2011 Bluejay

This file is part of Bluejay.

Bluejay is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Bluejay is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Bluejay. If not, see <http://www.gnu.org/licenses/>.
*/

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
Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

/**
* Controller for pane.xul
*/
Bluejay.PaneController = {

    /**
    * Called when the pane is instantiated
    */
    onLoad: function() {

        this._initialized = true;
        this.currentMediaItem = null;
        this.songStartDate = null;
        this.isLibraryScanned = false;
        this.isSettingSong = false; // whether we're currently in the process of changing the song
        this.state = "on";

        // Make a local variable for this controller so that
        // it is easy to access from closures.
        var controller = this;
        this.engine = new TimeBasedRecommendor();

        // Hook up the ScanLibrary button
        this._scanbutton = document.getElementById("scan-button");
        this._scanbutton.addEventListener("command",
        function() { controller.scanLibrary(); }, false);

        // Hook up the Mix button
        this._mixbutton = document.getElementById("action-button");
        this._mixbutton.addEventListener("command",
        function() { controller.makePlaylist(); }, false);
    
        // Hook up the On/Off button
        this._offbutton = document.getElementById("off");
        this._offbutton.addEventListener("command",
        function() { controller.turnOff(); }, false);
    
        // Hook up the ratings menu (five entries)
        this._1star = document.getElementById("1star");
        this._1star.addEventListener("command",
        function() { controller.giveRating(0.0); }, false);
        this._2star = document.getElementById("2star");
        this._2star.addEventListener("command",
        function() { controller.giveRating(0.25); }, false);
        this._3star = document.getElementById("3star");
        this._3star.addEventListener("command",
        function() { controller.giveRating(0.5); }, false);
        this._4star = document.getElementById("4star");
        this._4star.addEventListener("command",
        function() { controller.giveRating(0.75); }, false);
        this._5star = document.getElementById("5star");
        this._5star.addEventListener("command",
        function() { controller.giveRating(1.0); }, false);
        // keep track of the dropdown menu itself to allow us to reset the visual later
        this._starMenuList = document.getElementById("starmenulist");
        
        this.exactRatingLabel = document.getElementById("exactRatingLabel");
        this.exactRatingLabel.addEventListener("mouseover", function() {controller.exactRatingLabel.value = "rating =";}, false);
        this.exactRatingLabel.addEventListener("mouseout", function() {controller.exactRatingLabel.value = "Exact:";}, false);

        this.comparisonRatingLabel = document.getElementById("comparisonRatingLabel");
        this.comparisonRatingLabel.addEventListener("mouseover", function() {controller.comparisonRatingLabel.value = "to prev.";}, false);
        this.comparisonRatingLabel.addEventListener("mouseout", function() {controller.comparisonRatingLabel.value = "Relative:";}, false);
            
        var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
            
        // Setup a listener for when the currently playing track changes
        var skipListener = {
            onMediacoreEvent:function(ev) {
                if(ev.type==Ci.sbIMediacoreEvent.TRACK_CHANGE) {
                    //alert("the song has changed");
                    controller.songChanged(ev);
                } else if(ev.type==Ci.sbIMediacoreEvent.STREAM_END) {
                    //alert("End of Playlist");
                    controller.songChanged(ev);
                }
            }
        }
        gMM.addListener(skipListener);
            
            
        // Create a listener to request notification of when the playlist selection changes
        this.songSelectionListener = {
            onSelectionChanged:function() {
                controller.selectionChanged();
            },
            onCurrentIndexChanged:function() {
            }
        }
    },
    
    // returns the current selected row of the mediaListView, or null if there is not exactly 1 row selected
    getSelectedMediaItem : function() {
        // Determine which song is currently selected in the view
        var mediaListView = this.getCurrentMediaListView();
        var selection = null;
        if (mediaListView != null) {
            // figure out which song is currently selected
            var selection = mediaListView.selection;
            if (selection.count == 1) {
                var currentIndex = selection.currentIndex;
                //alert("current index = " + currentIndex);
                var selectedMediaItem = mediaListView.getItemByIndex(currentIndex);
                return selectedMediaItem;
            }
        }
        return null;
    },
    
    // returns the current media list view
    getCurrentMediaListView : function() {
        var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
        var songbirdWindow = windowMediator.getMostRecentWindow("Songbird:Main");
        var mediaListView = songbirdWindow.gBrowser.currentMediaListView;
        return mediaListView;
    },

    // adds a selection listener for the current view
    addSelectionListener : function() {
        var mediaListView = this.getCurrentMediaListView();
        if (mediaListView != null) {
            var selection = mediaListView.selection;
            selection.addListener(this.songSelectionListener);
        }
    },
    
    // gets rid of the selection listener for the current view
    removeSelectionListener : function() {
        var mediaListView = this.getCurrentMediaListView();
        if (mediaListView != null) {
            var selection = mediaListView.selection;
            selection.removeListener(this.songSelectionListener);
        }
    },
    
    // this function gets called when the user changes which songs are selected
    selectionChanged : function() {
        this.didSelectionChange = true;
    },
    // assigns a certain rating to the currently-playing song
    giveRating : function(score) {
        // make sure we know which song to assign the rating to
        if (this.currentMediaItem) {
            var newRating = new Rating();
            newRating.setActivityName(new Name(this.currentMediaItem.getProperty(SBProperties.trackName)));
            var newDate = new DateTime();
            newDate.setNow();
            newRating.setDate(newDate);
            newRating.setScore(score);
            //alert("adding rating");
            this.engine.addRating(newRating);
            flushMessage();
        }
    },
    
    // disables the Bluejay recommendation engine until it is re-enabled
    turnOff : function() {
        //this._ratingMenu.clearStars();
        this.state="off";
    },
  
    // scans the user's library and sends that data to the engine
    scanLibrary : function() {
        var list = LibraryUtils.mainLibrary;
        var mystring = "";
        // iterate over each thing in the library
        alert("push [ok] to start scanning library");
        var length = list.length;
        // limit the number of songs (for testing)
        // if (length > 65) {
        // length = 65;
        // }
        var i;
        var music = new Name("Song");
        for (i = 0; i < length; i++) {
            var item = list.getItemByIndex(i);
            // get the song name
            var songName = new Name(item.getProperty(SBProperties.trackName));
            // make sure the song name is something sensible
            if (!songName.isNull()) {
                // make a new candidate to represent the song
                var songCandidate = new Candidate();
                songCandidate.setName(songName);
                songCandidate.setPlayable(true);
                // get the date it was added to the library
                var timeString = item.getProperty(SBProperties.created);
                var deltaTime = parseInt(item.getProperty(SBProperties.created));
                var discoveryDate = new DateTime();
                discoveryDate.setDurationSinceReference(deltaTime / 1000);
                songCandidate.setDiscoveryDate(discoveryDate);
                message("getting rating");
                // get the song's rating if it has been rated yet
                var starCount = item.getProperty(SBProperties.rating);
                message(starCount + "\r\n");
                if (starCount > 0) {
                    // create the rating and add it
                    var songRating = new Rating();
                    songRating.setActivityName(songName);
                    songRating.setScore((starCount - 1) / 4);
                    // setting an invalid date means we want it to be the earliest possible date
                    songRating.setDate(null);
                    this.engine.putRatingInMemory(songRating);
                }


                // get the artist name
                var artistName = new Name(item.getProperty(SBProperties.artistName));
                // if the artist name is unknown, group it with other songs with unknown genre
                if (artistName.isNull()) {
                    artistName = new Name("Unspecified Artist");
                }
                // create a Candidate representing the artist
                var artistCandidate = new Candidate();
                artistCandidate.setName(artistName);
                artistCandidate.addParentName(music);
                artistCandidate.setPlayable(false);
                // give the artist candidate to the engine
                this.engine.addCandidate(artistCandidate);
                // add the artist as a parent of the song
                songCandidate.addParentName(artistName);


                // get the genre
                var genre = new Name(item.getProperty(SBProperties.genre));
                // if the genre is unknown, group it with other songs with unknown genre
                if (genre.isNull()) {
                    genre = new Name("Unspecified Genre");
                }
                // create a Candidate representing the genre
                var genreCandidate = new Candidate();
                genreCandidate.setName(genre);
                genreCandidate.addParentName(music);
                genreCandidate.setPlayable(false);
                // give the genre candidate to the engine
                this.engine.addCandidate(genreCandidate);
                // add the artist as a parent of the song
                songCandidate.addParentName(genre);
                
                /* // if the artist name and genre name are unknown, then the song is a direct child of the category "Song"
                if (artistName.isNull() && genre.isNull()) {
                songCandidate.addParentName(music);
                }*/
                
                // give the song to the engine
                this.engine.addCandidate(songCandidate);
            }
        }
        var musicCategory = new Candidate();
        musicCategory.setName(music);
        musicCategory.setPlayable(false);
        this.engine.addCandidate(musicCategory);
        this.isLibraryScanned = true;
        //alert("done scanning library");
        // read any data from the text files that gives information about the library
        this.engine.readFiles();
        flushMessage();
    },
  
    // this function gets called whenever the song changes for any reason
    songChanged: function(ev) {
        // get the data for the new track
        var mediaItem = ev.data;
        var songName = mediaItem.getProperty(SBProperties.trackName)

        // save data for later
        var previousMediaItem = this.currentMediaItem;
        this.currentMediaItem = mediaItem;
        var songEndDate = new DateTime();
        songEndDate.setNow();
        var previousStartDate = this.songStartDate;
        this.songStartDate = songEndDate;
        
        // determine whether we changed the song
        if (this.isSettingSong) {
            this.isSettingSong = false;
        } else {
            this.outsideSourceChangedSong(previousMediaItem, mediaItem, previousStartDate, songEndDate);
        }
        
        // save data for later
        //this.currentSongName = songName;
        //this.currentSongDuration = songLength;
        //this.songStartDate = this.songEndDate;
    },
    // this function gets called whenever the song is changed by Songbird or by the user, but not when we change it
    outsideSourceChangedSong: function(oldMediaItem, newMediaItem, startDate, endDate) {
        // reset the rating menu
        this.clearRatingMenu();

        // check whether we were previously playing a song
        if (oldMediaItem != null) {
            // compute the duration it actually played
            var playedDuration = startDate.timeUntil(endDate);
            var playedName = new Name(oldMediaItem.getProperty(SBProperties.trackName));
            var songLength = oldMediaItem.getProperty(SBProperties.duration) / 1000000;

            // decide whether it was skipped, based on the duration
            if (playedDuration >= songLength * 0.75) {
                // if we get here then it was not skipped
                var newParticipation = new Participation();
                newParticipation.setStartTime(startDate);
                newParticipation.setEndTime(endDate);
                newParticipation.setIntensity(1);
                newParticipation.setActivityName(playedName);
                this.engine.addParticipation(newParticipation);
            } else {
                // if we get here then the song was skipped
                var newRating = new Rating();
                newRating.setActivityName(playedName);
                newRating.setDate(endDate);
                newRating.setScore(0);
                this.engine.addRating(newRating);
            }
        }
        if ((oldMediaItem == null) && (this.getSelectedMediaItem() != null)) {
            // We don't setup our selection listener until after the first song starts
            // If no song was playing previously but something is selected, then the selection did change
            this.didSelectionChange = true;
        }

        // Determine if the previously selected song changed
        if (this.didSelectionChange) {
            // If we get here, then the user clicked on a song and we should make sure that we are playing the chosen song
            var selectedMediaItem = this.getSelectedMediaItem();
            var selectedName = selectedMediaItem.getProperty(SBProperties.trackName);
            // upvote the chosen song
            var newRating = new Rating();
            newRating.setActivityName(new Name(selectedName));
            newRating.setDate(endDate);
            newRating.setScore(1);
            this.engine.addRating(newRating);
            var selectedID = selectedMediaItem.getProperty(SBProperties.GUID);
            var playingID = newMediaItem.getProperty(SBProperties.GUID);
            // Play this song if it hasn't already started
            if (selectedID != playingID) {
                // make sure that the user wants us to control which song is playing
                if (this.state == "on") {
                    this.changeSong(selectedName);
                    // show the user that this song has been automatically upvoted
                    this.showFiveStars();
                }
            } else {
                // show the user that this song has been automatically upvoted
                this.showFiveStars();            
            }
        } else {
            // make sure that the user wants us to control which song is playing
            if (this.state == "on") {
                // So, we choose a song to override the random song
                this.makePlaylist();
            }
        }
        // clear the flag telling whether the selection changed
        this.didSelectionChange = false;
        // Add our song-selection listener again in case the current view changed and this view doesn't have a listener
        this.addSelectionListener();
    },


    /**
    * Called when the pane is about to close
    */
    onUnLoad: function() {
        this._initialized = false;
    },
  
    // chooses the next song to play and switches to that song
    makePlaylist : function() {
        if (!this.isLibraryScanned) {
            this.scanLibrary();
        }
        this.state="on";
        this.changeSong(this.engine.makeRecommendation().getName());
        flushMessage();
    },
    // changes the currently playing song to the song named songName
    changeSong: function(songName) {
        this.isSettingSong = true;
        const properties = Cc["@songbirdnest.com/Songbird/Properties/MutablePropertyArray;1"].createInstance(Ci.sbIMutablePropertyArray);
        var songnamePropertyId = SBProperties.trackName;
        properties.appendProperty(songnamePropertyId, songName);
        var songArray = LibraryUtils.mainLibrary.getItemsByProperties(properties);
        var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
        var songView = LibraryUtils.mainLibrary.createView();
        var songEnumerator = songArray.enumerate();
        var i;
        var song;
        // unfortunately, getItemsByProperties doesn't match case
        // So, we have to go look for the item whose title is capitalized correctly
        for (i = 0; i < songArray.length; i++) {
            song = songEnumerator.getNext();
            var actualName = song.getProperty(songnamePropertyId);
            if (actualName == songName) {
                gMM.sequencer.playView(songView, songView.getIndexForItem(song));
                return;
            }
        }
        
        //gMM.sequencer.playView(songView, songView.getIndexForItem(songArray.enumerate().getNext()));
        //alert("done selecting song");
    },
    clearRatingMenu: function() {
        this._starMenuList.selectedIndex = 0;
    },
    showFiveStars: function() {
        this._starMenuList.selectedIndex = 2;    
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