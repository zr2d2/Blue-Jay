/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
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
	this.setActivityName = setActivityName;
	this.getActivityName = getActivityName;
	this.setIntensity = setIntensity;
	this.getIntensity = getIntensity;
	
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
	
	
};

// Tells which rating comes first chronologically for the purposes of sorting
function ParticipationPrecedes(p1, p2) {

	//public function
	if(strictlyChronologicallyOrdered(p1.getEndTime(), p2.getEndTime()))
		return true;
	return false;

};