import type { AccountMember, User } from "@/api/types";

export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

export const getSubdomain = (): string | null => {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (host.includes("localhost")) {
        return parts.length > 1 ? parts[0] : null;
    }
    return parts.length > 2 ? parts[0] : null;
};

export const getUserRoleInAccount = (
    userId: User["id"],
    members: AccountMember[]
) => members.find((member) => member.user.id === userId)!.role;

export const formatRussianDateTime = (isoString?: string): string => {
    if (!isoString) return "—";

    const date = new Date(isoString);

    // Форматируем дату: ДД.ММ.ГГГГ ЧЧ:ММ
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};
