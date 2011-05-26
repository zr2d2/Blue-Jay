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

/* Name: ArgumentList 
 * Description: It's not used anymore.
 */

function ArgumentList(argc, argv) {
	//public function prototypes
	this.getNumArguments = getNumArguments;
	this.getArgument = getArgument;
	
	//private variables 
	var numArguments = argc | 0;
	var argumentValues = argv | {};
	
	//public functions
	function getNumArguments() {
		return numArguments;
	}
	
	function getArgument(index) {
		return argumentValues[index];
	}
	
	
};
