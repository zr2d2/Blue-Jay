// main.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "TimeBasedRecommendor.h"
#include <iostream>

using namespace std;

int main(int argc, char* argv[])
{
	TimeBasedRecommendor* recommendor = new TimeBasedRecommendor();
	ArgumentList* arguments = new ArgumentList(argc, argv);
	if (arguments->getNumArguments() == 0)
	{
		// if they didn't give any arguments then we should tell them what the commands do
		cout << "option:				effect" << endl;
		cout << "open					read a file" << endl;
		cout << "rate [name][date]		estimate what the rating for candidate named [name] would be at date [date]" << endl;
		cout << "reccomend [date]		estimate the rating of all candidates at [date] and find the best one" << endl;
		cout << endl;
		cout << "sample usage:" << endl;
		cout << "TimeBasedRecommendor.exe open inheritances.txt open ratings.txt recommend 2011-3-27T23:20:00" << endl;
	}
	else
	{
		// if they did give at least one argument then do what they requested
		recommendor->parseArguments(arguments);
	}

	//int i;
	//for (i = 0; i < 1000; i++)
	//	printf("This is a test string\r\n");

	return 0;
}

