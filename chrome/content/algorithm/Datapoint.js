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

/* Name: Datapoint
 * Description: simple class with x, y, and weight
 */

// simple class with x, y, and weight
function Datapoint(x, y, weight) {

    // public function prototypes
    this.getX = getX;
    this.getY = getY;
    this.getWeight = getWeight;

    // private variables 
    var itsX = x;
    var itsY = y;
    var itsWeight = weight;

	// get x value
    function getX() {
        return itsX;
    }

	// get y value
    function getY() {
        return itsY;
    }
	
	// get weight value
    function getWeight() {
        return itsWeight;
    }
};

