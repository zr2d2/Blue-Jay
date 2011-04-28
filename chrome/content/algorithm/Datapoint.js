/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: Datapoint
 * Description: simple class with x, y, and weight
 */
 

// simple class with x, y, and weight
function Datapoint(x, y, weight){

    // public function prototypes
    this.getX = getX;
    this.getY = getY;
    this.getWeight = getWeight;

    // private variables 
    var itsX = x;
    var itsY = y;
    var itsWeight = weight;

	// get x value
    function getX(){
        return itsX;
    }

	// get y value
    function getY(){
        return itsY;
    }
	
	// get weight value
    function getWeight(){
        return itsWeight;
    }
};

