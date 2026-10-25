// beginning of interface tiles UI

const interfaceRows = document.querySelectorAll('.interfaceRows');

const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ':'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', '?']
];

interfaceRows.forEach((row, rowIndex) => {
    for (let i = 0; i < 10; i++) {
        const tile = document.createElement('article');
        tile.className = 'tiles';

        const elements = ['keyCode', 'fraction', 'decimal', 'frequency'];

        elements.forEach(name => {
            const element = document.createElement(
                name === 'keyCode' ? 'kbd' : 'span'
            );

            element.className = name;

            if (name === 'keyCode') {
                element.textContent = keyboardRows[rowIndex][i].toUpperCase();
            }

            tile.appendChild(element);
        });

        row.appendChild(tile);
    }
});

function renderKeyboard() {
    const tiles = document.querySelectorAll('.tiles');

    tiles.forEach((tile, index) => {
        const note = scale[index];

        const fraction = tile.querySelector('.fraction');
        const decimal = tile.querySelector('.decimal');
        const frequency = tile.querySelector('.frequency');

        if (!note) {
            fraction.textContent = '';
            decimal.textContent = '';
            frequency.textContent = '';
            return;
        }

        fraction.textContent = note.fraction;
        decimal.textContent = parseFloat(note.decimal.toFixed(5));
        frequency.textContent = parseFloat(
            (note.decimal * Number(rootFrequency.value)).toFixed(2)
        );
    });
}
const populateTilesButton = document.getElementById('populateTiles');
populateTilesButton.addEventListener('click', renderKeyboard);

const activeNotes = new Map();

function playNote(key) {
    if (!atx || activeNotes.has(key)) return;

    const tiles = document.querySelectorAll('.tiles');
    const index = keyboardRows.flat().indexOf(key);
    const note = scale[index];

    if (!note) return;

    const oscillator = atx.createOscillator();
    const gain = atx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value =
        note.decimal * Number(rootFrequency.value);

    gain.gain.value = Number(volume.value);

    oscillator.connect(gain).connect(atx.destination);
    oscillator.start();

    activeNotes.set(key, { oscillator, gain });

    tiles[index].classList.add('active');
}

function stopNote(key) {
    const active = activeNotes.get(key);

    if (!active) return;

    active.oscillator.stop();
    activeNotes.delete(key);

    const index = keyboardRows.flat().indexOf(key);
    const tiles = document.querySelectorAll('.tiles');

    if (index !== -1) {
        tiles[index].classList.remove('active');
    }
}

document.addEventListener('keydown', e => {
    if (e.repeat) return;

    const key = e.key.toLowerCase();

    if (e.target.matches('input, textarea, select')) return;

    playNote(key);
});

document.addEventListener('keyup', e => {
    stopNote(e.key.toLowerCase());
});

window.addEventListener('blur', () => {
    for (const key of activeNotes.keys()) {
        stopNote(key);
    }
});

// end of interface Tiles UI, beginning of Generative Controls

let degree = document.getElementById('degree');

document.getElementById('generateHarmonics').onclick = () => {
    let numerator = 1, denominator = 1, ray = [];
    
    for (let i = 0; i < Number(degree.value); i++) {
	numerator = 1;
      while (numerator < denominator) {
	  ray.push({
	      numerator: numerator,
	      denominator: denominator,
	      fraction: `${numerator}/${denominator}`,
	      decimal: numerator / denominator
	  });
	  numerator++;
      }
      denominator++;    

     }
    ray.sort((a, b) => a.decimal - b.decimal);


    function removeDuplicates() {
	for (let i = 1; i < ray.length; i++) {
            if (ray[i].decimal === ray[i - 1].decimal) {
		ray.splice(i, 1);
		i--;
            }
	}

	return ray;
    }
    removeDuplicates();
    
    function renderHarmonics() {
	const container = document.getElementById('generatedHarmonics');

	container.replaceChildren();

	ray.forEach(harmonic => {
            const article = document.createElement('article');
            article.className = 'harmonic';

            const fraction = document.createElement('span');
            fraction.textContent = harmonic.fraction;

            const decimal = document.createElement('span');
            decimal.textContent = parseFloat(harmonic.decimal.toFixed(5));
	    
            const frequency = document.createElement('span');
	    frequency.textContent = parseFloat(
		(harmonic.decimal * Number(rootFrequency.value)).toFixed(2)
	    );
	    
            article.append(fraction, decimal, frequency);
            container.appendChild(article);
	});
    }
    renderHarmonics();

};

const rootFrequency = document.getElementById("rootFrequency");

let atx;

document.getElementById('init').onclick = async () => {
    atx ??= new AudioContext();
    await atx.resume();
};


let stairOsc, stairVol;
const generatedHarmonics = document.getElementById('generatedHarmonics');

generatedHarmonics.addEventListener('mouseover', e => {
    if (!e.target.matches('article > span:first-child')) return;

    const [num, den] = e.target.textContent.split('/');

    stairOsc?.stop();

    stairOsc = atx.createOscillator();
    stairVol = atx.createGain();

    stairOsc.frequency.value = (num / den) * Number(rootFrequency.value);
    stairVol.gain.value = 0.1;

    stairOsc.connect(stairVol).connect(atx.destination);
    stairOsc.start();
});

generatedHarmonics.addEventListener('mouseout', e => {
    if (!e.target.matches('article > span:first-child')) return;

    stairOsc?.stop();
    stairOsc = null;
});

// end of generative, beginning of organizational components

const scale = [];
const scaleContainer = document.getElementById('scale');

generatedHarmonics.addEventListener('click', e => {
    if (!e.target.matches('article > span:first-child')) return;

    const fraction = e.target.textContent;
    const [num, den] = fraction.split('/').map(Number);
    const decimal = num / den;
    
    if (scale.some(note => note.decimal === decimal)) return;
    
    scale.push({
        fraction: fraction,
        decimal: num / den
    });
    
    scale.sort((a, b) => a.decimal - b.decimal);

    function renderScale() {
	const tbody = document.querySelector('#scale tbody');

	tbody.replaceChildren();

	scale.forEach(note => {
            const frequency = note.decimal * Number(rootFrequency.value);

            const row = document.createElement('tr');

            [
		note.fraction,
		parseFloat(note.decimal.toFixed(5)),
		parseFloat(frequency.toFixed(2))
            ].forEach(value => {
		const cell = document.createElement('td');
		cell.textContent = value;
		row.appendChild(cell);
            });

            tbody.appendChild(row);
	});
    }

    renderScale();
});


// end of organizational, beginning of analytical components


function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }

    return a;
}

function calculateInterval(from, to) {
    const [a, b] = from.split('/').map(Number);
    const [c, d] = to.split('/').map(Number);

    let numerator = c * b;
    let denominator = d * a;

    const divisor = gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;

    return `${numerator}/${denominator}`;
}

function renderIntervalMatrix() {
    const table = document.getElementById('intervalMatrix');

    table.replaceChildren();

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const corner = document.createElement('th');
    //corner.textContent = '↓ / →';
    headerRow.appendChild(corner);

    scale.forEach(note => {
        const th = document.createElement('th');
        th.textContent = note.fraction;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    scale.forEach(from => {
        const row = document.createElement('tr');

        const heading = document.createElement('th');
        heading.textContent = from.fraction;
        row.appendChild(heading);

        scale.forEach(to => {
            const cell = document.createElement('td');

            cell.textContent = calculateInterval(
                from.fraction,
                to.fraction
            );

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
}

const matrixButton = document.getElementById('matrixButton');
matrixButton.addEventListener('click', renderIntervalMatrix);
