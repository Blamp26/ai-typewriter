export type CopilotEdit = {
  type: 'replace' | 'insert';
  startLine: number;
  endLine: number;
  newCode: string;
}[];

/**
 * Extracted parser logic for testing.
 * Cleans the string and returns a typed CopilotEdit array.
 */
export function parseCopilotResponse(rawText: string): CopilotEdit {
  try {
    const jsonStartIndex = rawText.indexOf('[');
    const jsonEndIndex = rawText.lastIndexOf(']');
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      throw new Error('Invalid JSON response from Copilot. Expected an array.');
    }
    const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error('Parsed response is not an array.');
    }

    // Basic validation of the schema
    for (const item of parsed) {
      if (typeof item.startLine !== 'number' || typeof item.newCode !== 'string' || !item.type) {
        throw new Error('One or more edit objects have an invalid schema.');
      }
    }

    return parsed as CopilotEdit;
  } catch (err) {
    // Note: We don't use console.error here to keep it pure for tests if needed, 
    // or we can just let the caller handle the error.
    throw new Error(`Failed to parse the edit instruction: ${err instanceof Error ? err.message : String(err)}`);
  }
}
