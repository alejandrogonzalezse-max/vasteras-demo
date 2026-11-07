// Ordbilden "Västeråsarna" i egenritade pixelbokstäver (5×9 rutor per tecken).
// Rad 0–1: prickar och ring, rad 2–8: versal, rad 4–8: gemener.

const G: Record<string, string[]> = {
	V: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
	a: ['.....', '.....', '.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
	ä: ['.....', '.....', '.#.#.', '.....', '.###.', '....#', '.####', '#...#', '.####'],
	å: ['.....', '..#..', '.#.#.', '..#..', '.###.', '....#', '.####', '#...#', '.####'],
	s: ['.....', '.....', '.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
	t: ['.....', '.....', '.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.'],
	e: ['.....', '.....', '.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
	r: ['.....', '.....', '.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
	n: ['.....', '.....', '.....', '.....', '#.##.', '##..#', '#...#', '#...#', '#...#']
};

export const WORD = 'Västeråsarna';
/** Teckenbredd 5 + 2 rutors mellanrum, så att skuggan inte smetar ihop bokstäverna. */
const ADV = 7;
export const WORD_W = WORD.length * ADV - 2;
export const WORD_H = 9;

/** SVG-path för ordet, eventuellt förskjuten (för skuggan). */
export function wordPath(dx = 0, dy = 0) {
	let d = '';
	[...WORD].forEach((ch, i) => {
		const rows = G[ch];
		rows.forEach((row, y) => {
			let x = 0;
			while (x < row.length) {
				if (row[x] === '#') {
					let n = 1;
					while (row[x + n] === '#') n++;
					d += `M${i * ADV + x + dx} ${y + dy}h${n}v1h-${n}z`;
					x += n;
				} else x++;
			}
		});
	});
	return d;
}
