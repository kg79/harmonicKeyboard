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

document.getElementById('init').onclick = () => atx = new AudioContext();

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
