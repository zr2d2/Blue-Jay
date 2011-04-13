
/**
 * The class that handles the reading and writing of files
 */
FileIO = {

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////

    readFile : function(fileName) {
        alert("FileIO reading file" + fileName);
    
        var homeDirFile = FileIO.getHomeDirectory();

        var file = homeDirFile;
        file.append(fileName);
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
        converter.init(istream, "UTF-8", 0, 0);
        //alert("reading point 5");
        var stringContents = "";
        var tempString = {};
        while (converter.readString(4096, tempString) != 0) {
            stringContents += tempString.value;
        }

        //data = converter.readString();
        //alert("reading point 6");
        converter.close(); // this closes foStream

        // do something with read data
        alert("filecontents = " + stringContents);
        return stringContents;
    },
    
    writeFile : function(fileName, stringData) {
        alert("writing file " + fileName);
        homeDirFile = FileIO.getHomeDirectory();

        var file = homeDirFile;
        file.append(fileName);
        
        var data = stringData
        // file is nsIFile, data is a string
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                       createInstance(Components.interfaces.nsIFileOutputStream);
        //alert("writing files part 1");
         
        // use 0x02 | 0x10 to open file for appending.
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

        alert("done writing file " + fileName);
    },
/////////////////////////////////////////////////////// Private Methods ///////////////////////////////////////////////////

    getHomeDirectory : function() {
        var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
                         getService(Components.interfaces.nsIProperties);
        var homeDirFile = dirService.get("Home", Components.interfaces.nsIFile); // returns an nsIFile object
        return homeDirFile;
    }
/////////////////////////////////////////////////////// Member Variables ///////////////////////////////////////////////////

};