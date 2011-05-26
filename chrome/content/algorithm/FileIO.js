/*
    Copyright (C) 2011 Bluejay

    This file is part of Bluejay.

    Bluejay is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Bluejay is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Bluejay.  If not, see <http://www.gnu.org/licenses/>.
*/

/* Name: FileIO
 * Description: This is a class that handles read and write a file
 */

messageToWrite = "";
FileIO = {

    /* Public Methods */

    // read the file and return a string containing the file contents
    readFile : function(fileName) {
        var homeDirFile = FileIO.getHomeDirectory();

        var file = homeDirFile;
        file.append(fileName);
        alert("FileIO reading file" + file.path);
        //alert("making input stream");
		
        // open an input stream from the file
        var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                      createInstance(Components.interfaces.nsIFileInputStream);
        //alert("reading point 2");
        istream.init(file, 0x01, 0444, 0);
        //alert("reading point 3");
         
         var converter = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                createInstance(Components.interfaces.nsIConverterInputStream);
        //alert("reading point 4");
        var replacementCharacter = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER
        converter.init(istream, "UTF-8", 0, replacementCharacter);
        //alert("reading point 5");
        var stringContents = "";
        var tempString = {};
        while (converter.readString(4096, tempString) != 0) {
            //message(tempString.value, 3);
            stringContents += tempString.value;
        }

        //alert("reading point 6");
        converter.close(); // this closes foStream

        // do something with the read data
        //alert("filecontents = " + stringContents);
        //alert("done getting file data");
        return stringContents;
    },
    
    // Writes the given string to the file. "append" tells whether to append the data or clear the file first
    writeFile : function(fileName, stringData, append) {
        homeDirFile = FileIO.getHomeDirectory();

        var file = homeDirFile;
        file.append(fileName);
        //alert("writing file " + file.path);
        
        var data = stringData
        // file is nsIFile, data is a string
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                       createInstance(Components.interfaces.nsIFileOutputStream);
        //alert("writing files part 1");
         
        // use 0x02 | 0x10 to open file for appending.
        /*
        File_io_flags 	
            0×01 	Read only
	        0×02 	Write only
            0×04    Read and Write
	        0×08 	Create File
	        0×10 	Append
	        0×20 	Truncate
	        0×40 	Sync
	        0×80 	Exclude
	        */
	    if (append)
            foStream.init(file, 0x02 | 0x08 | 0x10, 0666, 0);
        else
            foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
        
        // write, create, truncate
        // In a c file operation, we have no need to set file mode with or operation,
        // directly using "r" or "w" usually.
         
        // if you are sure there will never ever be any non-ascii text in data you can
        // also call foStream.writeData directly
        //alert("writing files part 2");
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                        createInstance(Components.interfaces.nsIConverterOutputStream);
        //alert("writing files part 3");
        converter.init(foStream, "UTF-8", 0, 0);
        //alert("writing files part 4");
        converter.writeString(data);
        //alert("writing files part 5");
        converter.close(); // this closes foStream

        //alert("done writing file " + fileName);
    },

	/* Private Methods */

    getHomeDirectory : function() {
        // This will choose the user's home directory
        var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
                         getService(Components.interfaces.nsIProperties);
        var homeDirFile = dirService.get("Home", Components.interfaces.nsIFile); // returns an nsIFile object
        return homeDirFile;
    }
	/* Member Variables */

};

// the text is the message to send
// the priority determines whether it's a debug message or an important one
function message(text, priority) {
    // supply a default priority of 0 if none is provided
    if (!priority) {
        priority = 0;
    }
    //priority = 1;
    // only save messages that we care about
    // If we're not debugging then don't include debug messages
    if (priority > 0) {
        // append the text to the end of the output file
        //FileIO.writeFile("bluejay_output.txt", text, 1);
        //messageToWrite += text;
    }
};

// append the text to the end of the output file
function flushMessage() {
    if (messageToWrite.length > 0) {
        FileIO.writeFile("bluejay_output.txt", messageToWrite, 1);
        messageToWrite = "";
    }
}
