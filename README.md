# Vauth Terminal
A sleek, interactive terminal-style portfolio website built with React, TypeScript, and Tailwind CSS. Features a fully functional terminal interface with command execution, file system simulation, and beautiful glass morphism design.

![Vauth Terminal](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue)

<br>

## 🗜 Features
- **Interactive Terminal**: Fully functional terminal with command history, tab completion, and file system navigation
- **Glass Morphism Design**: Modern black & white liquid glass aesthetic with subtle animations
- **Responsive Layout**: Optimized for all devices from mobile to desktop
- **System Monitoring**: Real-time system stats, process monitoring, and database connections
- **Command Support**: 20+ terminal commands including `ls`, `cd`, `cat`, `ps`, `neofetch`, and more
- **File System Simulation**: Navigate through a realistic directory structure
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **SEO Optimized**: Complete meta tags, structured data, and social media optimization

<br>

## 🚀 Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/vauth/vauth-terminal)

<br>

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

<br>

## 📦 Installation
- **Clone the repository**
   ```bash
   git clone https://github.com/vauth/terminal-portfolio.git
   cd terminal-portfolio
   ```

- **Install dependencies**
   ```bash
   npm install
   ```

- **Start development server**
   ```bash
   npm run dev
   ```

- **Build for production**
   ```bash
   npm run build
   ```
<br>

## 🎯 Available Commands
The terminal supports the following commands:
| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `ls [-l] [-la]` | List directory contents |
| `pwd` | Print working directory |
| `cd <dir>` | Change directory |
| `cat <file>` | Display file contents |
| `whoami` | Display current user |
| `date` | Show current date and time |
| `uname [-a]` | System information |
| `ps` | Show running processes |
| `top` | Show system processes |
| `free` | Show memory usage |
| `df` | Show disk usage |
| `uptime` | Show system uptime |
| `clear` | Clear terminal |
| `history` | Show command history |
| `echo <text>` | Display text |
| `mkdir <dir>` | Create directory |
| `touch <file>` | Create empty file |
| `rm <file>` | Remove file |
| `tree` | Show directory tree |
| `neofetch` | System information display |
| `exit` | Close terminal session |

<br>

## 🎨 Customization
### Styling
The design uses CSS custom properties for easy theming. Key variables are defined in `src/index.css`:

```css
:root {
  --glass-bg: rgba(0, 0, 0, 0.4);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: #e5e5e5;
  /* ... more variables */
}
```

### Terminal Commands
Add new commands by extending the `executeCommand` function in `src/components/NativeTerminal.tsx`:

```typescript
case 'your-command':
  addLine('output', 'Your command output here');
  break;
```

### File System
Modify the file system structure in the `fileSystem` object:

```typescript
const fileSystem: Record<string, FileSystemItem[]> = {
  '/home/vauth': [
    { name: 'your-file.txt', type: 'file', size: 1024 },
    // ... more files
  ],
};
```

<br>

## 🌐 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

<br>

## 🔗 Contributing
Contributions are welcome! Feel free to submit a pull request or report an issue.

<br>

## 🔎 License
```
MIT License

Copyright (c) 2025 Vauth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
