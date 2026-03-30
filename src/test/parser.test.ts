import * as assert from 'assert';
import { parseCopilotResponse } from '../providers/models';

describe('Copilot Response Parser', () => {
    it('should parse a simple valid JSON array', () => {
        const raw = '[{"type": "replace", "startLine": 1, "endLine": 1, "newCode": "hello"}]';
        const result = parseCopilotResponse(raw);
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].newCode, 'hello');
    });

    it('should handle markdown fences around JSON', () => {
        const raw = 'Here is your JSON:\n```json\n[{"type": "insert", "startLine": 10, "endLine": 9, "newCode": "const x = 1;"}]\n```';
        const result = parseCopilotResponse(raw);
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].startLine, 10);
    });

    it('should throw error on invalid schema', () => {
        const raw = '[{"invalid": "schema"}]';
        assert.throws(() => parseCopilotResponse(raw), /invalid schema/);
    });

    it('should parse a complex multi-edit response', () => {
        const raw = `
        [
            {"type": "insert", "startLine": 1, "endLine": 0, "newCode": "// Header\\n"},
            {"type": "replace", "startLine": 10, "endLine": 15, "newCode": "function updated() {\\n  return true;\\n}"}
        ]`;
        const result = parseCopilotResponse(raw);
        assert.strictEqual(result.length, 2);
        assert.strictEqual(result[0].type, 'insert');
        assert.strictEqual(result[1].type, 'replace');
        assert.strictEqual(result[1].startLine, 10);
    });
});
