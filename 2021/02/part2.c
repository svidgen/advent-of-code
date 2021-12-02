#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LINE_MAX 100

int main() {

	int distance = 0;
	int depth = 0;
	int aim = 0;

	char direction[LINE_MAX];
	int magnitude;

	while (scanf("%s %i", direction, &magnitude) > 0) {
		if (strcmp(direction, "forward") == 0) {
			distance += magnitude;
			depth += aim * magnitude;
		} else if (strcmp(direction, "up") == 0) {
			aim -= magnitude;
		} else if (strcmp(direction, "down") == 0) {
			aim += magnitude;
		}
	}

	printf("distance (%i) * depth (%i) = %i\n", distance, depth, distance * depth);
	exit(0);
}

