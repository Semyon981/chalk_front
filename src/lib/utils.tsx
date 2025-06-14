export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

export const getSubdomain = (): string | null => {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (host.includes('localhost')) {
        return parts.length > 1 ? parts[0] : null;
    }
    return parts.length > 2 ? parts[0] : null;
};