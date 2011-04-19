/**
 * ScatterPlot object
 */
 
 function ScatterPlot(){
	//public function
	//this.ScatterPlot = ScatterPlot;
	this.addDataPoint = addDataPoint;
	this.predict = predict;
	this.getNumPoints = getNumPoints;
	
	//private variables
	var datapoins = [];
	var debugHistory = [];
	var upperChild = new ScatterPlot();
	var lowerChild = new ScatterPlot();
	var totalWeight = 0;
	
	//public function
	function addDataPoint(datapoint){
	
		datapoints.push(datapoint);
		var i = 0;
		for ( i = datapoins.length -1; i> 0; i--){
		
			datapoints[i] = datapoints[i-1];
			if (datapoints[i].getX() <= datapoint.getX()){
				break;
			}
		}
		datapoints[i] = datapoints;
		totalWeight = totalWeight + datapoint.getWeight();
	}
	
	function predict(x){
	
	 // debug conversion....
	 
	}
	
	function getNumPoints(){
	
		return datapoints.length();
	}
 
 }