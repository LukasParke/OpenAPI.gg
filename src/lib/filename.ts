const WINDOWS_RESERVED_BASE_NAMES = new Set([
	'con',
	'prn',
	'aux',
	'nul',
	...Array.from({ length: 9 }, (unused, index) => `com${index + 1}`),
	...Array.from({ length: 9 }, (unused, index) => `lpt${index + 1}`)
]);

export const safeFilename = (value: string | undefined, fallback = 'openapi') => {
	const withoutControlCharacters = Array.from(value ?? '')
		.filter((character) => {
			const code = character.charCodeAt(0);
			return code >= 32 && code !== 127;
		})
		.join('');
	const filename = withoutControlCharacters
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[<>:"/\\|?*]/g, '-')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^[.\-\s]+|[.\-\s]+$/g, '')
		.slice(0, 120);
	if (!filename) return fallback;
	const [stem] = filename.split('.');
	if (WINDOWS_RESERVED_BASE_NAMES.has(stem.toLowerCase())) return `_${filename}`;
	return filename;
};
