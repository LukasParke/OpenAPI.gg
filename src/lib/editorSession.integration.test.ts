import { describe, expect, it } from 'vitest';
import { createNewSpec } from './db';
import { EditorHistory } from './editorSession';

describe('editor history', () => {
	it('coalesces rapid edits and supports undo and redo', () => {
		const history = new EditorHistory();
		const spec = createNewSpec();
		history.reset(spec);

		spec.spec.info.title = 'P';
		history.observe(spec, 1_000);
		spec.spec.info.title = 'Pets';
		history.observe(spec, 1_200);

		expect(history.undo()?.spec.info.title).toBe('');
		expect(history.redo()?.spec.info.title).toBe('Pets');
	});

	it('resets history when a different saved specification is loaded', () => {
		const history = new EditorHistory();
		const first = { ...createNewSpec(), id: '1' };
		const second = { ...createNewSpec(), id: '2' };
		history.reset(first);
		first.spec.info.title = 'Changed';
		history.observe(first, 1_000);

		expect(history.canUndo).toBe(true);
		history.observe(second, 2_000);
		expect(history.canUndo).toBe(false);
	});
});
