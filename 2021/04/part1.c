#include <stdio.h>
#include <stdlib.h>

#define ARRAY_INIT 128 
#define ARRAY_INC 2

union ArrayMember {
	int intval;
	void *pointer;
};

struct Array {
	size_t length;
	size_t max;
	union ArrayMember *items;
};

struct Array * new_array() {
	struct Array *a = malloc(sizeof(struct Array));
	a->length = 0;
	a->max = ARRAY_INIT;
	a->items = malloc(sizeof(union ArrayMember) * ARRAY_INIT);
	return a;
}

int array_push(struct Array *a, union ArrayMember value) {
	int resize = 0;

	if (a->length == a->max) {
		resize = a->max * ARRAY_INC;
		a->items = realloc(a->items, sizeof(union ArrayMember) * resize);
		a->max = resize;
	}

	a->items[a->length] = value;
	a->length++;
	return a->length;
}

void array_free(struct Array *a) {
	free(a->items);
	free(a);
}

void print_array(struct Array *a, void (*print_item)(union ArrayMember)) {
	printf("[");
	for (int i = 0; i < a->length; i++) {
		// printf("%i", a->items[i]);
		print_item(a->items[i]);
		if (i < a->length - 1) {
			printf(", ");
		}
	}
	printf("]\n");
}

void int_member(union ArrayMember m) {
	printf("%i", m.intval);
}

struct Array * read_picks() {
	struct Array * picks = new_array();
	char c;
	union ArrayMember v = { .intval = 0 };

	while ((c = getchar()) != '\n') {
		if (c == ',') {
			array_push(picks, v);
			v.intval = 0;
			continue;
		}

		if (c >= '0' && c <= '9') {
			v.intval *= 10;
			v.intval += (c - 48);
		}
	}

	array_push(picks, v);

	return picks;
}

int read_number() {
	return 1;
}

int * read_grid() {
	int *grid = malloc(sizeof(int[5][5]));

	for (int row = 0; row < 5; row++) {
		for (int col = 0; col < 5; col++) {
			grid[row][col] = read_number();
		}
	}

	return grid;
}

struct Array * read_grids() {
	struct Array * grids = new_array();
	char c;

	for (int i = 0; i < 5; i++) {
		union ArrayMember grid = { .pointer = read_grid() };
		array_push(grids, read_grid);
	}

	return grids;
}

void print_grid(int grid[5][5]) {
	for (int y = 0; y < 5; y++) {
		for (int x = 0; x < 5; x++) {
			printf("%5i", grid[x][y]);
		}
		printf("\n");
	}
}

void print_grids(struct Array *a) {
	for (int i = 0; i < a->length; i++) {
		print_grid(a->items[i].pointer);
		printf("\n");
	}
}

int main() {
	struct Array *picks = read_picks();
	print_array(picks, int_member);

	struct Array *grids = read_grids();
}
