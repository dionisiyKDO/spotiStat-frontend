export interface TotalListeningTime {
    total_listening_days: number;
    total_listening_hours: number;
    total_listening_minutes: number;
    total_listening_ms: number;
}

export async function fetchTotalListeningTime(): Promise<TotalListeningTime | null> {
    try {
        const response = await fetch("/api/history/total-listening-time");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch total listening time";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as TotalListeningTime;
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface PlatformStats {
    platform: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats[] | null> {
    try {
        const response = await fetch("/api/history/platform-stats");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch platform stats";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as PlatformStats[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface SkippedTrack {
    track_name: string;
    artist: string;
    skip_count: number;
}

export async function fetchMostSkippedTracks(
    limit: number = 10
): Promise<SkippedTrack[] | null> {
    try {
        const response = await fetch(
            `/api/history/most-skipped-tracks?limit=${limit}`
        );
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch most skipped tracks";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as SkippedTrack[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface SkipStats {
    total_plays: number;
    skipped_tracks: number;
    skip_rate: number;
    skip_percentage: number;
}

export async function fetchSkipStats(): Promise<SkipStats | null> {
    try {
        const response = await fetch("/api/history/skip-stats");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch skip stats";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as SkipStats;
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface EndReason {
    reason_end: string;
    count: number;
}

export async function fetchEndReasons(): Promise<EndReason[] | null> {
    try {
        const response = await fetch("/api/history/end-reasons");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch end reasons";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as EndReason[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface UniqueTracksCount {
    unique_tracks_count: number;
}

export async function fetchUniqueTracksCount(): Promise<UniqueTracksCount | null> {
    try {
        const response = await fetch("/api/history/unique-tracks-count");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch unique tracks count";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as UniqueTracksCount;
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface TrackSession {
    track_name: string;
    track_artist: string;
    track_uri: string;
    timestamp: string;
    ms_played: number;
}

export interface ListeningSession {
    session_start: string;
    session_end: string;
    total_tracks: number;
    total_ms_played: number;
    tracks: TrackSession[];
}

export async function fetchListeningSessions(
    gap: number = 30
): Promise<ListeningSession[] | null> {
    try {
        const response = await fetch(`/api/history/sessions?gap=${gap}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch listening sessions";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as ListeningSession[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface HourlyTrend {
    hour: number;
    play_count: number;
    total_ms_played: number;
}

export async function fetchHourlyTrends(): Promise<HourlyTrend[] | null> {
    try {
        const response = await fetch("/api/history/hourly-trends");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch hourly trends";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as HourlyTrend[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface WeeklyTrend {
    day_of_week: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchWeeklyTrends(): Promise<WeeklyTrend[] | null> {
    try {
        const response = await fetch("/api/history/weekly-trends");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch weekly trends";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as WeeklyTrend[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export interface DailyTrend {
    day: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchDailyTrends(): Promise<DailyTrend[] | null> {
    try {
        const response = await fetch("/api/history/daily-trends");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch daily trends";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as DailyTrend[];
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}
