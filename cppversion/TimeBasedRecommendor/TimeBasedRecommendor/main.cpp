// main.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

#include "TimeBasedRecommendor.h"

int main(int argc, char* argv[])
{
	TimeBasedRecommendor* recommendor = new TimeBasedRecommendor();
	ArgumentList* arguments = new ArgumentList(argc, argv);
	recommendor->parseArguments(arguments);

	//int i;
	//for (i = 0; i < 1000; i++)
	//	printf("This is a test string\r\n");

	return 0;
}

