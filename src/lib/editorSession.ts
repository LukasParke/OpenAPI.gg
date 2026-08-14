import { get, writable } from 'svelte/store';
import { selectedSpec, saveSpec, type APISpec } from './db';

export type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'error';

const MAX_HISTORY = 100;
const COALESCE_WINDOW_MS = 500;
const AUTOSAVE_DELAY_MS = 900;

const snapshot = (spec: APISpec) => structuredClone(spec);
const serialize = (spec: APISpec) => JSON.stringify(spec);
const identity = (spec: APISpec) => spec.id ?? 'new';

export class EditorHistory {
	private current?: APISpec;
	private currentIdentity?: string;
	private undoStack: APISpec[] = [];
	private redoStack: APISpec[] = [];
	private lastChangeAt = 0;

	reset(spec: APISpec) {
		this.current = snapshot(spec);
		this.currentIdentity = identity(spec);
		this.undoStack = [];
		this.redoStack = [];
		this.lastChangeAt = 0;
	}

	observe(spec: APISpec, now = Date.now()) {
		if (!this.current || this.currentIdentity !== identity(spec)) {
			this.reset(spec);
			return false;
		}
		if (serialize(this.current) === serialize(spec)) return false;

		if (now - this.lastChangeAt > COALESCE_WINDOW_MS) {
			this.undoStack.push(this.current);
			if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
		}
		this.current = snapshot(spec);
		this.redoStack = [];
		this.lastChangeAt = now;
		return true;
	}

	undo() {
		if (!this.current || this.undoStack.length === 0) return;
		this.redoStack.push(this.current);
		const previous = this.undoStack.pop();
		if (!previous) return;
		this.current = previous;
		this.lastChangeAt = 0;
		return snapshot(previous);
	}

	redo() {
		if (!this.current || this.redoStack.length === 0) return;
		this.undoStack.push(this.current);
		const next = this.redoStack.pop();
		if (!next) return;
		this.current = next;
		this.lastChangeAt = 0;
		return snapshot(next);
	}

	get canUndo() {
		return this.undoStack.length > 0;
	}

	get canRedo() {
		return this.redoStack.length > 0;
	}
}

const history = new EditorHistory();
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
let autosaveRevision = 0;

export const saveStatus = writable<SaveStatus>('unsaved');
export const canUndo = writable(false);
export const canRedo = writable(false);

const updateHistoryState = () => {
	canUndo.set(history.canUndo);
	canRedo.set(history.canRedo);
};

const scheduleAutosave = (spec: APISpec) => {
	if (!spec.id || typeof window === 'undefined') {
		saveStatus.set('unsaved');
		return;
	}
	clearTimeout(autosaveTimer);
	const revision = ++autosaveRevision;
	saveStatus.set('saving');
	const pending = snapshot(spec);
	autosaveTimer = setTimeout(async () => {
		try {
			await saveSpec(pending);
			if (revision === autosaveRevision) saveStatus.set('saved');
		} catch {
			if (revision === autosaveRevision) saveStatus.set('error');
		}
	}, AUTOSAVE_DELAY_MS);
};

export const syncEditorSession = (spec: APISpec) => {
	const changed = history.observe(spec);
	updateHistoryState();
	if (changed) scheduleAutosave(spec);
	else if (!spec.id) saveStatus.set('unsaved');
};

export const notifyDocumentChanged = () => {
	const spec = get(selectedSpec);
	const changed = history.observe(spec);
	updateHistoryState();
	if (changed) scheduleAutosave(spec);
};

export const undoDocument = () => {
	const spec = history.undo();
	if (!spec) return;
	selectedSpec.set(spec);
	updateHistoryState();
	scheduleAutosave(spec);
};

export const redoDocument = () => {
	const spec = history.redo();
	if (!spec) return;
	selectedSpec.set(spec);
	updateHistoryState();
	scheduleAutosave(spec);
};

export const saveDocumentNow = async () => {
	clearTimeout(autosaveTimer);
	const revision = ++autosaveRevision;
	saveStatus.set('saving');
	try {
		const saved = await saveSpec(get(selectedSpec));
		if (saved) {
			selectedSpec.set(saved);
			history.reset(saved);
			updateHistoryState();
		}
		if (revision === autosaveRevision) saveStatus.set('saved');
	} catch {
		if (revision === autosaveRevision) saveStatus.set('error');
	}
};
