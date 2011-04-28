/**
 * PredictionLink object
 */
 
 function PredictionLink(passedVal1, passedVal2){
    //alert("constructing predictionLink\r\n");
	//public function
	this.initializeDecreasing = initializeDecreasing;
	this.update = update;
	this.guess = guess;
	
	
	//private variables
	var inputData = passedVal1;
	var outputData = passedVal2;
    //alert("constructing Scatterplot\r\n");
	var plot = new ScatterPlot();
    //alert("constructing DateTime\r\n");
	var latestUpdateTime = new DateTime();
	var numChanges = 0.0;
	
	//message("making prediction link part 1\r\n");
	// check whether this link is predicting something from its own past history
	if (inputData.getOwnerName().equalTo(outputData.getOwnerName())) {
	    //message("making prediction link part 2\r\n");
		// check whether this link is using the participation history
		if (inputData.isAParticipationMovingAverage()) {
    	    //message("making prediction link part 3\r\n");
			// If we get here then we're predicting the score of a Candidate based on its past frequency
			// Usually, if something has happened a lot recently then it will be boring in the future
			this.initializeDecreasing();
		}
	}


	//public function
	function initializeDecreasing(){
	    //message("making prediction link part 4\r\n");
	
		var intensity = 1;
		var numPoints = 40;
		var i = 0;
		var score = 0.0;
		var duration = 0.0;
		
		for (i = 0; i < numPoints; i++){
		
			duration = i*1500.0;
			intensity = 1.0/duration;
			score = Math.sqrt(duration) / 250.0;
			plot.addDataPoint(new Datapoint(intensity, score, 1));
		}
		numChanges = numChanges + numPoints;
	}
	
	function update(){

        //alert("PredictionLink::update\r\n");
		var newPoints = inputData.getCorrelationsFor(outputData, latestUpdateTime);
        //alert("back in PredictionLink::update\r\n");
		
		if (newPoints[0].length > 0){
		
			var i=0;
            //alert("plot adding datapoints\r\n");
			for (i = 0; i < newPoints[0].length; i++) {
				plot.addDataPoint(newPoints[0][i]);
			}
		
			latestUpdateTime = outputData.getLatestDate();
			numChanges = numChanges + newPoints[1];
            //alert("plot done adding datapoints\r\n");
		}
	}
	
	function guess(when){
	
		//alert("PredictionLink::guess");
		
		var input = inputData.getCurrentValue(when, false);
		var middle = plot.predict(input.getMean());
		
		//document.writeln('x ='+input.getMean());
		//document.writeln('middle = ' + middle.getMean());
		
		var leftOneStdDev = plot.predict(input.getMean() - input.getStdDev());
		//document.writeln(' left = ' + leftOneStdDev.getMean());
		
		var rightOneStdDev = plot.predict(input.getMean() + input.getStdDev());
		//document.writeln(' right = ' + rightOneStdDev.getMean());
		
		//alert("PredictionLink::guess pt2");
		
		var stdDevA = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2.0;
		var stdDevB = middle.getStdDev();
		var stdDev = Math.sqrt(stdDevA * stdDevA + stdDevB * stdDevB);

		//alert("PredictionLink::guess pt3");
		
		var weight = numChanges - 1.0;
		if (weight < 0.0){
			weight = 0.0;
		}
		
		var stdDev2;
		
		if (weight >= 1){
			stdDev2 = 1.0 / weight;
		} else {
			stdDev2 = 1.0;
		}
		
		var result = new Distribution(middle.getMean(), stdDev + stdDev2, weight);
		//alert("PredictionLink::guess pt4");
		return result;
	}
}
		
	
	
	
	
	
	
	
	
	