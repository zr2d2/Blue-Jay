/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: Distribution
 * Description: the Distribution class represents a summary of a collection 
 * of floating-point numbers it stores average, spread, and count (although even count may be fractional)
 */
 
function Distribution(average, stdDev, relativeWidth) {
	//public function prototypes
	this.getMean = getMean;
	this.getStdDev = getStdDev;
	this.getWeight = getWeight;
	
	//private variables 
	var mean = average;
	var standardDeviation = stdDev;
	var weight = relativeWidth;
	
	/* public functions */
	
	// returns mean value
	function getMean() {
		return mean;
	}
	
	// returns standard deviation
	function getStdDev() {
		return standardDeviation;
	}
	// returns weight
	function getWeight() {
		return weight;
	}
};