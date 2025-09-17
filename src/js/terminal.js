let history = [];
let outputHistory = [];
let currentInput = '';
let time_updated = false;
let lastLoginString = '';
let currentLoginString = '';

introText = `
Hi! Welcome to my terminal emulator. This is an emulation of my Mac's terminal.<br>
Some, but not all commands are supported. The folders contain information on my projects.
`;

function processPrompt() {
  // Remove the block cursor before processing
  let processedInput = currentInput;
  history.push(processedInput);
  outputHistory.push(processCommand(processedInput));
  currentInput = '';
  updateTerminal();
}

function processCommand(cmd) {
  // Basic command processor
  switch(cmd.trim()) {
    case 'clear':
      history = [];
      outputHistory = [];
      return '';
    default:
      if(cmd.startsWith('echo ')) {
        return cmd.slice(5);
      }
      return `Command not found: ${cmd}`;
  }
}

function getPromptHTML() {
  return `projects@ethans-mac-emulator ~ %`;
}

function renderFakeInput() {
  return currentInput + `<div>█</div>`;
}


function getLoginString(dateObj) {
  // Format: 'Last login: Tue Sep 17 13:37:42 on ttys000'
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[dateObj.getDay()];
  const month = months[dateObj.getMonth()];
  const date = dateObj.getDate();
  const year = dateObj.getFullYear();
  const pad = n => n.toString().padStart(2, '0');
  const hour = pad(dateObj.getHours());
  const min = pad(dateObj.getMinutes());
  const sec = pad(dateObj.getSeconds());
  return `Last login: ${day} ${month} ${date} ${hour}:${min}:${sec} on ttys000`;
}

function updateTerminal() {
  const content = document.getElementById('terminal-content');
  content.innerHTML = '';
  content.innerHTML += `<div class='terminal-last-login'>${lastLoginString}</div>`;
  content.innerHTML += `<br><div>${introText}</div><br>`;
  for(let i = 0; i < history.length; i++) {
    // Only show the input text, not the block cursor, in history
    content.innerHTML += `<div>${getPromptHTML()} ${history[i]}</div>`;
    if(outputHistory[i]) {
      content.innerHTML += `<div class='terminal-output'>${outputHistory[i]}</div>`;
    }
  }
  // Always show a new prompt/input at the end
  content.innerHTML += `<div class='terminal-prompt'>${getPromptHTML()} <div id='fake-input' class='terminal-input' contenteditable='true' spellcheck='false' style='display:inline-block;min-width:1ch;outline:none;'>${renderFakeInput()}</div></div>`;
  const fakeInput = document.getElementById('fake-input');
  fakeInput.focus();
  fakeInput.onkeydown = handleFakeInputKey;
  fakeInput.oninput = handleFakeInputInput;
}

function handleFakeInputKey(e) {
  if(e.key === 'Enter') {
    e.preventDefault();
    let text = fakeInputText();
    currentInput = text;
    processPrompt();
    return;
  }
}

function handleFakeInputInput(e) {
  // Remove the cursor span and get the plain text
  let text = e.target.textContent.replace(/\u00a0/g, ' ');
  currentInput = text.replace(/\s+$/, '');
}

function fakeInputText() {
  // Get the text from the fake input, removing the block cursor
  const fakeInput = document.getElementById('fake-input');
  if (!fakeInput) return '';
  let text = fakeInput.textContent.replace(/\u00a0/g, ' ');
  // Remove the block cursor if present
  text = text.replace(/█$/, '');
  if (text == "") return;
  return text;
}

window.onload = function() {
  // Get last login from localStorage
  let lastLogin = localStorage.getItem('terminal_last_login');
  if (lastLogin) {
    // Parse date string
    let lastDate = new Date(lastLogin);
    lastLoginString = getLoginString(lastDate);
  } else {
    // First time, use current time
    lastLoginString = getLoginString(new Date());
  }
  // Set new login time for next session
  let now = new Date();
  localStorage.setItem('terminal_last_login', now.toString());
  currentLoginString = getLoginString(now);
  updateTerminal();
}
