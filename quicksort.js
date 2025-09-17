function quicksortVisual() {
  const canvas = document.getElementById('quicksort');
  const width = 20;
  const height = 20;  
  const startOffset = 5;

  // Create array from 1 to height, then shuffle it
  let arr = Array.from({ length: width }, (_, i) => i + 1);
  arr = arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  // State tracking
  let states = Array(width).fill('unsorted'); // 'unsorted', 'active', 'sorted'

  // Color mapping
  const colors = {
    unsorted: '#4c4f69',
    active: '#7287fd',
    sorted: '#7c7f93'
  };

  // Draw the current state
  function draw() {
    let lines = [];
    for (let y = height; y > 0; y--) {
      let line = '';
      for (let x = 0; x < width; x++) {
        let color = colors[states[x]];
		if (x == 0) {
			line += "	".repeat(startOffset) + `<span style="color:${color}">${arr[x] >= y ? '#' : ' '}</span>`;
		} else {
			line += `<span style="color:${color}">${arr[x] >= y ? '#' : ' '}</span>`;
		}
        
      }
      lines.push(line);
    }
    canvas.innerHTML = lines.join('<br>');
  }

  // Quicksort with visualization
  async function quicksort(start, end) {
    if (start >= end) {
      if (start < width) states[start] = 'sorted';
      draw();
      await sleep(50);
      return;
    }
    let idx = await partition(start, end);
    states[idx] = 'sorted';
    draw();
    await sleep(50);
    await Promise.all([
      quicksort(start, idx - 1),
      quicksort(idx + 1, end)
    ]);
  }

  async function partition(start, end) {
    for (let i = start; i <= end; i++) states[i] = 'unsorted';
    let pivotValue = arr[end];
    let pivotIndex = start;
    states[end] = 'active';
    draw();
    await sleep(100);

    for (let i = start; i < end; i++) {
      states[i] = 'active';
      draw();
      await sleep(50);
      if (arr[i] < pivotValue) {
        [arr[i], arr[pivotIndex]] = [arr[pivotIndex], arr[i]];
        states[pivotIndex] = 'active';
        draw();
        await sleep(50);
        states[pivotIndex] = 'unsorted';
        pivotIndex++;
      }
      states[i] = 'unsorted';
    }
    [arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]];
    draw();
    await sleep(100);
    for (let i = start; i <= end; i++) if (i !== pivotIndex) states[i] = 'unsorted';
    return pivotIndex;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function startSort() {
    // Shuffle array
    arr = Array.from({ length: width }, (_, i) => i + 1)
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    states = Array(width).fill('unsorted');
    draw();
    await quicksort(0, width - 1);
    // Wait 1 second, then restart
    await sleep(3000);
    startSort();
  }

  startSort();
}

quicksortVisual();