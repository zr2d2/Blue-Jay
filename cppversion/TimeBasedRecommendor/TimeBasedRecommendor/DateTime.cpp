#include "stdafx.h"
#include "DateTime.h"
#include <time.h>
#include <string>
#include <iostream>
#include <sstream>

using namespace std;
DateTime::DateTime(void)
{
	// initialize the date to a long time ago
	this->setComponents("1970-01-01T01:01:01");
	//time(&(this->value));
}
DateTime::DateTime(string yyyymmddhhmmss)
{
	// assign the given datestring to this date
	this->setComponents(yyyymmddhhmmss);
}
// create a new date equal to this date plus numSeconds
DateTime DateTime::datePlusDuration(double numSeconds)
{
	DateTime result;
	result.value = (int)(this->value + numSeconds);
	if (this->timeUntil(result) != numSeconds)
		cout << "date addition error" << endl;
	return result;
}

// assign the given datestring to this date
// An example datestring would be "1970-01-01T01:01:01"
void DateTime::setComponents(string yyyymmddhhmmss)
{
	int year, month, day, hour, minute, second;
	// read the components from the string
	const char* cString = yyyymmddhhmmss.c_str();
	int totalSize = strlen(cString);
	stringstream stream;
	stream << cString;
	stream >> year;
	stream.ignore(1);	// ignore the "-"
	stream >> month;
	stream.ignore(1);	// ignore the "-"
	stream >> day;
	stream.ignore(1);	// ignore the "T"
	stream >> hour;
	stream.ignore(1);	// ignore the ":"
	stream >> minute;
	stream.ignore(1);	// ignore the ":"
	stream >> second;
	// create the time structure and fill the components in
	struct tm timeInfo;
	timeInfo.tm_year = year - 1900;
	timeInfo.tm_mon = month - 1;
	timeInfo.tm_mday = day;
	timeInfo.tm_hour = hour;
	timeInfo.tm_min = minute;
	timeInfo.tm_sec = second;
	timeInfo.tm_isdst = -1;
	timeInfo.tm_wday = -1;
	timeInfo.tm_yday = -1;
	// convert the components into a date and time	
	this->value = mktime(&timeInfo);
}

// returns a printable string that represents this date
string DateTime::stringVersion(void) const
{
	struct tm timeInfo;
	localtime_s(&timeInfo, &this->value);
	const int size = 100;
	char characters[size];
	sprintf_s(characters, size, "year = %d, month = %d, day = %d, hour = %d, minute = %d, second = %d", timeInfo.tm_year + 1900, timeInfo.tm_mon + 1, timeInfo.tm_mday, timeInfo.tm_hour, timeInfo.tm_min, timeInfo.tm_sec);
	string result(characters);
	return result;
}
// the number of seconds from this to other
double DateTime::timeUntil(const DateTime& other) const
{
	double result = difftime(other.value, this->value);
	return result;
}
// returns true if t1 comes before t2, and false if t2 is equal to or after t1
bool strictlyChronologicallyOrdered(const DateTime& t1, const DateTime& t2)
{
	if (t1.timeUntil(t2) > 0)
		return true;
	return false;
}
