#include "../common/util.c"

/*
typedef struct Path {
	String left;
	String right;
} Path;
*/

typedef array(String) Path;

define_dict(String)
define_dict(int)
define_map(String)
define_array(Path)


void print_strings(array(String) * strings) {
	printf("length: %i\n", strings->length);
	for (int i = 0; i < strings->length; i++) {
		printf("s[%i] = %s\n", i, strings->items[i].items);
	}
}

map(String) * read_map() {
	array(String) * raw_lines = split(read_all(), '\n');
	array(String) * lines = remove_empty(raw_lines);
	map(String) * m = new_map(String);

	for (int i = 0; i < lines->length; i++) {
		String line = lines->items[i];
		printf("parsing line: %s\n", line.items);

		array(String) * parts = split(&line, '-');

		String a = parts->items[0];
		String b = parts->items[1];
		m->set(m, a.items, b);
		m->set(m, b.items, a);

		parts->free(parts);
	}

	lines->free(lines);
	raw_lines->free(raw_lines);

	return m;
}

/*
dict(int) * visited_rooms(Path * path) {
	dict(int) * visited = new_dict(int);
	for (int i = 0; i < path->length; i++) {
		if (is_small_room(path->items[i])) {
			visited->set(visited, path->items[i].items, 1);
		}
	}
	return visited;
}
*/

array(String) * copy_path(array(String) * path) {
	array(String) * new_path = new_array(String);
	for (int i = 0; i < path->length; i++) {
		new_path->push(new_path, path->items[i]);
	}
	return new_path;
}

int is_small_room(String * room) {
	// AFAIK. we actually only need to test the first character ... 
	for (int i = 0; i < room->length; i++) {
		if (room->items[i] >= 'a' && room->items[i] <= 'z') {
			return 1;
		} else {
			return 0;
		}
	}
	return 0;
}

int String_eq(String * a, String * b) {
	if (a->length != b->length) return 0;
	for (int i = 0; i < a->length; i++) {
		if (a->items[i] != b->items[i]) {
			return 0;
		}
	}
	return 1;
}

array(Path) * find_paths(map(String) * m, dict(int) * visited, String * start, String * end) {
	array(Path) * paths = new_array(Path);

	if (visited->has(visited, start->items) && visited->get(visited, start->items) == 1) {
		return paths;
	}

	if (is_small_room(start)) {
		visited->set(visited, start->items, 1);
	}

	if (String_eq(start, end)) {
		Path * p = new_array(String);
		p->push(p, *end);
		paths->push(paths, *p);
	} else {
		array(String) * children = m->get(m, start->items);

		for (int i = 0; i < children->length; i++) {
			array(Path) * child_paths = find_paths(m, visited, &(children->items[i]), end);
			for (int j = 0; j < child_paths->length; j++) {
				Path c = child_paths->items[j];
				Path * p = new_array(String);
				p->push(p, *start);
				for (int k = 0; k < c.length; k++) {
					p->push(p, c.items[k]);
				}
				paths->push(paths, *p);
			}
		}
	}

	if (is_small_room(start)) {
		visited->set(visited, start->items, 0);
	}

	return paths;
}

void print_path(Path * path) {
	for (int i = 0; i < path->length; i++) {
		printf("%s", path->items[i].items);
		if (i < path->length - 1) {
			printf(", ");
		}
	}
	printf("\n");
}

int main() {
	map(String) * m = read_map();
	printf("made it this far ... \n");

	// printf("dict start -> ");
	// print_strings(m->get(m, "start"));

	dict(int) * visited = new_dict(int);
	array(Path) * paths = find_paths(m, visited, new_string("start"), new_string("end"));

	printf("\n__ paths (%i) __\n\n", paths->length);
	for (int i = 0; i < paths->length; i++) {
		print_path(&paths->items[i]);
	}
	printf("\n%i paths found.\n\n", paths->length);
}
