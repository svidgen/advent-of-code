#include "../common/util.c"

#define SIZE 10

typedef int Grid[SIZE][SIZE];

Grid * digit_grid(array(String) * lines) {
	Grid * g = (Grid*)malloc(sizeof(Grid));
	for (int y = 0; y < SIZE; y++) {
		String line = lines->items[y];
		for (int x = 0; x < SIZE; x++) {
			(*g)[y][x] = (int)line.items[x] - 48;
		}
	}
	return g;
}

void print_grid(Grid * g) {
	for (int y = 0; y < SIZE; y++) {
		for (int x = 0; x < SIZE; x++) {
			printf("%i", (*g)[y][x]);
		}
		printf("\n");
	}
}

int check_flash(Grid * state, int x, int y) {
	if ((*state)[y][x] > 9) {
		(*state)[y][x] = 0;

		int start_x = max(0, x - 1);
		int end_x = min(SIZE - 1, x + 1);
		int start_y = max(0, y - 1);
		int end_y = min(SIZE - 1, y + 1);

		for (int y = start_y; y <= end_y; y++) {
			for (int x = start_x; x <= end_x; x++) {
				// only affects related cells that have not already flashed.
				// this automatically skips over "self", because "self" == 0
				if ((*state)[y][x] > 0) {
					(*state)[y][x] = (*state)[y][x] + 1;
				}
			}
		}
		return 1;
	} else {
		return 0;
	}
}

int grid_step(Grid * state) {
	// Grid * next = (Grid*)malloc(sizeof(Grid));

	// rule 1: every cell is incremented by 1
	for (int y = 0; y < SIZE; y++) {
		for (int x = 0; x < SIZE; x++) {
			(*state)[y][x] = (*state)[y][x] + 1;
		}
	}

	// rule 2: every cell over 9 flashes and resets to 0.
	// rule 3: cells next to flashes are incremented by 1, as long as they
	// did not already flash during this step.
	int total_flashes = 0;
	int substep_diff = 1;
	while (substep_diff > 0) {
		substep_diff = 0;
		for (int y = 0; y < SIZE; y++) {
			for (int x = 0; x < SIZE; x++) {
				substep_diff += check_flash(state, x, y);
			}
		}
		total_flashes += substep_diff;
	}
	
	return total_flashes;
}

void part1(Grid * g) {
	int flashes = 0;
	for (int step = 0; step < 100; step++) {
		flashes += grid_step(g);
		printf("\nstep %i:\n", step + 1);
		print_grid(g);
	}

	printf("\nfinal grid:\n");
	print_grid(g);
	printf("total flashes: %i\n", flashes);
}

void part2(Grid * g) {
	int flashes = 0;
	int step = 0;
	while (flashes != SIZE * SIZE) {
		step++;
		flashes = grid_step(g);
		printf("\nstep %i:\n", step);
		print_grid(g);
	}
}

int main() {
	array(String) * lines = split(read_all(), '\n');
	Grid * g = digit_grid(lines);
	print_grid(g);
	part2(g);
}
