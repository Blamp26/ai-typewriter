# ⌨️ AI Typewriter for VS Code

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Blamp26/ai-typewriter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-^1.90.0-68217a.svg)](https://code.visualstudio.com/)

**AI Typewriter** transforms standard AI code generation into a realistic, "live coding" experience. Instead of static text blocks appearing instantly, watch as GitHub Copilot surgically refactors your code with human-like rhythm, thinking pauses, and character-by-character precision.

---

## ✨ Key Features

- **🎯 Surgical Precision** — Unlike traditional AI tools that rewrite entire files, AI Typewriter analyzes your code and applies targeted edits (replacements or insertions) only where needed.
- **🎬 Typewriter Animation** — Watch the AI "type" its changes live in your editor, complete with configurable speeds and natural pauses.
- **🤖 Native Copilot Integration** — Leverages the official `vscode.lm` API to use your existing GitHub Copilot subscription. No external API keys or configuration required.
- **⚡ Performance-First Architecture** — Uses atomic workspace edits to ensure line-stability and prevent editor state conflicts during animations.
- **🛑 Instant Cancellation** — Full control over the generation process with a one-click cancel command.

---

## 🚀 Quick Start

### Prerequisites

- **VS Code** v1.90.0 or higher.
- [**GitHub Copilot Extension**](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) installed and active.

### Installation

1. Open VS Code.
2. Search for **AI Typewriter** in the Extensions view (`Ctrl+Shift+X`).
3. Click **Install**.

*Alternatively, for manual installation, see the [Packaging](#-packaging--installation) section.*

### Usage

1. **Open** any source file in the editor.
2. **Press** `Ctrl+Shift+E` (or `Cmd+Shift+E` on macOS) to trigger the generator.
3. **Describe** your intent (e.g., *"Convert this loop to a map function"* or *"Add error handling to this try-catch block"*).
4. **Watch** the AI surgically apply the changes through the typewriter animation.

---

## ⚙️ Configuration

Tailor the typing experience to your preference via **Settings** (`Ctrl+,`) → **Extensions** → **AI Typewriter**:

| Setting | Type | Default | Description |
|:---|:---:|:---:|:---|
| `aiTypewriter.baseSpeed` | `number` | `28` | Base delay per character in milliseconds. Lower values increase typing speed. |

---

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/Blamp26/ai-typewriter.git
cd ai-typewriter

# Install dependencies
npm install

# Compile the project
npm run compile
```

### Running Locally

1. Open the project folder in VS Code.
2. Press `F5` to launch a **Extension Development Host** window.
3. In the new window, open any file and test the `AI Typewriter: Edit with Copilot` command.

### Testing

```bash
# Run the automated test suite
npm test
```

---

## 📦 Packaging & Installation

To create a `.vsix` bundle for offline distribution:

```bash
# Install the packaging tool
npm install -g @vscode/vsce

# Create the package
vsce package
```

To install the generated package:
```bash
code --install-extension ai-typewriter-1.0.0.vsix
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Authors & Acknowledgements

- **Blamp26** ([@Blamp26](https://github.com/Blamp26)) — Lead Developer & Architect
- **bvaj7x** ([@bvaj7x](https://github.com/bvaj7x)) — Core Contributor & Technical Advisor

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for the VS Code Community
</p>
