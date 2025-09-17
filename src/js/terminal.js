let history = [];
let outputHistory = [];
let promptHistory = [];
let currentInput = '';
let time_updated = false;
let lastLoginString = '';
let currentLoginString = '';

introText = `
Hi! Welcome to my terminal emulator. This is an emulation of my Mac's terminal.<br>
Some, but not all commands are supported. The folders contain information on my projects.<br>
`;

// Generic, publicly available Unix/Mac root filesystem structure
const fsRoot = {
  type: 'dir',
  name: '/',
  children: {
    bin: { type: 'dir', name: 'bin', children: {} },
    sbin: { type: 'dir', name: 'sbin', children: {} },
    etc: { type: 'dir', name: 'etc', children: {
      'passwd': { type: 'file', name: 'passwd', content: '' },
      'hosts': { type: 'file', name: 'hosts', content: '' },
      'profile': { type: 'file', name: 'profile', content: '' },
      'group': { type: 'file', name: 'group', content: '' }
    }},
    usr: {
      type: 'dir',
      name: 'usr',
      children: {
        bin: { type: 'dir', name: 'bin', children: {} },
        sbin: { type: 'dir', name: 'sbin', children: {} },
        lib: { type: 'dir', name: 'lib', children: {} },
        include: { type: 'dir', name: 'include', children: {} },
        share: { type: 'dir', name: 'share', children: {} },
        local: {
          type: 'dir',
          name: 'local',
          children: {
            bin: { type: 'dir', name: 'bin', children: {} },
            share: { type: 'dir', name: 'share', children: {} }
          }
        }
      }
    },
    var: {
      type: 'dir',
      name: 'var',
      children: {
        log: { type: 'dir', name: 'log', children: {} },
        tmp: { type: 'dir', name: 'tmp', children: {} },
        spool: { type: 'dir', name: 'spool', children: {} }
      }
    },
    tmp: { type: 'dir', name: 'tmp', children: {} },
    dev: { type: 'dir', name: 'dev', children: {
      'null': { type: 'file', name: 'null', content: '' },
      'zero': { type: 'file', name: 'zero', content: '' }
    }},
    home: {
      type: 'dir',
      name: 'home',
      children: {

      }
    },
    System: { type: 'dir', name: 'System', children: {} },
    Applications: { type: 'dir', name: 'Applications', children: {} },
    Library: { type: 'dir', name: 'Library', children: {} },
    Users: { type: 'dir', name: 'Users', children: {
      'user': { type: 'dir', name: 'user', children: { 
                projects: { type: 'dir', name: 'projects', children: {} },
        "README.txt": { type: 'file', name: 'README.txt', content: 'Welcome to the projects directory! This is a placeholder file.' },
        ".zshrc": { type: 'file', name: '.zshrc', content: `# ~/.zshrc
echo ""
echo "Hi! Welcome to my terminal emulator. This is an emulation of my Mac's terminal."
echo "Some, but not all commands are supported. The folders contain information on my projects."
echo ""\n` }
          }
        }
      }
    },
    Volumes: { type: 'dir', name: 'Volumes', children: {} },
    opt: { type: 'dir', name: 'opt', children: {} },
    mnt: { type: 'dir', name: 'mnt', children: {} },
    private: { type: 'dir', name: 'private', children: {} },
    cores: { type: 'dir', name: 'cores', children: {} },
    network: { type: 'dir', name: 'network', children: {} },
    tmp: { type: 'dir', name: 'tmp', children: {} }
    // Add more folders/files as needed!
  }
};

let fsCurrentPath = ['/']; // Start at root

function processPrompt() {
  // Remove the block cursor before processing
  let processedInput = currentInput;
  history.push(processedInput);
  promptHistory.push(fsCurrentPath.slice());
  outputHistory.push(processCommand(processedInput));
  currentInput = '';
  updateTerminal();
}

function resolvePath(pathStr) {
  // Returns [node, error] for a given path string
  if (!pathStr) return [getCurrentDirNode(), null];
  let parts = pathStr.trim().split('/').filter(Boolean);

  // Absolute path: start from root
  let node, current;
  if (pathStr.startsWith('/')) {
    node = fsRoot;
    current = ['/'];
  } else {
    node = getCurrentDirNode();
    current = fsCurrentPath.slice();
  }

  for (let part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (current.length <= 1) {
        current = ['/'];
        node = fsRoot;
        continue;
      }
      current.pop();
      node = getNodeFromPath(current);
      continue;
    }
    if (!node.children || !node.children[part]) {
      return [null, `No such file or directory: ${pathStr}`];
    }
    node = node.children[part];
    current.push(part);
  }
  return [node, null];
}

function getNodeFromPath(pathArr) {
  let node = fsRoot;
  // If root, just return fsRoot
  if (pathArr.length === 1 && pathArr[0] === '/') return fsRoot;
  for (let i = 1; i < pathArr.length; i++) {
    let part = pathArr[i];
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function getCurrentDirNode() {
  return getNodeFromPath(fsCurrentPath);
}

function processCommand(cmd) {
  let input = cmd.trim();
  if (input === '') return '';

  // clear
  if (input === 'clear') {
    history = [];
    outputHistory = [];
    promptHistory = [];
    return '';
  }

  // echo
  if (input.startsWith('echo ')) {
    let arg = input.slice(5).trim();
    return arg;
  }

  // pwd
  if (input === 'pwd') {
    return fsCurrentPath.length === 1 ? '/' : '/' + fsCurrentPath.slice(1).join('/');
  }

  // ls
  if (input.startsWith('ls')) {
    let arg = input.slice(2).trim();
    let node = getCurrentDirNode();
    if (arg) {
      let [target, err] = resolvePath(arg);
      if (err) return `ls: ${arg}: No such file or directory`;
      node = target;
    }
    if (!node || node.type !== 'dir') return `ls: ${arg}: Not a directory`;
    return Object.keys(node.children).join('  ');
  }

  // cd
  if (input.startsWith('cd')) {
    let arg = input.slice(2).trim();

    if (!arg) {
      fsCurrentPath = ['/'];
      return '';
    }

    let [target, err] = resolvePath(arg);
    if (err) return `cd: no such file or directory: ${arg}`;
    if (target.type !== 'dir') return `cd: not a directory: ${arg}`;

    let parts = fsCurrentPath.slice();
    let argParts = arg.split('/').filter(Boolean);
    for (let part of argParts) {
      if (part === '.') continue;
      if (part === '..') {
        if (parts.length <= 1) {
          parts = ['/'];
          continue;
        }
        parts.pop();
        continue;
      }
      parts.push(part);
    }
    fsCurrentPath = parts;
    return '';
  }

  // cat
  if (input.startsWith('cat ')) {
    let arg = input.slice(4).trim();
    let [target, err] = resolvePath(arg);
    if (err) return `cat: ${arg}: No such file or directory`;
    if (target.type !== 'file') return `cat: ${arg}: Is a directory`;
    return target.content.replace(/\n/g, '<br>');
  }

  // touch
  if (input.startsWith('touch ')) {
    let arg = input.slice(6).trim();
    if (!arg) return 'touch: missing file operand';
    let dirNode = getCurrentDirNode();
    if (arg.includes('/')) {
      let pathParts = arg.split('/');
      let fileName = pathParts.pop();
      let dirPath = pathParts.join('/');
      let [target, err] = resolvePath(dirPath);
      if (err) return `touch: ${dirPath}: No such file or directory`;
      if (target.type !== 'dir') return `touch: ${dirPath}: Not a directory`;
      if (target.children[fileName]) return '';
      target.children[fileName] = { type: 'file', name: fileName, content: '' };
      return '';
    } else {
      if (dirNode.children[arg]) return '';
      dirNode.children[arg] = { type: 'file', name: arg, content: '' };
      return '';
    }
  }

  // mkdir
  if (input.startsWith('mkdir ')) {
    let arg = input.slice(6).trim();
    if (!arg) return 'mkdir: missing operand';
    let dirNode = getCurrentDirNode();
    if (arg.includes('/')) {
      let pathParts = arg.split('/');
      let dirName = pathParts.pop();
      let dirPath = pathParts.join('/');
      let [target, err] = resolvePath(dirPath);
      if (err) return `mkdir: ${dirPath}: No such file or directory`;
      if (target.type !== 'dir') return `mkdir: ${dirPath}: Not a directory`;
      if (target.children[dirName]) return `mkdir: ${arg}: File exists`;
      target.children[dirName] = { type: 'dir', name: dirName, children: {} };
      return '';
    } else {
      if (dirNode.children[arg]) return `mkdir: ${arg}: File exists`;
      dirNode.children[arg] = { type: 'dir', name: arg, children: {} };
      return '';
    }
  }

  // fallback: command not found
  return `zsh: command not found: ${cmd}`;
}


function getPromptHTML(pathArr) {
  // Show / for root, otherwise /subdir/subdir
  let path = '/';
  if (pathArr && pathArr.length > 1) {
    path = '/' + pathArr.slice(1).join('/');
  } else if (!pathArr && fsCurrentPath.length > 1) {
    path = '/' + fsCurrentPath.slice(1).join('/');
  }
  return `projects@ethans-mac-emulator ${path} %`;
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
    // Show the prompt as it was at the time of input
    content.innerHTML += `<div>${getPromptHTML(promptHistory[i])} ${history[i]}</div>`;
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