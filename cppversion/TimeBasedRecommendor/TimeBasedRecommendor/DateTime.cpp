#include "stdafx.h"
#include "DateTime.h"
#include <time.h>
#include <string>
#include <iostream>
#include <sstream>

using namespace std;
DateTime::DateTime(void)
{
	//this->setComponents("1970-01-00T00:00:00");
	time(&(this->value));
}
DateTime::DateTime(string yyyymmddhhmmss)
{
	this->setComponents(yyyymmddhhmmss);
}
DateTime DateTime::datePlusDuration(double numSeconds)
{
	DateTime result;
	result.value = (int)(this->value + numSeconds);
	if (this->timeUntil(result) != numSeconds)
		cout << "date addition error" << endl;
	return result;
}


void DateTime::setComponents(string yyyymmddhhmmss)
{
	int year, month, day, hour, minute, second;
	// read the components from the string
	const char* cString = yyyymmddhhmmss.c_str();
	int totalSize = strlen(cString);
	stringstream stream;
	stream << cString;
	stream >> year;
	stream.ignore(1);
	stream >> month;
	stream.ignore(1);
	stream >> day;
	stream.ignore(1);
	stream >> hour;
	stream.ignore(1);
	stream >> minute;
	stream.ignore(1);
	stream >> second;
	//cout << "date components = " << year << month << day << minute << second << endl;
	//sscanf_s(yyyymmddhhmmss.c_str(), "%04d-%02d-%02dT%02d:%02d:%02d", &year, &month, &day, &hour, &minute, &second, totalSize);
	//printf("datetime string = %s \r\n", yyyymmddhhmmss.c_str());
	//printf("length = ");
	//printf("%d\r\n", yyyymmddhhmmss.length());
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
	//printf("");
	// convert the components into a date and time	
	this->value = mktime(&timeInfo);
	//printf("new date = %s\r\n", this->stringVersion().c_str());
}

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
double DateTime::timeUntil(const DateTime& other) const
{
	double result = difftime(other.value, this->value);
	return result;
}
bool strictlyChronologicallyOrdered(const DateTime& t1, const DateTime& t2)
{
	if (t1.timeUntil(t2) > 0)
		return true;
	else
		return false;
}
