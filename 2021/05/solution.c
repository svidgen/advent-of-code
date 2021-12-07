#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define ARRAY_INIT 128
#define ARRAY_INC 2
#define GRID_SIZE 1000

typedef struct {
	int x;
	int y;
} Coord;

typedef struct {
	Coord a;
	Coord b;
} Line;

struct Array {
	size_t length;
	size_t max;
	void **items;
};

typedef int Grid[GRID_SIZE][GRID_SIZE];

int * new_grid() {
	int *g = malloc(sizeof(Grid));
	for (int i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
		g[i] = 0;
	}
	return g;
}

struct Array * new_array() {
	struct Array *a = malloc(sizeof(struct Array));
	a->length = 0;
	a->max = ARRAY_INIT;
	a->items = malloc(sizeof(void*) * ARRAY_INIT);
	return a;
}

int array_push(struct Array *a, void *value) {
	int resize = 0;

	if (a->length == a->max) {
		resize = a->max * ARRAY_INC;
		a->items = realloc(a->items, sizeof(void*) * resize);
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

void print_array(struct Array *a, void (*print_item)(void *)) {
	printf("[");
	for (int i = 0; i < a->length; i++) {
		print_item(a->items[i]);
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

Coord read_coord() {
	Coord c = {
		.x = read_number(),
		.y = read_number()
	};
	return c;
}

Line * read_line() {
	Line * line = malloc(sizeof(Line));
	line->a = read_coord();
	line->b = read_coord();
	return line;
}

struct Array * read_lines() {
	struct Array * lines = new_array();

	while (!is_eof_next()) {
		array_push(lines, read_line());
	}

	return lines;
}

void print_lines(struct Array * lines) {
	for (int i = 0; i < lines->length; i++) {
		Line * line = lines->items[i];
		printf("(%i,%i) .. (%i,%i)\n",
			line->a.x, line->a.y,
			line->b.x, line->b.y
		);
	}
}

int is_vertical(Line * line) {
	return line->a.x == line->b.x;
}

int is_horizontal(Line * line) {
	return line->a.y == line->b.y;
}

int min(int a, int b) {
	if (a <= b) {
		return a;
	} else {
		return b;
	}
}

int max(int a, int b) {
	if (a >= b) {
		return a;
	} else {
		return b;
	}
}

int is_hv(Line * line) {
	return is_vertical(line) || is_horizontal;
}

void paint_line(Grid * grid, Line * l) {
	if (is_vertical(l)) {
		for (int y = min(l->a.y, l->b.y); y <= max(l->a.y, l->b.y); y++) {
			(*grid)[l->a.x][y] += 1;
		}
	} else if (is_horizontal(l)) {
		for (int x = min(l->a.x, l->b.x); x <= max(l->a.x, l->b.x); x++) {
			(*grid)[x][l->a.y] += 1;
		}
	} else {
		// assume 45 degrees for part 2
		int x_step = l->b.x > l->a.x ? 1 : -1;
		int y_step = l->b.y > l->a.y ? 1 : -1;

		int x = l->a.x;
		int y = l->a.y;
		int steps = max(l->a.x, l->b.x) - min(l->a.x, l->b.x);

		while(steps >= 0) {
			(*grid)[x][y] += 1;
			x += x_step;
			y += y_step;
			steps--;
		}
	}
}

void paint_lines(Grid * grid, struct Array * lines, int hv_only) {
	for (int i = 0; i < lines->length; i++) {
		Line * line = lines->items[i];
		if (!hv_only || is_hv(line)) {
			paint_line(grid, line);
		}
	}
}

int count_intersects(Grid * grid) {
	int count = 0;
	for (int x = 0; x < GRID_SIZE; x++) {
		for (int y = 0; y < GRID_SIZE; y++) {
			if ((*grid)[x][y] > 1) count++;
		}
	}
	return count;
}

void print_grid(Grid * grid) {
	for (int y = 0; y < GRID_SIZE; y++) {
		for (int x = 0; x < GRID_SIZE; x++) {
			printf("%2i", (*grid)[x][y]);
		}
		printf("\n");
	}
}

int main() {
	int hv_only = 0;
	struct Array * lines = read_lines();
	Grid * grid = (Grid*)new_grid();

	print_lines(lines);
	paint_lines(grid, lines, hv_only);

	if (GRID_SIZE <= 20) {
		print_grid(grid);
	}

	printf("intersections: %i", count_intersects(grid));
}
