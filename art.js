imethan = `      
	mm    mm                                 mmmmmm      mm                         mmmmmmmm            mm                           
	##    ##     ##                          ""##""      ##                         ##""""""    ##      ##                           
	##    ##                                   ##        ""     ####m##m            ##        #######   ##m####m   m#####m  ##m####m 
	########     ##                            ##               ## ## ##            #######     ##      ##"   ##   . mmm##  ##"   ## 
	##    ##     ##                            ##               ## ## ##            ##          ##      ##    ##  m##"""##  ##    ## 
	##    ##     ##.       ##                mm##mm             ## ## ##            ##mmmmmm    ##mmm   ##    ##  ##mmm###  ##    ## 
	""    ""     ""        ""                """"""             "" "" ""            """"""""     """"   ""    ""   """" ""  ""    "" 
`

// On website loads, make <p id="hi"></p> to display imethan one column every `duration` ms. It should scroll, like those banner logos
// Idea: IMETHAN PAGESTART|   --->            |PAGEND --> (wraps through) <(then goes back)
let displayWidth = Math.floor(window.innerWidth / 9);
let cachedLines = null;
let maxLen = 0;

function typewriterWordEffect(lines, elementId, wordIndex = 0) {
	const el = document.getElementById(elementId);
	if (!el) return;
	// Split each line into words, preserving spaces
	let splitLines = lines.map(line => line.match(/\S+|\s+/g) || []);
	// For each line, color the just-appeared word differently
	let displayLines = splitLines.map(words => {
		let finished = words.slice(0, wordIndex).join('');
		let current = words[wordIndex] || '';
		let rest = words.slice(wordIndex + 1).join('');
		// Color the just-appeared word
		let finishedColor = '#89b4fa'; // #cdd6f4
		let currentColor = '#4c4f69'; // #4c4f69
		let finishedSpan = `<span style="color:${finishedColor}">${finished}</span>`;
		let currentSpan = `<span style="color:${currentColor}">${current}</span>`;
		return finishedSpan + currentSpan + rest;
	});
	el.innerHTML = `<pre>${displayLines.join('\n')}</pre>`;
	// Find the next word to display
	let maxWords = Math.max(...splitLines.map(words => words.length));
	let delay = 120;
	let lastWords = splitLines.map(words => words[wordIndex] || '');
	if (wordIndex < maxWords - 1) {
		setTimeout(() => typewriterWordEffect(lines, elementId, wordIndex + 1), delay);
	} else {
		// On finish, set all to finished color
		let allFinished = splitLines.map(words => `<span style="color:${finishedColor}">${words.join('')}</span>`);
		setTimeout(() => {
			el.innerHTML = `<pre>${allFinished.join('\n')}</pre>`;
		}, 400);
	}
}

window.onresize = function() {
	displayWidth = Math.floor(window.innerWidth / 8);
	if (cachedLines) {
		let displayBlock = cachedLines.map(line => line.substring(0, displayWidth)).join('\n');
		document.getElementById("hi").innerHTML = `<pre>${displayBlock}</pre>`;
	}
};

window.onload = function() {
	document.getElementById("intro").innerHTML = ``;
	let lines = imethan.split('\n');
	maxLen = Math.max(...lines.map(line => line.length));
	cachedLines = lines.map(line => line.padEnd(maxLen, ' '));
	// Start typewriter effect for imethan logo
	typewriterWordEffect(cachedLines, "hi");
	// Optionally, keep typewriter effect for intro text
	typewriterEffect(text, "intro");
};
