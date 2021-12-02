#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LINE_MAX 100

int main() {

	char direction[LINE_MAX];
	int magnitude;
	int distance = 0;
	int depth = 0;

	while (scanf("%s %i", direction, &magnitude) > 0) {
		if (strcmp(direction, "forward") == 0) {
			distance += magnitude;
			printf("distance += magnitude (%i) = %i\n", magnitude, distance);
		} else if (strcmp(direction, "up") == 0) {
			depth -= magnitude;
			printf("depth -= magnitude (%i) = %i\n", magnitude, depth);
		} else if (strcmp(direction, "down") == 0) {
			depth += magnitude;
			printf("depth += magnitude (%i) = %i\n", magnitude, depth);
		}
	}

	printf("distance (%i) * depth (%i) = %i\n", distance, depth, distance * depth);
	exit(0);
}

