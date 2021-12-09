#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 200

typedef struct {
	int width;
	int height;
	int data[MAX_SIZE][MAX_SIZE];
} Matrix;

Matrix new_matrix() {
	Matrix m = {
		.width = 0,
		.height = 0
	};
	return m;
}

int max(int a, int b) {
	return a >= b ? a : b;
}

int min(int a, int b) {
	return a <= b ? a : b;
}

int to_int(char c) {
	if (c >= '0' && c <= '9') {
		return c - 48;
	} else {
		printf("Invalid character to to_int: %i\n", c);
		exit(1);
	}
}

int risk_at(Matrix * m, int x, int y) {
	// printf("assessing depth at %i, %i\n", x, y);

	int target_score = 4;

	if (x == 0 || x == m->width - 1) {
		target_score--;
	}

	if (y == 0 || y == m->height - 1) {
		target_score--;
	}

	int start_y = max(y - 1, 0);
	int end_y = min(y + 1, m->height - 1);

	int start_x = max(x - 1, 0);
	int end_x = min(x + 1, m->width - 1);

	int score = 0;

	for (int _y = start_y; _y <= end_y; _y++) {
		for (int _x = start_x; _x <= end_x; _x++) {
			if (_x == x || _y == y) {
				int neighbor = m->data[_y][_x];
				int self = m->data[y][x];
				// printf("%i, %i (%i) > %i, %i (%i) => ", _x, _y, neighbor, x, y, self);
				if (neighbor > self) {
					// printf("true\n");
					score++;
				} else {
					// printf("false\n");
				}
			}
		}
	}

	// printf("x: %i, y: %i, score: %i, target: %i\n", x, y, score, target_score);
	if (score == target_score) {
		return m->data[y][x] + 1;
	} else {
		return 0;
	}
}

Matrix risk_level(Matrix * m) {
	Matrix risk = new_matrix();
	risk.width = m->width;
	risk.height = m->height;

	for (int y = 0; y < m->height; y++) {
		for (int x = 0; x < m->width; x++) {
			risk.data[y][x] = risk_at(m, x, y);
		}
	}

	return risk;
}

int matrix_sum(Matrix * m) {
	int total = 0;
	for (int y = 0; y < m->height; y++) {
		for (int x = 0; x < m->width; x++) {
			total += m->data[y][x];
		}
	}
	return total;
}

Matrix read_lines() {
	Matrix m = new_matrix();

	char c;
	int x = 0;

	while ((c = getchar()) != EOF) {
		if (c == '\n') {
			m.height++;
			x = 0;
		} else {
			int v = to_int(c);
			m.width = max(m.width, x + 1);
			m.data[m.height][x] = v;
			x++;
		}
	}

	return m;
}

void print_matrix(Matrix * m) {
	for (int y = 0; y < m->height; y++) {
		printf("[");
		for (int x = 0; x < m->width; x++) {
			printf("%i", m->data[y][x]);
			if (x < m->width - 1) {
				printf(",");
			}
		}
		printf("]\n");
	}
}

int main() {
	Matrix m = read_lines();
	print_matrix(&m);

	Matrix risk = risk_level(&m);
	printf("risk levels\n");
	print_matrix(&risk);

	printf("total risk: %i\n", matrix_sum(&risk));
}
