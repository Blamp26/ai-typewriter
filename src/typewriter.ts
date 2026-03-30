import * as vscode from 'vscode';

// ─── Configuration ─────────────────────────────────────────────────────────

export interface TypewriterConfig {
  baseSpeed: number;
}

export function readConfig(): TypewriterConfig {
  const c = vscode.workspace.getConfiguration('aiTypewriter');
  return {
    baseSpeed: c.get<number>('baseSpeed', 28),
  };
}

// ─── Typewriter Engine ──────────────────────────────────────────────────────

export class TypewriterEngine {
  private queue: string[] = [];
  private streamDone = false;
  private cfg: TypewriterConfig;
  private statusBar?: vscode.StatusBarItem;

  constructor(cfg: TypewriterConfig, statusBar?: vscode.StatusBarItem) {
    this.cfg = cfg;
    this.statusBar = statusBar;
  }

  enqueue(text: string): void {
    for (const ch of text) {
      this.queue.push(ch);
    }
  }

  finish(): void {
    this.streamDone = true;
  }

  async run(editor: vscode.TextEditor, token: vscode.CancellationToken, replaceRange: vscode.Range): Promise<void> {
    this.statusBar?.show();

    try {
      // If there is nothing to type, just perform the deletion/replacement and exit.
      if (this.queue.length === 0) {
        if (!replaceRange.isEmpty) {
          await editor.edit(
            (b) => b.replace(replaceRange, ''),
            { undoStopBefore: true, undoStopAfter: true }, // ✓ isolated undo step
          );
        }
        return;
      }

      // Perform the initial replacement with the first character.
      const firstChar = this.queue.shift()!;
      const success = await editor.edit(
        (b) => b.replace(replaceRange, firstChar),
        { undoStopBefore: true, undoStopAfter: false },
      );

      if (!success || token.isCancellationRequested) return;

      // ✓ Move cursor to just after the inserted character
      const offset = editor.document.offsetAt(replaceRange.start) + 1;
      const newPos = editor.document.positionAt(offset);
      editor.selection = new vscode.Selection(newPos, newPos);

      // Type out the rest of the characters.
      while (true) {
        if (token.isCancellationRequested || editor.document.isClosed) break;

        if (this.queue.length === 0) {
          if (this.streamDone) break;
          await sleep(12);
          continue;
        }

        const ch = this.queue.shift()!;
        await this.insertChar(editor, ch);

        const delay = this.delayFor();
        if (delay > 0) await sleep(delay);
      }
    } finally {
      // The extension is responsible for disposing the status bar
    }
  }

  private async insertChar(editor: vscode.TextEditor, ch: string): Promise<boolean> {
    try {
      const pos = editor.selection.active;
      const success = await editor.edit(
        (b) => b.insert(pos, ch),
        { undoStopBefore: false, undoStopAfter: false },
      );

      if (success) {
        const next = editor.selection.active;
        editor.selection = new vscode.Selection(next, next);
      }
      return success;
    } catch (err) {
      console.error('AI Typewriter edit failed:', err);
      return false;
    }
  }

  private delayFor(): number {
    return Math.max(5, this.cfg.baseSpeed);
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
