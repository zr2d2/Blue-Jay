#include "stdafx.h"
#include "ArgumentList.h"

// The ArgumentList class represents a list of arguments
// It's essentially a vector of strings
ArgumentList::ArgumentList(int argc, char* argv[])
{
	this->numArguments = argc;
	this->argumentValues = argv;
}
ArgumentList::~ArgumentList()
{
//free(argumentValues[]);
}

int ArgumentList::getNumArguments(void)
{
	return this->numArguments;
}
char* ArgumentList::getArgument(int index)
{
	if (index >= this->numArguments)
		return NULL;
	return this->argumentValues[index];
}