/*
    Copyright (C) 2012 Bluejay

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

/* Name: Participation
 * Description: the Participation class represents an instance of listening
 * to a song or to a song category
 */

function Participation() {
	//public function prototypes
	this.setStartTime = setStartTime;
	this.getStartTime = getStartTime;
	this.setEndTime = setEndTime;
	this.getEndTime = getEndTime;
	// The suffix "Time" here is to be replaced with the suffix "Date" in the future, for more consistency
	this.setStartDate = setStartTime;
	this.getStartDate = getStartTime;
	this.setEndDate = setEndTime;
	this.getEndDate = getEndTime;
	this.setActivityName = setActivityName;
	this.getActivityName = getActivityName;
	this.setIntensity = setIntensity;
	this.getIntensity = getIntensity;
	this.stringVersion = stringVersion;
	
	//private variables 
	var value = 1;
	var startTime = new DateTime();
	var endTime = new DateTime();
	var activityName = new Name();
	
	//public functions
	
	// set the start time
	function setStartTime(start) {
		startTime = start;
	}
	
	// returns the start time
	function getStartTime() {
		return startTime;
	}
	
	// set the end time
	function setEndTime(end) {
		endTime = end;
	}
	
	// returns the end time
	function getEndTime() {
		return endTime;
	}
	
	// set the activity name
	function setActivityName(name) {
		activityName = name;
	}
	
	// return the activity name 
	function getActivityName() {
		return activityName;
	}
	
	// set intensity
	function setIntensity(intensity) {
		value = intensity;
	}
	
	// returns intensity
	function getIntensity() {
		return value;
	}
	
	function stringVersion() {
	    var result = "<Participation>";
	    result += "<Activity>" + this.getActivityName().getName() + "</Activity>";
	    result += "<StartDate>" + startTime.stringVersion() + "</StartDate>";
	    result += "<EndDate>" + endTime.stringVersion() + "</EndDate>";
	    result += "</Participation>";
	    return result;
	}
	
	
};

// Tells which rating comes first chronologically for the purposes of sorting
function ParticipationPrecedes(p1, p2) {

	//public function
	if(strictlyChronologicallyOrdered(p1.getEndTime(), p2.getEndTime()))
		return true;
	return false;

};
