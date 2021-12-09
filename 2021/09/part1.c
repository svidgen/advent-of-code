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

Matrix new_empty_matrix(int width, int height) {
	Matrix m = {
		.width = width,
		.height = height
	};
	for (int y = 0; y < height; y++) {
		for (int x = 0; x < width; x++) {
			m.data[y][x] = 0;
		}
	}
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
				if (neighbor > self) {
					score++;
				} else {
				}
			}
		}
	}

	if (score == target_score) {
		return m->data[y][x] + 1;
	} else {
		return 0;
	}
}

Matrix risk_level(Matrix * m) {
	Matrix risk = new_empty_matrix(m->width, m->height);

	for (int y = 0; y < m->height; y++) {
		for (int x = 0; x < m->width; x++) {
			risk.data[y][x] = risk_at(m, x, y);
		}
	}

	return risk;
}

int basin_score(Matrix * topography, Matrix * visits, int x, int y) {
	int start_y = max(y - 1, 0);
	int end_y = min(y + 1, topography->height - 1);

	int start_x = max(x - 1, 0);
	int end_x = min(x + 1, topography->width - 1);

	int score = 1; // the center of the basin is itself worth a point

	for (int _y = start_y; _y <= end_y; _y++) {
		for (int _x = start_x; _x <= end_x; _x++) {
			int neighbor = topography->data[_y][_x];
			int self = topography->data[y][x];
			if ((_x == x || _y == y) && neighbor != 9 && neighbor > self && visits->data[_y][_x] == 0) {
				visits->data[_y][_x] = 1;
				score += basin_score(topography, visits, _x, _y);
			}
		}
	}

	return score;
}

Matrix basin_scores(Matrix * topography, Matrix * risks) {
	Matrix scores = new_empty_matrix(risks->width, risks->height);
	Matrix visits = new_empty_matrix(risks->width, risks->height);

	for (int y = 0; y < scores.height; y++) {
		for (int x = 0; x < scores.width; x++) {
			if (risks->data[y][x] > 0) {
				scores.data[y][x] = basin_score(topography, &visits, x, y);
			}
		}
	}
	
	return scores;
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

int by_int_reverse(const void * a, const void * b) {
	int av = *(const int*)a;
	int bv = *(const int*)b;
	if (av < bv) return 1;
	if (av > bv) return -1;
	return 0;
}

int basin_threat(Matrix * m) {
	int findings[m->width * m->height];

	for (int y = 0; y < m->height; y++) {
		for (int x = 0; x < m->width; x++) {
			findings[y * m->width + x] = m->data[y][x];
		}
	}

	qsort(&findings, m->width * m->height, sizeof(int), by_int_reverse);

	return findings[0] * findings[1] * findings[2];
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

	Matrix scores = basin_scores(&m, &risk);
	printf("scores\n");
	print_matrix(&scores);

	printf("total risk: %i\n", matrix_sum(&risk));
	printf("basin threat: %i\n", basin_threat(&scores));
}
