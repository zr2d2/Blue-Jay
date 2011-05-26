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

/* Name: PredictionLink
 * Description: The PredictionLink class is used to estimate the rating 
 * that will be given to another song (or category) based on an attribute 
 * of another song (or category)
 */

 function PredictionLink(passedVal1, passedVal2) {
    //alert("constructing predictionLink\r\n");
	
	/* public function */
	this.initializeDecreasing = initializeDecreasing;
	this.initializeIncreasing = initializeIncreasing;
	this.update = update;
	this.guess = guess;
	
	
	//private variables
	var inputData = passedVal1;
	var outputData = passedVal2;
    //alert("constructing Scatterplot\r\n");
	var plot = new ScatterPlot();
    //alert("constructing DateTime\r\n");
	var previousNumRatings = 0;
	var numChanges = 0.0;
	
	//message("making prediction link part 1\r\n");
	// check whether this link is predicting something from its own past history
	if (inputData.getOwnerName().equalTo(outputData.getOwnerName())) {
	
	    //message("making prediction link part 2\r\n");
		// check whether this link is using the participation history
		if (inputData.isAParticipationMovingAverage()) {
    	    //message("making prediction link part 3\r\n");
			
			// If we get here then we're predicting the score of a Candidate based
			// on its past frequency. Usually, if something has happened a lot recently 
			// then it will be boring in the future
			//this.initializeDecreasing();
		} else {
			// If we get here then we're predicting the score of a Candidate based
			// on its current score. If we start with a small amount of suspicion that it will
			// be positively correlated then we may save the user lots of time
			// We use a small weight, though, so it's easy to overpower
		    this.initializeIncreasing();
		}
	}
	


	//public functions
	// initialize this PredictionLink with the assumption that the data is negatively correlated
	function initializeDecreasing() {
	    //message("making prediction link part 4\r\n");
	
		var intensity = 1;
		var numPoints = 40;
		var i = 0;
		var score = 0.0;
		var duration = 0.0;
		
		for (i = 0; i < numPoints; i++) {
    		
			/*duration = i*1500.0;
			intensity = 1.0/duration;
			score = Math.sqrt(duration) / 250.0;
			*/
			duration = i * 1500;
			intensity = 1 / duration;
			score = i / numPoints;
			
			// add some extra variation to show that we aren't sure about this
			if (i % 2 == 0)
			    score = (1 + score) / 2;
			else
			    score = score / 2;
			plot.addDataPoint(new Datapoint(intensity, score, 1));
		}
		numChanges = numChanges + numPoints;
	}
	
	// initialize this PredictionLink with the assumption that the data is positively correlated
	function initializeIncreasing() {
	    plot.addDataPoint(new Datapoint(0, 0, 1));
	    plot.addDataPoint(new Datapoint(0, 0, 1));
	    plot.addDataPoint(new Datapoint(0, 0, 1));
	    plot.addDataPoint(new Datapoint(.25, .25, 1));
	    plot.addDataPoint(new Datapoint(.5, .5, 1));
	    plot.addDataPoint(new Datapoint(.75, .75, 1));
	    // We want at least sqrt(n) points with x=y=1 so that when input=1 we predict output=1
	    plot.addDataPoint(new Datapoint(1, 1, 1));
	    plot.addDataPoint(new Datapoint(1, 1, 1));
	    plot.addDataPoint(new Datapoint(1, 1, 1));
	    // numChanges is a measure of how certain we are. It doesn't need to equal the number of data points
	    numChanges += 4;
	}
	
	// updates the scatterplot with any new data that it hadn't yet 
	// requested from the MovingAverage that it tries to estimate
	function update() {
        //alert("PredictionLink::update\r\n");
		var newPoints = inputData.getCorrelationsFor(outputData, previousNumRatings);
        //alert("back in PredictionLink::update\r\n");
		
        //message("plot adding " + newPoints[0].length + " datapoints\r\n");
		if (newPoints[0].length > 0) {
		
			var i=0;
			for (i = 0; i < newPoints[0].length; i++) {
				plot.addDataPoint(newPoints[0][i]);
			}
		
			latestUpdateTime = outputData.getLatestDate();
			numChanges = numChanges + newPoints[1];
            //alert("plot done adding datapoints\r\n");
		}
		previousNumRatings = outputData.getNumRatings();
	}
	
	// compute a distribution that represents the expected deviation from the overall mean
	function guess(when) {
	    // if we don't have any data...
	    if (inputData.getIndexForDate(when, false) < 0) {
	        // then we should return a guess with no weight
	        return new Distribution(0, 0, 0);
	    }
		//alert("PredictionLink::guess");

        // get the current value of the input. This value is a distribution, not a float		
		var input = inputData.getCurrentValue(when, false);
		// make a guess for this input
		var middle = plot.predict(input.getMean());
		
		message("PredictionLink input = "+input.getMean());
		message("middle = " + middle.getMean());
		
	    var stdDevA = middle.getStdDev();
	    var stdDevB = 0;
	    // If there is uncertainty in the input, then the slope of the line affects the output uncertainty
		if (input.getStdDev() > 0) {
		    var leftOneStdDev = plot.predict(input.getMean() - input.getStdDev());
		    message(" left output = " + leftOneStdDev.getMean());
    		
		    var rightOneStdDev = plot.predict(input.getMean() + input.getStdDev());
		    message(" right output = " + rightOneStdDev.getMean());
    		
		    //alert("PredictionLink::guess pt2");
    		stdDevB = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2.0;
        }
	    var stdDev = Math.sqrt(stdDevA * stdDevA + stdDevB * stdDevB);

		//alert("PredictionLink::guess pt3");
		
		//var weight = numChanges - 1.0;
		var weight = numChanges;
		if (weight < 0.0) {
			weight = 0.0;
		}
		var stdDev2;
		if (numChanges > 0)
		    stdDev2 = .5 / numChanges;
		else
    		stdDev2 = 0.5;
    				
		var result = new Distribution(middle.getMean(), stdDev + stdDev2, weight);
		//alert("PredictionLink::guess pt4");
		return result;
	}
}
		
	
	
	
	
	
	
	
	
	
