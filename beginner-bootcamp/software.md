# Software Setup Guide

## Required Software

### 1. Web Browser
**Chrome** (recommended for DevTools)
- Download: https://www.google.com/chrome/
- Enable: DevTools, React DevTools extension

**Alternatives:** Firefox Developer Edition, Edge

### 2. Code Editor
**VS Code** (recommended)
- Download: https://code.visualstudio.com/
- Extensions to install:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets
  - Path Intellisense
  - Auto Rename Tag

**Alternatives:** WebStorm, Sublime Text

### 3. Node.js
**Version 18 LTS or higher**
- Download: https://nodejs.org/
- Verify: `node --version` should show v18+

### 4. Package Manager
**npm** (comes with Node.js)
- Verify: `npm --version`

**Alternative:** pnpm (faster, more disk efficient)
- Install: `npm install -g pnpm`

### 5. Git
**Version control**
- Download: https://git-scm.com/
- Verify: `git --version`
- Configure:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

## Optional (But Helpful)

### Terminal
- **macOS:** iTerm2
- **Windows:** Windows Terminal
- **Linux:** Terminator

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Lighthouse
- Web Vitals
- Axe DevTools (accessibility)

### Design Tools
- Figma (free)
- Chrome DevTools Design Mode

## Verify Your Setup

Run these commands:
```bash
node --version   # Should show v18+
npm --version    # Should show 8+
git --version    # Any recent version

# Test Node.js
node -e "console.log('Setup complete!')"
```

## VS Code Settings

Create `.vscode/settings.json` in your projects:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

## Troubleshooting

### Node.js issues
- Try nvm (Node Version Manager) for managing versions
- macOS/Linux: https://github.com/nvm-sh/nvm
- Windows: https://github.com/coreybutler/nvm-windows

### Permission errors
- Avoid `sudo npm install -g`
- Fix: Change npm's default directory

---

**Setup complete? Start learning: [Module 1: HTML & CSS](1-html-css-fundamentals/) →**
