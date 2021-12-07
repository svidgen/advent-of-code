#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define ARRAY_INIT 100
#define ARRAY_INC 2

typedef struct {
	size_t length;
	size_t max;
	int *items;
} IntArray;

IntArray * new_array() {
	IntArray *a = malloc(sizeof(IntArray));
	a->length = 0;
	a->max = ARRAY_INIT;
	a->items = malloc(sizeof(int) * ARRAY_INIT);
	return a;
}

int array_push(IntArray *a, int value) {
	int resize = 0;

	if (a->length == a->max) {
		resize = a->max * ARRAY_INC;
		a->items = realloc(a->items, sizeof(int) * resize);
		a->max = resize;
	}

	a->items[a->length] = value;
	a->length++;
	return a->length;
}

void array_free(IntArray *a) {
	free(a->items);
	free(a);
}

void print_array(IntArray *a) {
	printf("[");
	for (int i = 0; i < a->length; i++) {
		printf("%i", a->items[i]);
		if (i < a->length - 1) {
			printf(", ");
		}
	}
	printf("]\n");
}

int is_eof_next() {
	int v = 0;
	char c = getchar();
	if (c == EOF) v = 1;
	ungetc(c, stdin);
	return v;
}

int read_number() {
	int started = 0;
	int v = 0;
	char c;
	for (int i = 0; i < 10; i++) {
		c = getchar();

		if (c >= '0' && c <= '9') {
			started = 1;
			v = v * 10 + (c - 48);
		} else {
			if (c == EOF) {
				ungetc(c, stdin);
				return v;
			}

			if (started == 0) {
				continue;
			} else {
				return v;
			}
		}
	}

	printf("Number string is too long.\n");
	exit(1);
}

int cmp_ints(const void * elem1, const void * elem2) {
	int f = *((int*)elem1);
	int s = *((int*)elem2);
	if (f > s) return  1;
	if (f < s) return -1;
	return 0;
}

int main() {
	IntArray * positions = new_array();

	while (!is_eof_next()) {
		array_push(positions, read_number());
	}

	int total = 0;
	int count = 0;

	for (int i = 0; i < positions->length; i++) {
		total += positions->items[i];
		count++;
	}

	qsort(positions->items, positions->length, sizeof(int), cmp_ints);
	int target_index = (int)round((float)(positions->length)/(float)2);
	int target = positions->items[target_index];
	int steps = 0;

	for (int i = 0; i < positions->length; i++) {
		steps += abs(positions->items[i] - target);
	}

	printf("total : %i\n", total);
	printf("count : %i\n", count);
	printf("target: %i\n", target);
	printf("steps :  %i\n", steps);

}
