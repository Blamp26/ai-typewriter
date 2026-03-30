import * as vscode from 'vscode';
import { TypewriterEngine, readConfig } from './typewriter';
import { getCopilotEdit } from './providers/copilot';

let abortController: AbortController | null = null;

export function activate(context: vscode.ExtensionContext): void {
  console.log('AI Typewriter is now active!');

  const command = vscode.commands.registerCommand('aiTypewriter.generateWithCopilot', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('AI Typewriter: Open a file in the editor first.');
      return;
    }

    const prompt = await vscode.window.showInputBox({
      title: 'AI Typewriter — Copilot Edit',
      prompt: 'What should I change?',
      placeHolder: 'e.g., \"add JSDoc comments to this function\" or \"refactor this to use a switch statement\"',
      ignoreFocusOut: true,
    });
    if (!prompt) return;

    await runAutonomousEdit(editor, prompt);
  });

  context.subscriptions.push(command);

  // The status bar button is the main entry point now
  const statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  statusBarButton.text = '$(sparkle) Edit with AI';
  statusBarButton.tooltip = 'Request an AI-powered edit for the current file';
  statusBarButton.command = 'aiTypewriter.generateWithCopilot';
  statusBarButton.show();
  context.subscriptions.push(statusBarButton);

  // A command to cancel any ongoing generation
  const cancelCommand = vscode.commands.registerCommand('aiTypewriter.cancel', () => {
    abortController?.abort();
    abortController = null;
  });
  context.subscriptions.push(cancelCommand);
}

async function runAutonomousEdit(editor: vscode.TextEditor, prompt: string): Promise<void> {
  abortController = new AbortController();
  const token = makeCancellationToken(abortController.signal);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: '$(sync~spin) AI is thinking...',
      cancellable: true,
    },
    async (_progress, progressToken) => {
      progressToken.onCancellationRequested(() => abortController?.abort());

      const closeListener = vscode.workspace.onDidCloseTextDocument(doc => {
        if (doc === editor.document) abortController?.abort();
      });

      try {
        const edits = await getCopilotEdit(prompt, editor.document, token);

        if (token.isCancellationRequested) return;
        if (!edits || edits.length === 0) {
          vscode.window.showWarningMessage('AI did not suggest any edits.');
          return;
        }

        _progress.report({ message: `AI found ${edits.length} edit(s)...` });

        // Sort edits from the end of the file to the beginning to avoid line shifts.
        const sorted = [...edits].sort((a, b) => b.startLine - a.startLine);

        _progress.report({ message: 'AI is typing...' });

        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBar.text = '$(sync~spin) AI Typewriter...';
        statusBar.tooltip = 'AI is generating code — click to cancel';
        statusBar.command = 'aiTypewriter.cancel';
        statusBar.show();

        try {
          // Шаг 1: атомарно вычисляем все диапазоны ДО любых изменений
          const ranges: vscode.Range[] = sorted.map(edit => {
            const isInsert = edit.type === 'insert';
            const startLine = Math.max(0, edit.startLine - 1);
            const endLine = isInsert ? startLine : Math.max(0, edit.endLine - 1);
            const maxLine = editor.document.lineCount - 1;
          const clampedEndLine = Math.min(endLine, maxLine);
          
          const startPos = new vscode.Position(startLine, 0);
          // Normalize range to include the full end line
          const endLineRange = editor.document.lineAt(clampedEndLine).range;
          const endPos = isInsert ? startPos : endLineRange.end;
          
          return new vscode.Range(startPos, endPos);
          });

          // Шаг 2: удаляем все старые блоки разом через WorkspaceEdit
          const workspaceEdit = new vscode.WorkspaceEdit();
          for (let i = 0; i < sorted.length; i++) {
            workspaceEdit.replace(editor.document.uri, ranges[i], `/*__AITYPE_${i}__*/`);
          }
          await vscode.workspace.applyEdit(workspaceEdit);

          // Шаг 3: печатаем каждую правку через typewriter, находя плейсхолдер
          for (let i = 0; i < sorted.length; i++) {
            if (token.isCancellationRequested) break;

            const placeholder = `/*__AITYPE_${i}__*/`;
            const text = editor.document.getText();
            const idx = text.indexOf(placeholder);
            if (idx === -1) continue;

            const pos = editor.document.positionAt(idx);
            const endPos = editor.document.positionAt(idx + placeholder.length);
            const range = new vscode.Range(pos, endPos);

            const cfg = readConfig();
            const engine = new TypewriterEngine(cfg, statusBar);
            engine.enqueue(sorted[i].newCode);
            engine.finish();
            await engine.run(editor, token, range);
          }
        } finally {
          statusBar.dispose();
        }
      } catch (err: unknown) {
        if (
          token.isCancellationRequested ||
          (err as Error).name === 'AbortError' ||
          (err as Error).name === 'CancellationError' ||
          (err as Error)?.message?.toLowerCase().includes('cancel')
        ) {
          return; // User cancelled
        }
        vscode.window.showErrorMessage(`AI Typewriter error: ${String(err)}`);
      } finally {
        closeListener.dispose();
        abortController = null;
      }
    },
  );
}

function makeCancellationToken(signal: AbortSignal): vscode.CancellationToken {
  const source = new vscode.CancellationTokenSource();
  signal.addEventListener('abort', () => source.cancel(), { once: true });
  return source.token;
}

export function deactivate(): void {
  abortController?.abort();
}
