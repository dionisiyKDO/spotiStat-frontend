import type { UserInfo } from "$lib/types";

export async function checkLoginStatus() {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    return data;
}

export async function fetchUserInfo(): Promise<UserInfo | null> {
    try {
        const response = await fetch("/api/spotify/profile");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch user info";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as { user_info: UserInfo };
        return data.user_info;
    } catch (err) {
        console.log(err);
        return null;
    }
}