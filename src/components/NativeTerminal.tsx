import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Shield, Code, Database, Cpu, Activity, Github, MessageCircle, Lock, Server, Monitor } from 'lucide-react';

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'success' | 'warning';
  content: string;
  timestamp?: Date;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  permissions?: string;
}

const NativeTerminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/vauth');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCursor, setShowCursor] = useState(true);
  const [isTerminalActive, setIsTerminalActive] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);

  // File system simulation
  const fileSystem: Record<string, FileSystemItem[]> = {
    '/home/vauth': [
      { name: 'projects', type: 'directory', modified: new Date('2025-01-15'), permissions: 'drwxr-xr-x' },
      { name: 'documents', type: 'directory', modified: new Date('2025-01-14'), permissions: 'drwxr-xr-x' },
      { name: 'downloads', type: 'directory', modified: new Date('2025-01-13'), permissions: 'drwxr-xr-x' },
      { name: '.bashrc', type: 'file', size: 3423, modified: new Date('2025-01-10'), permissions: '-rw-r--r--' },
      { name: 'README.md', type: 'file', size: 1024, modified: new Date('2025-01-12'), permissions: '-rw-r--r--' },
      { name: 'source-code.txt', type: 'file', size: 1024, modified: new Date('2025-08-23'), permissions: '-rw-r--r--' },
      { name: 'mail.txt', type: 'file', size: 1024, modified: new Date('2025-05-01'), permissions: '-rw-r--r--' },
      { name: 'pypi.whl', type: 'file', size: 1024, modified: new Date('2025-03-03'), permissions: '-rw-r--r--' },
      { name: 'config.py', type: 'file', size: 1024, modified: new Date('1984-08-09'), permissions: '-rw-r--r--' },
    ],
    '/home/vauth/projects': [
      { name: 'web-app', type: 'directory', modified: new Date('2025-01-15'), permissions: 'drwxr-xr-x' },
      { name: 'ffuf-force', type: 'directory', modified: new Date('2025-01-13'), permissions: 'drwxr-xr-x' },
      { name: 'worker.js', type: 'file', size: 15420, modified: new Date('2025-01-15'), permissions: '-rw-r--r--' },
    ],
    '/home/vauth/documents': [
      { name: 'notes.txt', type: 'file', size: 2048, modified: new Date('2025-01-11'), permissions: '-rw-r--r--' },
      { name: 'contracts', type: 'directory', modified: new Date('2025-01-09'), permissions: 'drwxr-xr-x' },
    ],
    '/home/vauth/downloads': [
      { name: 'ubuntu-22.04.iso', type: 'file', size: 4700000000, modified: new Date('2025-01-08'), permissions: '-rw-r--r--' },
      { name: 'node-v18.tar.gz', type: 'file', size: 45000000, modified: new Date('2025-01-07'), permissions: '-rw-r--r--' },
    ],
  };

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: lineIdRef.current++,
      type,
      content,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'K', 'M', 'G', 'T'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const executeCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to history
    setCommandHistory(prev => {
      const newHistory = [...prev, trimmedCommand];
      return newHistory.slice(-100); // Keep last 100 commands
    });
    setHistoryIndex(-1);

    // Add input line
    addLine('input', trimmedCommand);

    const [cmd, ...args] = trimmedCommand.split(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        addLine('output', `Available commands:
  help          - Show this help message
  ls [options]  - List directory contents (-l for detailed, -la for all)
  pwd           - Print working directory
  cd <dir>      - Change directory (.. for parent, ~ for home)
  cat <file>    - Display file contents
  whoami        - Display current user
  date          - Show current date and time
  uname [-a]    - System information (-a for all)
  ps            - Show running processes
  clear         - Clear terminal
  history       - Show command history
  echo <text>   - Display text
  mkdir <dir>   - Create directory
  touch <file>  - Create empty file
  rm <file>     - Remove file
  tree          - Show directory tree
  neofetch      - System information display
  uptime        - Show system uptime
  df            - Show disk usage
  free          - Show memory usage
  top           - Show system processes
  exit          - Close terminal session`);
        break;

      case 'ls':
        const currentItems = fileSystem[currentDirectory] || [];
        if (currentItems.length === 0) {
          addLine('output', 'Directory is empty');
        } else {
          const hasLongFlag = args.includes('-l') || args.includes('-la');
          const showHidden = args.includes('-la') || args.includes('-a');
          
          let itemsToShow = currentItems;
          if (!showHidden) {
            itemsToShow = currentItems.filter(item => !item.name.startsWith('.'));
          }
          
          if (hasLongFlag) {
            addLine('output', `total ${itemsToShow.length}`);
            itemsToShow.forEach(item => {
              const size = item.size ? formatFileSize(item.size).padStart(8) : '     4.0K';
              const date = item.modified?.toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit' 
              }) || 'Jan 15';
              const time = item.modified?.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }) || '12:00';
              const permissions = item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
              addLine('output', `${permissions} 1 vauth vauth ${size} ${date} ${time} ${item.name}`);
            });
          } else {
            const itemNames = itemsToShow.map(item => 
              item.type === 'directory' ? `${item.name}/` : item.name
            ).join('  ');
            addLine('output', itemNames);
          }
        }
        break;

      case 'pwd':
        addLine('output', currentDirectory);
        break;

      case 'cd':
        const targetDir = args[0];
        if (!targetDir || targetDir === '~') {
          setCurrentDirectory('/home/vauth');
          addLine('success', 'Changed to home directory');
        } else if (targetDir === '..') {
          const pathParts = currentDirectory.split('/').filter(Boolean);
          if (pathParts.length > 1) {
            pathParts.pop();
            const parentDir = '/' + pathParts.join('/');
            setCurrentDirectory(parentDir);
            addLine('success', `Changed to ${parentDir}`);
          } else {
            setCurrentDirectory('/');
            addLine('success', 'Changed to root directory');
          }
        } else if (targetDir.startsWith('/')) {
          if (fileSystem[targetDir]) {
            setCurrentDirectory(targetDir);
            addLine('success', `Changed to ${targetDir}`);
          } else {
            addLine('error', `cd: ${targetDir}: No such file or directory`);
          }
        } else {
          const newPath = currentDirectory === '/' ? `/${targetDir}` : `${currentDirectory}/${targetDir}`;
          if (fileSystem[newPath]) {
            setCurrentDirectory(newPath);
            addLine('success', `Changed to ${newPath}`);
          } else {
            const currentItems = fileSystem[currentDirectory] || [];
            const dirExists = currentItems.some(item => item.name === targetDir && item.type === 'directory');
            if (dirExists) {
              setCurrentDirectory(newPath);
              addLine('success', `Changed to ${newPath}`);
            } else {
              addLine('error', `cd: ${targetDir}: No such file or directory`);
            }
          }
        }
        break;

      case 'cat':
        const filename = args[0];
        if (!filename) {
          addLine('error', 'cat: missing file operand');
        } else {
          const currentItems = fileSystem[currentDirectory] || [];
          const file = currentItems.find(item => item.name === filename && item.type === 'file');
          if (file) {
            if (filename === '.bashrc') {
              addLine('output', `# ~/.bashrc: executed by bash(1) for non-login shells.

export PATH=$HOME/bin:/usr/local/bin:$PATH
export EDITOR=vim
export BROWSER=firefox

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# Custom prompt
PS1='\\[\\033[01;37m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;37m\\]\\w\\[\\033[00m\\]\\$ '

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000`);
            } else if (filename === 'README.md') {
              addLine('output', `PyGeek, GUI, Web development, Automation, ML, Data integration, BB & etc.`);
            } else if (filename === 'mail.txt') {
                addLine('output', `odium@disroot.org`);
            } else if (filename === 'pypi.whl') {
                addLine('output', `https://pypi.org/user/ivuxy`);
            } else if (filename === 'source-code.txt') {
                addLine('output', `https://github.com/vauth/vauth-terminal`);
            } else if (filename === 'config.py') {
                addLine('output', `class Production(Config): LOGGER = True`);
            } else if (filename === 'notes.txt') {
              addLine('output', `Stay focused on OWASP & Web Security`);
            } else {
              addLine('output', `File contents of ${filename}...
This is a sample file in the filesystem.
Content would be displayed here in a real terminal.`);
            }
          } else {
            addLine('error', `cat: ${filename}: No such file or directory`);
          }
        }
        break;

      case 'whoami':
        addLine('output', 'vauth');
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'uname':
        const hasAllFlag = args.includes('-a');
        if (hasAllFlag) {
          addLine('output', 'Linux vauth-workstation 6.2.0-39-generic #40~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC Thu Nov 16 10:53:04 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux');
        } else {
          addLine('output', 'Linux');
        }
        break;

      case 'ps':
        addLine('output', `    PID TTY          TIME CMD
   1234 pts/0    00:00:01 bash
   5678 pts/0    00:00:03 node
   9012 pts/0    00:00:02 python3
   3456 pts/0    00:00:01 code
   7890 pts/0    00:00:00 docker
   2468 pts/0    00:00:00 ps`);
        break;

      case 'top':
        addLine('output', `top - ${new Date().toLocaleTimeString()} up 7 days, 14:23, 1 user, load average: 0.52, 0.58, 0.59
Tasks: 312 total,   1 running, 311 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.4 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  32768.0 total,  12847.2 free,   8234.1 used,  11686.7 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  23456.8 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1234 vauth     20   0 1234567  123456  12345 S   5.2   0.4   1:23.45 node
   5678 vauth     20   0  987654   98765   9876 S   3.1   0.3   0:45.67 python3
   9012 vauth     20   0  654321   65432   6543 S   1.8   0.2   0:23.45 code`);
        break;

      case 'free':
        addLine('output', `               total        used        free      shared  buff/cache   available
Mem:        33554432    8456789    13456789      123456    11640854    24097643
Swap:        2097152          0     2097152`);
        break;

      case 'df':
        addLine('output', `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1       98566400  45678901  47887499  49% /
/dev/sda2        1048576    123456    925120  12% /boot
tmpfs           16777216         0  16777216   0% /dev/shm
tmpfs           16777216      1234  16775982   1% /run`);
        break;

      case 'uptime':
        addLine('output', ` ${new Date().toLocaleTimeString()} up 7 days, 14:23, 1 user, load average: 0.52, 0.58, 0.59`);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'history':
        commandHistory.forEach((cmd, index) => {
          addLine('output', `${(index + 1).toString().padStart(4)} ${cmd}`);
        });
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'mkdir':
        const dirName = args[0];
        if (!dirName) {
          addLine('error', 'mkdir: missing operand');
        } else {
          addLine('success', `Directory '${dirName}' created successfully`);
        }
        break;

      case 'touch':
        const fileName = args[0];
        if (!fileName) {
          addLine('error', 'touch: missing file operand');
        } else {
          addLine('success', `File '${fileName}' created successfully`);
        }
        break;

      case 'rm':
        const rmFile = args[0];
        if (!rmFile) {
          addLine('error', 'rm: missing operand');
        } else {
          addLine('success', `File '${rmFile}' removed successfully`);
        }
        break;

      case 'tree':
        addLine('output', `${currentDirectory}
├── projects/
│   ├── web-app/
│   ├── ffuf-force/
│   └── worker.js
├── documents/
│   ├── notes.txt
│   └── contracts/
├── downloads/
│   ├── ubuntu-22.04.iso
│   └── node-v18.tar.gz
├── .bashrc
└── README.md

6 directories, 8 files`);
        break;

      case 'neofetch':
        addLine('output', `                   -\`                    vauth@workstation
                  .o+\`                   ------------------
                 \`ooo/                   OS: Ubuntu 22.04.3 LTS x86_64
                \`+oooo:                  Host: Professional Workstation
               \`+oooooo:                 Kernel: 6.2.0-39-generic
               -+oooooo+:                Uptime: 7 days, 14 hours, 23 mins
             \`/:-:++oooo+:               Packages: 2847 (dpkg), 63 (snap)
            \`/++++/+++++++:              Shell: bash 5.1.16
           \`/++++++++++++++:             Resolution: 3840x2160
          \`/+++ooooooooooooo/\`           DE: GNOME 42.9
         ./ooosssso++osssssso+\`          WM: Mutter
        .oossssso-\`\`\`\`/ossssss+\`         WM Theme: Adwaita
       -osssssso.      :ssssssso.        Theme: Yaru-blue [GTK2/3]
      :osssssss/        osssso+++.       Icons: Yaru [GTK2/3]
     /ossssssss/        +ssssooo/-       Terminal: gnome-terminal
   \`/ossssso+/:-        -:/+osssso+-     CPU: Intel i7-12700K (20) @ 5.000GHz
  \`+sso+:-\`                 \`.-/+oso:    GPU: NVIDIA GeForce RTX 4080
 \`++:.                           \`-/+/   Memory: 8456MiB / 32768MiB
 .\`                                 \`/`);
        break;

      case 'exit':
        addLine('warning', 'Terminal session ended. Refresh page to restart.');
        setIsTerminalActive(false);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.disabled = true;
          }
        }, 100);
        break;

      default:
        addLine('error', `Command not found: ${cmd}. Type 'help' for available commands.`);
    }
  }, [currentDirectory, commandHistory, addLine]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isTerminalActive) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help', 'ls', 'pwd', 'cd', 'cat', 'whoami', 'date', 'uname', 'ps', 'clear', 'history', 'echo', 'mkdir', 'touch', 'rm', 'tree', 'neofetch', 'uptime', 'df', 'free', 'top', 'exit'];
      const matches = commands.filter(cmd => cmd.startsWith(currentInput.toLowerCase()));
      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      } else if (matches.length > 1) {
        addLine('output', matches.join('  '));
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Initialize terminal only once
  useEffect(() => {
    if (!hasInitialized) {
      addLine('output', 'Type "help" for available commands or "neofetch" for system info.');
      addLine('output', '');
      setHasInitialized(true);
    }
  }, [addLine, hasInitialized]);

  useEffect(() => {
    // Focus input when component mounts and on click
    const focusInput = () => {
      if (inputRef.current && !inputRef.current.disabled && isTerminalActive) {
        inputRef.current.focus();
      }
    };
    
    focusInput();
    document.addEventListener('click', focusInput);
    
    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, [isTerminalActive]);

  const systemStats = [
    { label: 'CPU', value: '87.3%', color: 'text-white', icon: Cpu },
    { label: 'MEMORY', value: '25.8%', color: 'text-gray-300', icon: Monitor },
    { label: 'NETWORK', value: 'SECURE', color: 'text-gray-400', icon: Wifi },
    { label: 'FIREWALL', value: 'ACTIVE', color: 'text-gray-500', icon: Shield }
  ];

  const processes = [
    { name: 'python3', status: 'RUNNING', pid: '1337', cpu: '5.2%' },
    { name: 'node.js', status: 'RUNNING', pid: '2048', cpu: '3.1%' },
    { name: 'docker', status: 'RUNNING', pid: '4096', cpu: '1.8%' },
    { name: 'nginx', status: 'RUNNING', pid: '8192', cpu: '0.5%' }
  ];

  const databases = [
    { name: 'PostgreSQL', status: 'CONNECTED', port: '5432', latency: '2ms' },
    { name: 'MongoDB', status: 'CONNECTED', port: '27017', latency: '3ms' },
    { name: 'Redis', status: 'CONNECTED', port: '6379', latency: '1ms' },
    { name: 'Elasticsearch', status: 'CONNECTED', port: '9200', latency: '5ms' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Website Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 tracking-tight">
          Vauth
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-light">
          What could have been?
        </p>
      </motion.div>

      {/* Main Terminal Window */}
      <motion.div 
        className="glass-panel rounded-xl overflow-hidden"
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Terminal Header - Minimal Design */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="macos-traffic-lights">
            <div className="macos-traffic-light close"></div>
            <div className="macos-traffic-light minimize"></div>
            <div className="macos-traffic-light maximize"></div>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <div className="glass-badge">
              <Wifi className="w-3 h-3 text-white" />
              <span className="text-white">SECURE</span>
            </div>
            <div className="glass-badge">
              <Shield className="w-3 h-3 text-gray-300" />
              <span className="text-gray-300">ENCRYPTED</span>
            </div>
            <div className="glass-badge">
              <Lock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">AES-256</span>
            </div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 min-h-[500px] max-h-[600px] overflow-y-auto font-mono text-base leading-relaxed text-white cursor-text" 
             ref={terminalRef} 
             onClick={() => inputRef.current?.focus()}>
          {/* Terminal Lines */}
          <div className="space-y-1">
            <AnimatePresence>
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`terminal-line ${
                    line.type === 'input' ? 'text-white' :
                    line.type === 'error' ? 'terminal-error' :
                    line.type === 'success' ? 'terminal-success' :
                    line.type === 'warning' ? 'terminal-warning' :
                    'terminal-output'
                  }`}
                >
                  {line.type === 'input' ? (
                    <div className="flex items-start">
                      <span className="terminal-prompt flex-shrink-0 text-blue-600">{currentDirectory} $</span>
                      <span className="font-mono ml-2">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="font-mono whitespace-pre-wrap leading-relaxed">{line.content}</pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Current Input Line */}
          {isTerminalActive && (
            <div className="terminal-line mt-4">
              <div className="flex items-center">
                <span className="terminal-prompt flex-shrink-0 text-blue-600">{currentDirectory} $</span>
                <div className="flex items-center ml-2 relative">
                  <span className="font-mono text-white">{currentInput}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute bg-transparent border-none outline-none font-mono text-base w-full"
                    style={{ width: `${Math.max(1, currentInput.length + 1)}ch` }}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* System Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* System Status */}
        <motion.div 
          className="glass-panel rounded-xl p-4 lg:p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="glass-icon-container">
              <Cpu className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="text-white text-xs lg:text-sm font-semibold font-display">SYSTEM STATUS</span>
          </div>
          <div className="space-y-3 text-xs">
            {systemStats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2">
                  <stat.icon className="w-3 h-3" />
                  <span className="text-gray-300">{stat.label}:</span>
                </div>
                {stat.label === 'CPU' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-12 lg:w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-white to-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className={`${stat.color} font-medium`}>{stat.value}</span>
                  </div>
                ) : (
                  <span className={`${stat.color} font-medium`}>{stat.value}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Processes */}
        <motion.div 
          className="glass-panel rounded-xl p-4 lg:p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="glass-icon-container">
              <Code className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="text-white text-xs lg:text-sm font-semibold font-display">ACTIVE PROCESSES</span>
          </div>
          <div className="space-y-3 text-xs">
            {processes.map((process, index) => (
              <motion.div 
                key={process.name}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2">
                  <Server className="w-3 h-3" />
                  <span className="text-gray-300 font-mono">{process.name}</span>
                  <span className="text-gray-500 text-xs">({process.pid})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">{process.cpu}</span>
                  <div className="status-dot"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Database Connections */}
        <motion.div 
          className="glass-panel rounded-xl p-4 lg:p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="glass-icon-container">
              <Database className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="text-white text-xs lg:text-sm font-semibold font-display">DB CONNECTIONS</span>
          </div>
          <div className="space-y-3 text-xs">
            {databases.map((db, index) => (
              <motion.div 
                key={db.name}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-3 h-3" />
                  <span className="text-gray-300">{db.name}</span>
                  <span className="text-gray-500 text-xs">({db.port})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">{db.latency}</span>
                  <div className="status-dot"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Secure Channels */}
      <motion.div 
        className="glass-panel rounded-xl p-4 lg:p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="glass-icon-container">
            <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="text-white text-xs lg:text-sm font-semibold font-display">SECURE CHANNELS</span>
        </div>
        <div className="flex flex-wrap gap-3 lg:gap-4">
          <motion.a 
            href="https://github.com/vauth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-link group"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Github className="w-4 h-4 text-white group-hover:text-gray-300 transition-colors duration-200" />
            <span className="text-white group-hover:text-gray-300 transition-colors duration-200">github.com/vauth</span>
          </motion.a>
          <motion.a 
            href="https://t.me/authed" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass-link group"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle className="w-4 h-4 text-white group-hover:text-gray-300 transition-colors duration-200" />
            <span className="text-white group-hover:text-gray-300 transition-colors duration-200">t.me/authed</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default NativeTerminal;
