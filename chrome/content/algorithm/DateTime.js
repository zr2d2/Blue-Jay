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
    along with Bluejay.  If not, see <http:/**www.gnu.org/licenses/>.
*/

/** @class simple class that holds date and time */
function DateTime(yyyymmddhhmmss) {
    /**
     * alert("constructing date");
     * public function prototypes
     */
    this.datePlusDuration= datePlusDuration;
    this.stringVersion= stringVersion;
    this.timeUntil = timeUntil;
    this.setComponents = setComponents;
    this.setDurationSinceReference = setDurationSinceReference;
    this.getDurationSinceReference = getDurationSinceReference;
    this.setNow = setNow;   /** makes the date equal to the current date
    this.setInternalValue = setInternalValue;

    /**private variables */
    var value = new Date();
    /**private functions */
    setComponents(yyyymmddhhmmss);

    /** public functions */
    /** create a new date equal to this date plus numSeconds */
    function datePlusDuration(numSeconds) {
        /**
         * var duration = new Date(numSeconds*1000);
         * alert("new Date()");
         */
        var newValue = new Date(value.getTime() + numSeconds*1000);
        /** alert("new DateTime()"); */
        var result = new DateTime();
        /** alert("setInternalValue"); */
        result.setInternalValue(newValue); /** this should be a private function */
        /**
         * alert("my duration " + this.getDurationSinceReference());
         * alert("other duration " + result.getDurationSinceReference());
         * alert("timeUntil");
         */
        var duration = this.timeUntil(result);
        /**
         * alert("checking equality");        
         * if (duration != numSeconds) {
         *     alert(duration + " not equal to " + numSeconds);
         * }
         * alert("returning result");
         */
        return result;
    }

    /** returns a printable string that represents this date */
    function stringVersion() {
        var result = "";
        result += value.getFullYear();
        result += "-";
        result += value.getMonth();
        result += "-";
        result += value.getDate();
        result += "T";
        result += value.getHours();
        result += ":";
        result += value.getMinutes();
        result += ":";
        result += value.getSeconds();
        return result;
        /** return value.toString(); */
    }

    /** duration is in seconds */
    function getDurationSinceReference() {
        return value.valueOf() / 1000.0;
    }
    
    /** duration is in seconds */
    function setDurationSinceReference(numSeconds) {
        value = new Date(numSeconds * 1000);
    }
    /** the number of seconds from this to other */
    function timeUntil(other) {
        /** alert("::timeUntil"); */
        var myDuration = this.getDurationSinceReference();
        /** alert("myDuration = " + myDuration); */
        var otherDuration = other.getDurationSinceReference();
        /** alert("otherDuration = " + otherDuration); */
        var result = otherDuration - myDuration;
        /** alert("result = " + result); */
        return result;
    }
    
    /** make this DateTime object equal to the current date */
    function setNow() {
        value = new Date();
    }
    /** private functions */

    /**
     * assign the given datestring to this date. An example
     * datestring would be "1970-00-01T01:01:01"
     */
    function setComponents(yyyymmddhhmmss) {
        if(!yyyymmddhhmmss) {
            yyyymmddhhmmss = "1970 00 01 00 00 00";
        }
        var i;
        /** replace any kind of separator with spaces */
        yyyymmddhhmmss = yyyymmddhhmmss.replace("-", " ");
        yyyymmddhhmmss = yyyymmddhhmmss.replace("-", " ");
        yyyymmddhhmmss = yyyymmddhhmmss.replace("T", " ");
        yyyymmddhhmmss = yyyymmddhhmmss.replace(":", " ");
        yyyymmddhhmmss = yyyymmddhhmmss.replace(":", " ");
        /**
         * split it into pieces and assign
         * the date components accordingly
         */
        var newTime = yyyymmddhhmmss.split(" ");
        value.setYear(newTime[0]);
        value.setMonth(newTime[1]);
        value.setDate(newTime[2]);
        value.setHours(newTime[3]);
        value.setMinutes(newTime[4]);
        value.setSeconds(newTime[5]);
    }
    function setInternalValue(newValue) {
        value = newValue;
    }
    /** alert("done constructing date"); */
};

/**
 * returns true if t1 comes before t2, and
 * false if t2 is equal to or after t1
 */
function strictlyChronologicallyOrdered(t1, t2) {
    if (t1.timeUntil(t2)>0) {
        return true;
    }
    return false;
}


