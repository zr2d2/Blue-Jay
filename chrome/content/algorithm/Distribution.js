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
