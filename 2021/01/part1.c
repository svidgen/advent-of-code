#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

#define LINE_MAX 1024

int main() {

	char *remainder;
	char buffer[LINE_MAX];

	bool hasStarted = false;
	int lastValue = 0;
	int count = 0;

	while (fgets(buffer, sizeof buffer, stdin)) {
		buffer[strlen(buffer) - 1] = 0;
		int currentValue = strtol(buffer, &remainder, 10);

		if (hasStarted && currentValue > lastValue) {
			count++;
		}

		lastValue = currentValue;
		hasStarted = true;
	}

	printf("%d\n", count);
	exit(0);
}
