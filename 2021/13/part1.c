#include "../common/util.c"

#define VERTICAL 1
#define HORIZONTAL 2

typedef struct {
	int x;
	int y;
} Coord;

typedef struct {
	int orientation;
	int depth;
} Fold;

define_array(Coord);
define_array(Fold);

typedef struct {
	array(Coord) * coords;
	array(Fold) * folds;
} Sheet;

define_dict(int)

int parse_int(String * s) {
	int v = 0;
	for (int i = 0; i < s->length; i++) {
		v *= 10;
		v += s->items[i] - 48;
	}
	return v;
}

Coord parse_coord(String * line) {
	array(String) * parts = split(line, ',');
	Coord coord = {
		.x = parse_int(&parts->items[0]),
		.y = parse_int(&parts->items[1])
	};
	parts->free(parts);
	return coord;
}

Fold parse_fold(String * line) {
	int starting_index = strlen("fold along ");
	String * directive = substring(line, starting_index, -1);
	array(String) * parts = split(directive, '=');

	Fold fold = {
		.orientation = parts->items[0].items[0] == 'x' ? VERTICAL : HORIZONTAL,
		.depth = parse_int(&parts->items[1])
	};

	directive->free(directive);
	parts->free(parts);

	return fold;
}

Sheet * parse(array(String) * lines) {
	Sheet * input = malloc(sizeof(Sheet));
	input->coords = new_array(Coord);
	input->folds = new_array(Fold);

	String * fold_prefix = new_string("fold along ");

	for (int i = 0; i < lines->length; i++) {
		if (string_starts_with(fold_prefix, &lines->items[i])) {
			input->folds->push(input->folds, parse_fold(&lines->items[i]));
		} else if (lines->items[i].length > 0) {
			input->coords->push(input->coords, parse_coord(&lines->items[i]));
		}
	}

	fold_prefix->free(fold_prefix);
	return input;
}

Sheet * fold(Sheet * sheet) {
	if (sheet->folds->length == 0) {
		return sheet;
	}

	Sheet * folded = malloc(sizeof(Sheet));
	folded->coords = new_array(Coord);
	folded->folds = new_array(Fold);

	Fold fold = sheet->folds->items[0];
	dict(int) * overlaps = new_dict(int);

	char key[50];
	for (int i = 0; i < sheet->coords->length; i++) {
		Coord c = {
			.x = sheet->coords->items[i].x,
			.y = sheet->coords->items[i].y
		};

		printf("fold %i,%i ... ", c.x, c.y);

		if (fold.orientation == VERTICAL) {
			if (c.x == fold.depth) continue;
			c.x = c.x > fold.depth ? fold.depth - (c.x - fold.depth) : c.x;
		} else {
			if (c.y == fold.depth) continue;
			c.y = c.y > fold.depth ? fold.depth - (c.y - fold.depth) : c.y;
		}

		printf("into %i,%i", c.x, c.y);

		sprintf(key, "%i,%i", c.x, c.y);

		if (overlaps->has(overlaps, key)) {
			printf(" (dupe!)\n");
			continue;
		}

		printf("\n");

		overlaps->set(overlaps, key, 1);
		folded->coords->push(folded->coords, c);
	}

	for (int i = 1; i < sheet->folds->length; i++) {
		folded->folds->push(folded->folds, sheet->folds->items[i]);
	}

	overlaps->free(overlaps);
	return folded;
}

int main() {
	array(String) * lines = split(read_all(), '\n');
	Sheet * input = parse(lines);
	Sheet * first_fold = fold(input);
	// Sheet * second_fold = fold(first_fold);

	/*
	for (int i = 0; i < input->coords->length; i++) {
		printf("%i,%i\n", input->coords->items[i].x, input->coords->items[i].y);
	}
	*/
	printf("coords: %i\n\n", input->coords->length);

	for (int i = 0; i < input->folds->length; i++) {
		printf("%i=%i\n", input->folds->items[i].orientation, input->folds->items[i].depth);
	}
	printf("folds: %i\n\n", input->folds->length);
	printf("\n");

	for (int i = 0; i < first_fold->coords->length; i++) {
		printf("%i,%i\n", first_fold->coords->items[i].x, first_fold->coords->items[i].y);
	}
	printf("coords: %i\n", first_fold->coords->length);

	/*
	for (int i = 0; i < second_fold->coords->length; i++) {
		printf("%i,%i\n", second_fold->coords->items[i].x, second_fold->coords->items[i].y);
	}
	printf("coords: %i\n", second_fold->coords->length);
	*/
}
