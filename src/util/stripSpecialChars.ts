export const stripSpecialChars = (str: string): string => {
    let sanitized = str.replace(/\s/g, '_');
    sanitized = sanitized.replace(/[\\/(),.~!@#$%^&*+?'"]/g, '');

    return sanitized;
};