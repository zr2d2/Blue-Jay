/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: ScatterPlot
 * Description: the ScatterPlot represents a bunch of Datapoints that 
 * have x, y, and weight. It is used to predict y from x
 * Currently it uses nearby x-values although it could later be changed 
 * to compute the least-squares-regression-line if that is a better estimate
 */
 
 function ScatterPlot(){
	/* public function */
	
	//this.ScatterPlot = ScatterPlot;
	this.addDataPoint = addDataPoint;
	this.predict = predict;
	this.getNumPoints = getNumPoints;
	
	//private variables
	var datapoints = [];
	var debugHistory = [];
	//var upperChild; // don't initialize here because that creates an infinite loop // = new ScatterPlot();
	//var lowerChild; // don't initialize here because that creates an infinite loop // = new ScatterPlot();
	var totalWeight = 0.0;
	
	/* public function definition */
	// add data point
	function addDataPoint(datapoint){
		datapoints.push(datapoint);
		var i = 0.0;
		for (i = datapoints.length - 1; i > 0; i--){
			datapoints[i] = datapoints[i-1];
			if (datapoints[i].getX() <= datapoint.getX()){
				break;
			}
		}
		datapoints[i] = datapoint;
		totalWeight = totalWeight + datapoint.getWeight();
	}
	
	// Find the N closest points to x, where N is the 
	// square root of the number of points in the plot
	function predict(x){
		//return new Distribution(0, 0, 0);
	
	    //message("ScatterPlot::predict(" + x + ")");
	    // Make sure there are enough datapoints for a prediction
	    if (datapoints.length < 1) {
		    return new Distribution(0, 0, 0);
	    }
	    var i;
	    /*for (i = 0; i < datapoints.length; i++) {
	        message("x= " + datapoints[i].getX() + "y= " + datapoints[i].getY() + "\r\n");
	    }*/
	    
	    // find the location where x belongs
	    var lowerIndex = 0.0;
	    var upperIndex = datapoints.length - 1;
	    var middleIndex;
	    while (upperIndex > lowerIndex + 1) {
	        middleIndex = Math.floor((lowerIndex + upperIndex) / 2.0);
	        if (datapoints[middleIndex].getX() >= x) {
	            upperIndex = middleIndex;
	        } else {
	            lowerIndex = middleIndex;
	        }
	    }
	    if (datapoints[lowerIndex].getX() + datapoints[upperIndex].getX() >= 2 * x) {
	        middleIndex = lowerIndex;
	    } else {
	        middleIndex = upperIndex;
	    }
	    /*
	    for (i = 0; i < datapoints.length - 1; i++) {
		    if (datapoints[i].getX() >= x)
			    break;
	    }
	    */
        message("datapoints=");
	    for (i = 0; i < datapoints.length; i++) {
	        message("x=" + datapoints[i].getX() + " y=" + datapoints[i].getY() + "\r\n");
	    }
	    
	    // now search for a bunch more nearby points
	    //var middleIndex = i;
	    lowerIndex = middleIndex;
	    upperIndex = middleIndex;
	    message("middleIndex = " + middleIndex + "\r\n");
	    var targetLength = Math.ceil(Math.sqrt(datapoints.length)) - 1;
	    while ((upperIndex - lowerIndex) < targetLength) {
		    if (lowerIndex > 0) {
			    if (upperIndex < datapoints.length - 1) {
				    // if we get here then both the next and previous points exist
				    // choose the next closest point to include
				    if (Math.abs(datapoints[upperIndex + 1].getX() - x) <= Math.abs(datapoints[lowerIndex - 1].getX() - x)) {
					    upperIndex++;
				    } else {
					    lowerIndex--;
				    }
			    } else {
				    // if we get here then there is no next point. So choose the remaining lower points
				    lowerIndex = upperIndex - targetLength;
			    }
		    } else {
			    // if we get here then there is no previous point. So choose the remaining upper points
			    upperIndex = lowerIndex + targetLength;
		    }
	    }
	    //alert("ScatterPlot::predict pt 2");	    
	    // If all these points have the same input then count all datapoints with this input
	    if (datapoints[lowerIndex].getX() == datapoints[upperIndex].getX()) {
		    while ((lowerIndex > 0) && (datapoints[lowerIndex - 1].getX() == datapoints[upperIndex].getX())) {
			    lowerIndex--;
		    }
		    while ((upperIndex < datapoints.length - 1) && (datapoints[upperIndex + 1].getX() == datapoints[lowerIndex].getX())) {
			    upperIndex++;
		    }
	    }
	    message("lowerIndex = " + lowerIndex + " upperIndex = " + upperIndex + "\r\n");	    
	    // Now compute the average and standard deviation of the points in this interval
	    var sumY = 0.0;
	    var sumY2 = 0.0;
	    var n = 0.0;
	    var weight, y;
	    for (i = lowerIndex; i <= upperIndex; i++) {
		    weight = datapoints[i].getWeight();
		    y = datapoints[i].getY();
		    n += weight;
		    sumY += y * weight;
		    sumY2 += y * y * weight;
	    }
	    // Now we can compute the average and standard deviation
	    var average = sumY / n;
	    var stddev;
	    if (n >= 2) {
		    // The typical formula for standard deviation is this:
		    // stddev = sqrt((sumY2 - sumY * sumY / n) / (n - 1));
		    // However, if we assume that the output is between 0 and 1 then we can estimate standard deviation better
		    //stddev = sqrt((sumY2 - sumY * sumY / n) / (n - 1)) + (1 / (n + 1));
		    // currently the +1/(n+1) is taken care of elsewhere (in PredictionLink::guess)
		    stddev = Math.sqrt((sumY2 - sumY * sumY / n) / (n - 1));
		    // The additional (+1/n) is to account for the fact that humans like to give repeated ratings a lot
		    // The user interface might even require it.
		    // We cannot claim that the standard deviation is low until we have a lot of data
	    } else {
	        // If we get here then there is only 1 point
	        // The observed deviation is zero, although there will be more added by the caller
		    stddev = 0;
	    }
	    // decrease the weight based on fraction of unused points, to punish anything that doesn't use much data from its input
	    //double fractionUsed = n / totalWeight;
	    //cout << "fraction used = " << fractionUsed << endl;
	    //Distribution result = Distribution(average, stddev, totalWeight - n);
	    var result = new Distribution(average, stddev, n);
	    //alert("finished ScatterPlot::predict");
	    return result;
	}
	
	function getNumPoints(){
	
		return datapoints.length;
	}
 
 }