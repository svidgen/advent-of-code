#include <stdio.h>
#include <stdlib.h>

#define ARRAY_INIT 128 
#define ARRAY_INC 2

struct Victory {
	int winning_turn;
	int hits[5][5];
};

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
	int started = 0;
	int v = 0;
	char c;
	for (int i = 0; i < 20; i++) {
		c = getchar();

		if (c == ' ' || c == '\n') {
			if(started == 0) {
			   	continue;
			} else {
				ungetc(c, stdin);
				return v;
			}
		}

		started = 1;
		v = v * 10 + (c - 48);
	}

	printf("Number string is too long.\n");
	exit(1);
}

int * read_grid() {
	char c;
	int *grid = malloc(sizeof(int[5][5]));

	for (int row = 0; row < 5; row++) {
		for (int col = 0; col < 5; col++) {
			grid[row * 5 + col] = read_number();
		}

		// consume EOL
		c = getchar();
		if (c != '\n') {
			printf("Bad input. Expected newline.\n");
			exit(1);
		}	
	}

	return grid;
}

struct Array * read_grids() {
	struct Array * grids = new_array();
	char c;

	while ((c = getchar()) != EOF) {
		union ArrayMember grid = { .pointer = read_grid() };
		array_push(grids, grid);
	}

	return grids;
}

int is_winning(int hits[5][5]) {
	int rows[5] = { 0, 0, 0, 0 };
	int cols[5] = { 0, 0, 0, 0 };

	for (int row = 0; row < 5; row++) {
		for (int col = 0; col < 5; col++) {
			if (hits[row][col]) {
				rows[row] += 1;
				cols[col] += 1;

				if (rows[row] == 5 || cols[col] == 5) {
					return 1;
				}
			}
		}
	}

	return 0;
}

struct Victory * victory(int grid[5][5], struct Array *picks) {
	struct Victory * v = malloc(sizeof(struct Victory));
	v->winning_turn = -1;

	for (int row = 0; row < 5; row++) {
		for (int col = 0; col < 5; col++) {
			v->hits[row][col] = 0;
		}
	}

	for (int turn = 0; turn < picks->length; turn++) {
		for (int row = 0; row < 5; row++) {
			for (int col = 0; col < 5; col++) {
				if (grid[row][col] == picks->items[turn].intval) {
					v->hits[row][col] = 1;
				}
			}
		}

		if (is_winning(v->hits)) {
			v->winning_turn = turn;
			return v;
		}
	}

	return v;
}

void print_grid(int grid[5][5]) {
	for (int y = 0; y < 5; y++) {
		for (int x = 0; x < 5; x++) {
			printf("%5i", grid[y][x]);
		}
		printf("\n");
	}
}

void print_grids(struct Array *grids, struct Array *picks) {
	for (int i = 0; i < grids->length; i++) {
		print_grid(grids->items[i].pointer);
		printf("\n");
	}
}

void print_wins(struct Array *wins, struct Array *picks) {
	for (int i = 0; i < wins->length; i++) {
		struct Victory * v = wins->items[i].pointer;
		print_grid(v->hits);
		printf("\n     Wins on %i with %i\n\n\n",
			v->winning_turn,
			picks->items[v->winning_turn].intval
		);
	}
}

struct Array * winners(struct Array *grids, struct Array *picks) {
	struct Array *wins = new_array();

	for (int i = 0; i < grids->length; i++) {
		struct Victory * v = victory(grids->items[i].pointer, picks);
		union ArrayMember item = { .pointer = v };
		array_push(wins, item);
	}

	return wins;
}

int unpicked_total(int grid[5][5], int hits[5][5]) {
	int total = 0;
	for (int row = 0; row < 5; row++) {
		for (int col = 0; col < 5; col++) {
			if (hits[row][col] == 0) {
				total += grid[row][col];
			}
		}
	}
	return total;
}

int first_winner(struct Array *wins) {
	int lowest = -1;
	int index = -1;
	for (int i = 0; i < wins->length; i++) {
		struct Victory *v = wins->items[i].pointer;
		if (lowest == -1 || v->winning_turn < lowest) {
			lowest = v->winning_turn;
			index = i;
		}
	}
	return index;
}

int last_winner(struct Array *wins) {
	int highest = -1;
	int index = -1;
	for (int i = 0; i < wins->length; i++) {
		struct Victory *v = wins->items[i].pointer;
		if (highest == -1 || v->winning_turn > highest) {
			highest = v->winning_turn;
			index = i;
		}
	}
	return index;
}

int main() {
	struct Array *picks = read_picks();
	struct Array *grids = read_grids();
	struct Array *wins = winners(grids, picks);

	int l_winner_index = first_winner(wins);
	struct Victory *l_winning_victory = wins->items[l_winner_index].pointer;
	int l_winning_roll = picks->items[l_winning_victory->winning_turn].intval;

	int l_total = unpicked_total(
		grids->items[l_winner_index].pointer,
		l_winning_victory->hits
	);

	int h_winner_index = last_winner(wins);
	struct Victory *h_winning_victory = wins->items[h_winner_index].pointer;
	int h_winning_roll = picks->items[h_winning_victory->winning_turn].intval;

	int h_total = unpicked_total(
		grids->items[h_winner_index].pointer,
		h_winning_victory->hits
	);

	print_array(picks, int_member);
	printf("\n");
	print_grids(grids, picks);
	printf("\n");
	print_wins(wins, picks);
	printf("\n");

	printf("l winner: %i\n", l_winner_index);
	printf("l total: %i\n", l_total);
	printf("l winning roll: %i\n", l_winning_roll);
	printf("l score: %i\n", l_total * l_winning_roll);

	printf("\n");

	printf("h winner: %i\n", h_winner_index);
	printf("h total: %i\n", h_total);
	printf("h winning roll: %i\n", h_winning_roll);
	printf("h score: %i\n", h_total * h_winning_roll);
}
