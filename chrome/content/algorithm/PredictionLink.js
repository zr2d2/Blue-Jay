/**
 * PredictionLink object
 */
 
 function PredictionLink(passedVal1, passedVal2){
	//public function
	this.initializeDecreasing = initializeDecreasing;
	this.update = update;
	this.guess = guess;
	
	// ##### problem with constructor!!! #####
	
	//private variables
	var inputData = passedVal1 | new MovingAverage();
	var outputData = passedVal2 | new RatingMovingAverage();
	var plot = new ScatterPlot();
	var latestUpdateTime = new DateTime();
	var numChanges = 0;
	
	
	//public function
	function initializeDecreasing(){
	
		var intensity = 1;
		var numPoints = 40;
		var i =0;
		var score = 0;
		var duration = 0;
		
		for (i = 0; i< numPoints; i++){
		
			duration = i*1500.0;
			intensity = 1.0/duration;
			score = Math.sqrt(duration) / 250;
			plot.addDataPoint(Datapoint(intensity, score, 1));
		}
		numChanges = numChanges + numPoints;
	}
	
	function update(){
	
		// creating a pair in javascript is hard, creating an array might be easier
		// depends on how the movingAverage define getCorrelationsFor
		var newPoints = [inputData->getCorrelationsFor(*(this->outputData), this->latestUpdateTime);
		
		/*if (newPoints.first.size() > 0)
		{
		// put them into the scatterplot
		unsigned int i;
		for (i = 0; i < newPoints.first.size(); i++)
		{
			//cout << "adding a point to a PredictionLink" << endl;
			this->plot.addDataPoint(newPoints.first[i]);
		}
		// update the latest update time
		this->latestUpdateTime = this->outputData->getLatestDate();
		// keep track of how much useful data we have
		this->numChanges += newPoints.second;
		}*/
	
	}
	
	function guess(when){
	
		document.writeln('PredictionLink::guess');
		
		var input = inputData.getCurrentValue(when, false);
		var middle = plot.predict(input.getMean());
		
		document.writeln('x ='+input.getMean());
		document.writeln('middle = ' + middle.getMean());
		
		var leftOneStdDev = plot.predict(input.getMean() - input.getStdDev());
		document.writeln(' left = ' + leftOneStdDev.getMean());
		
		var rightOneStdDev = plot.predict(input.getMean() + input.getStdDev());
		document.writeln(' right = ' + rightOneStdDev.getMean());
		
		var stdDevA = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2;
		var stdDevB = middle.getStdDev();
		var stdDev = Math.sqrt(stdDevA * stdDevA + stdDevB * stdDevB);
		
		var weight = numChanges -1;
		if (weight < 0){
			weight = 0;
		}
		
		var stdDev2;
		
		if (weight >= 1){
			stdDev2 = 1/weight;
		}
		else {
			stdDev2 = 1;
		}
		
		var result = new Distribution(middle.getMean(), stdDev + stdDev2, weight);
		return result;
		
	}
		
		
	
	
	
	
	
	
	
	
	