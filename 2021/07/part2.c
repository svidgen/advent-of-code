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

int steps_cost(int steps) {
	int cost = 0;
	for (int i = 1; i <= steps; i++) {
		cost += i;
	}
	return cost;
}

int min(int a, int b) {
	return a <= b ? a : b;
}

int max(int a, int b) {
	return a >= b ? a : b;
}

int array_min(IntArray * positions) {
	int m = positions->items[0];
	for (int i = 1; i < positions->length; i++) {
		m = min(m, positions->items[i]);
	}
	return m;
}

int array_max(IntArray * positions) {
	int m = positions->items[0];
	for (int i = 1; i < positions->length; i++) {
		m = max(m, positions->items[i]);
	}
	return m;
}

int total_cost(IntArray * positions, int target) {
	int total = 0;
	for (int i = 0; i < positions->length; i++) {
		total += steps_cost(abs(positions->items[i] - target));
	}
	return total;
}

int main() {
	IntArray * positions = new_array();

	while (!is_eof_next()) {
		array_push(positions, read_number());
	}

	int fuel = 0;
	int target = 0;

	int MIN = array_min(positions);
	int MAX = array_max(positions);

	for (int i  = MIN; i < MAX; i++) {
		target = positions->items[i];
		int potential_cost = total_cost(positions, i);
		fuel = i == 0 ? potential_cost : min(fuel, potential_cost);
	}

	printf("FINAL\n");
	printf("target: %i\n", target);
	printf("fuel  :  %i\n", fuel);
}
