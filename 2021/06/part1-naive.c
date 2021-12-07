#include <stdio.h>
#include <stdlib.h>

#define ARRAY_INIT 128
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

int main() {
	IntArray * fish = new_array();

	while (!is_eof_next()) {
		array_push(fish, read_number());
	}

	printf("initial fish: ");
	print_array(fish);
	printf("\n");

	for (int d = 0; d < 80; d++) {
		int fish_to_add = 0;

		for (int i = 0; i < fish->length; i++) {
			if (fish->items[i] == 0) {
				fish_to_add++;
				fish->items[i] = 6;
			} else {
				fish->items[i]--;
			}
		}

		for (int i = 0; i < fish_to_add; i++) {
			array_push(fish, 8);
		}
	}

	printf("total fish: %i\n", fish->length);
}
