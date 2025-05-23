export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

export const getSubdomain = (): string | null => {
    const host = window.location.hostname; // e.g., account1.example.com
    const parts = host.split('.');

    // Поддержка localhost (например: account1.localhost)
    if (host.includes('localhost')) {
        return parts.length > 1 ? parts[0] : null;
    }

    // Настоящие домены
    return parts.length > 2 ? parts[0] : null;
};