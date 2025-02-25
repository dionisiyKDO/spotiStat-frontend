import type { UserInfo, Track } from "$lib/types";

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

export async function fetchTracks(
    limit: number,
    sortby: string
): Promise<Track[] | null> {
    try {
        const response = await fetch(
            `/api/db/history/top-tracks?limit=${limit}&sort_by=${sortby}`
        );
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch top tracks";
            console.log(error);
            return null;
        }
        const data = (await response.json()) as Track[];
        
        // Find the maximum total_ms_played
        const max = Math.max(...(data.map((track) => track[sortby])  )) ;

        // Add percentage key to each track
        const tracksWithPercentage = data.map((track) => ({
            ...track, // Spread the existing properties
            percentage_of_max: (track[sortby] / max) * 100,
        }));

        return tracksWithPercentage;
    } catch (err) {
        console.log(err);
        return null;
    }
}