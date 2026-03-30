# AI Typewriter for VS Code

> Turn AI responses into realistic "live coding" — with surgical precision and human-like rhythm. Powered by GitHub Copilot.

---

## Features

- **Surgical Edits** — AI analyzes your file and applies precise changes (replace or insert) instead of rewriting the whole document.
- **Typewriter Effect** — Watch the code appear character by character, as if a developer is typing it live.
- **GitHub Copilot Integration** — Uses your existing Copilot subscription via the `vscode.lm` API. No extra API keys needed.
- **Human-like Rhythm** — Configurable typing speed with natural pauses.
- **Cancellable** — Stop generation instantly if the AI goes off track.

---

## Quick Start

### 1. Requirements

- VS Code v1.90.0 or higher.
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension installed and active.

### 2. Usage

1. Open any file in the editor.
2. Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac).
3. Type your request (e.g., "fix the bug in this function" or "add JSDoc comments").
4. Watch the AI surgically replace or insert the code through the typewriter.

---

## Settings

Open **Settings** (`Ctrl+,`) → search **AI Typewriter**:

| Setting | Default | Description |
|---|---|---|
| `aiTypewriter.baseSpeed` | `28` | Base typing delay per character in ms. Lower = faster. |

---

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Run tests
npm test
```

### Launching

1. Open the project in VS Code.
2. Press `F5` to open a new window with the extension loaded.
3. Open a file and test the `Ctrl+Shift+E` command.

---

## Packaging & Installation

To create a `.vsix` file for manual installation:

```bash
npm install -g @vscode/vsce
vsce package
```

Install the generated `.vsix`:
`code --install-extension ai-typewriter-1.0.0.vsix`

---

## Contributors

- **Blamp26** ([@Blamp26](https://github.com/Blamp26)) — Lead Developer
- **bvaj7x** ([@bvaj7x](https://github.com/bvaj7x)) — Core Contributor

---

## License

MIT
