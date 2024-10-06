export interface UserInfo {
    display_name: string;
    email: string;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    type: string;
    uri: string;
}

interface ExternalUrls {
    spotify: string;
}

interface Followers {
    href: any;
    total: number;
}

interface Image {
    height: number;
    url: string;
    width: number;
}

interface Response {
    message: string;
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
        
        const data = await response.json() as { user_info: UserInfo };
        return data.user_info;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchCheckHistory(
    accountId: string
): Promise<Response | null> {
    try {
        const response = await fetch(
            `/api/db/check_history?account_id=${accountId}`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch user info";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as Response;
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}