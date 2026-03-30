import * as vscode from 'vscode';
import { CopilotEdit, parseCopilotResponse } from './models';

const SYSTEM_PROMPT = `
You are an expert AI programmer making surgical edits to a file in VS Code.
Your task is to fix ONLY what the user asks. Do not rewrite, reformat, or touch any other lines.

Respond with a JSON array of edit objects. Each object must have:
{
  "type": <"replace" | "insert">,
  "startLine": <1-based line number>,
  "endLine": <1-based line number for "replace", inclusive>,
  "newCode": "<replacement or inserted code>"
}

Critical rules:
- Return an ARRAY [], even if there is only one edit.
- Each logical change (e.g., adding a JSDoc block, fixing one function, inserting one class) MUST be a separate edit object in the array.
- NEVER combine multiple functions or unrelated changes into a single edit object.
- Be EXTREMELY precise with line numbers. Do not include surrounding structural braces (like from a parent object or class) unless you are refactoring the entire parent.
- For "replace", the range should cover the EXACT lines of the code block you want to remove.
- For "insert", \`startLine\` is the line to insert before. \`endLine\` is ignored.
- Never include unchanged lines in \`newCode\`.
- Only output the raw JSON array. No explanations, no markdown fences.
- The \`newCode\` should be properly indented according to the surrounding code.
`;

export { CopilotEdit, parseCopilotResponse };

export async function getCopilotEdit(prompt: string, document: vscode.TextDocument, token: vscode.CancellationToken): Promise<CopilotEdit> {
  if (!vscode.lm) {
    throw new Error('Copilot API not available. Please check your VS Code version and Copilot installation.');
  }

  const fullPrompt = `
Here is the file content:
\`\`\`${document.languageId}
${document.getText()}
\`\`\`

Here is the user's request:
${prompt}
`;

  const messages = [
    new vscode.LanguageModelChatMessage((vscode.LanguageModelChatMessageRole as any).System || vscode.LanguageModelChatMessageRole.User, SYSTEM_PROMPT),
    new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, fullPrompt),
  ];

  const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
  if (!models || models.length === 0) {
    throw new Error('Could not find a suitable Copilot model. Please ensure GitHub Copilot is installed, enabled, and you are signed in.');
  }
  const model = models[0];

  const response = await model.sendRequest(messages, {}, token);

  let jsonResponse = '';
  for await (const chunk of response.stream) {
    if (typeof chunk === 'object' && chunk !== null && 'value' in chunk && typeof (chunk as any).value === 'string') {
      jsonResponse += (chunk as any).value;
    }
  }

  return parseCopilotResponse(jsonResponse);
}
