import { tick } from "svelte";

export interface TrackStats {
    avg_playtime_per_play: number;
    distinct_days_played: number;
    first_played: string;
    last_played: string;
    most_frequent_play_count: number;
    most_frequent_play_hour: number;
    timeline_data: TimelineData[];
    total_days_played: number;
    total_ms_played: number;
    total_plays: number;
    track_id: string;
}

export interface TrackMeta {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}

export interface Tracks {
    artist: string;
    play_count: number;
    spotify_track_uri: string;
    total_ms_played: number;
    track_name: string;
}

interface TimelineData {
    date: string | Date;
    play_count: number;
    total_ms_played: number;
}

interface Album {
    album_type: string;
    artists: Artist[];
    available_markets: string[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

interface Artist {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

interface ExternalUrls {
    spotify: string;
}

interface Image {
    height: number;
    url: string;
    width: number;
}

interface ExternalIds {
    isrc: string;
}

export async function fetchTracks(
    limit_count: number = 10,
    limit_play: number = 1000
): Promise<Tracks[] | null> {
    try {
        const response = await fetch(
            `/api/db/history/played-tracks?limit_count=${limit_count}&limit_play=${limit_play}&group_by=artist,track`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks";
            console.log(error);
            return null;
        }

        // await new Promise(r => setTimeout(r, 1000));

        const data = (await response.json()) as { played_tracks: Tracks[] };
        return data.played_tracks;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchTrackStats(
    track_id: string
): Promise<TrackStats | null> {
    try {
        const response = await fetch(`/api/db/history/track/${track_id}/stats`);

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch track stats";
            console.log(error);
            return null;
        }

        // await new Promise(r => setTimeout(r, 3000));

        const data = (await response.json()) as TrackStats;
        data.timeline_data = fillMissingDates(data);
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchTrackMeta(
    track_id: string
): Promise<TrackMeta | null> {
    try {
        const response = await fetch(
            `/api/spotify/track_meta?track_id=${track_id}`
        );
        const data = await response.json();
        if (!response.ok) {
            const err = await response.json();
            console.log(err);
            return null;
        }
        // await new Promise(r => setTimeout(r, 2000));

        return data.track_meta as TrackMeta;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function fillMissingDates(data: TrackStats): TimelineData[] {
    // Get all unique dates from existing data (optional)
    // const existingDates = new Set(data.timeline_data.map(item => item.date));

    // Create a range of dates from first_played to last_played (inclusive)
    const startDate = new Date(data.first_played);
    const endDate = new Date(data.last_played);

    const allDates: string[] = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        allDates.push(currentDate.toISOString().split("T")[0]); // Extract date part (dd-mm-yyyy)
        currentDate.setDate(currentDate.getDate() + 1); // Increment date by 1 day, move to next day
    }

    // Map existing data and format, fill in missing dates with formatted data
    return allDates.map((date) => {
        const existingItem = data.timeline_data.find(
            (item) => item.date === date
        );

        if (!existingItem) {
            return {
                // If no existing item, create new object with date and zero values, format date
                date: new Date(date),
                total_minutes_played: 0,
                total_ms_played: 0,
                play_count: 0,
            };
        }

        return {
            // If existing item exists, use existing data and format existing properties
            date: new Date(existingItem.date),
            total_minutes_played: parseInt(
                (existingItem.total_ms_played / 60000).toFixed(2)
            ),
            total_ms_played: existingItem.total_ms_played,
            play_count: existingItem.play_count,
        };
    });
}
