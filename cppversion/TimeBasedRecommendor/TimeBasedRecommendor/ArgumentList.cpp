#include "stdafx.h"
#include "ArgumentList.h"

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