/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: Rating
 * Description: the Rating class is a score that is assigned to a certain 
 * Candidate at a certain time
 */


function Rating() {
    //public function prototypes
    this.setActivityName = setActivityName;
    this.getActivityName = getActivityName;
    this.setDate = setDate;
    this.getDate = getDate;
    this.setScore = setScore;
    this.getScore = getScore;
    this.setWeight = setWeight;
    this.getWeight = getWeight;
    this.stringVersion = stringVersion;
    
    //private variables 
    var activityName = new Name();
    var creationDate = new Date();
    var score = 0;
    var weight = 1;

    //public functions
	
	// set activity name
    function setActivityName(name) {
        activityName = name.makeCopy();
    }
	// return activity name
    function getActivityName() {
        return activityName;
    }

	// set date
    function setDate(date) {
        creationDate = date;
    }
	// retun the date when it was created
    function getDate() {
        return creationDate;
    }

	// set score
    function setScore(newValue) {
        score = newValue;
    }
	// return score
    function getScore() {
        return score;
    }

	// set weight
    function setWeight(newWeight) {
        weight = newWeight;
    }
	// return weight
    function getWeight() {
        return weight;
    }

    // returns a string representing this Rating
    function stringVersion() {
        var result = "<Rating>";
        result += ("<Activity>" + activityName.getName() + "</Activity>");
        result += ("<Score>" + score + "</Score>");
        if (creationDate) {
            result += ("<Date>" + creationDate.stringVersion() + "</Date>");
        }
        result += "</Rating>";
        return result;
    }
};

// Tells which rating comes first chronologically for the purposes of sorting
function RatingPrecedes() {
    //public function prototypes
    this.operator = operator;

    //public functions
    //create a new date equal to this date plus numSeconds
    function operator(r1, r2) {
        var t1 = r1;
        var t2 = r2;
        // first sort by date
        if (strictlyChronologicallyOrdered(t1, t2)) {
            return true;
        }
        if (strictlyChronologicallyOrdered(t2, t1)) {
            return false;
        }
        // break ties by name
        return r1.getActivityName() < r2.getActivityName();
    }
};
