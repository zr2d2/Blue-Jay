/* Copyright (c) 2011 Bluejay 
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
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