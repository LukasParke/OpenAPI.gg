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
	return filename || fallback;
};
