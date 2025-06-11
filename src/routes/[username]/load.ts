export interface TotalListeningTime {
    total_listening_days: number;
    total_listening_hours: number;
    total_listening_minutes: number;
    total_listening_ms: number;
}

export async function fetchTotalListeningTime(username: string): Promise<TotalListeningTime | null> {
    try {
        const response = await fetch(`/api/db/history/total-listening-time?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch total listening time";
            console.log(error);
            return null;
        }

        const data: TotalListeningTime = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchTotalListeningTime():", err);
        return null;
    }
}

export interface PlatformStats {
    platform: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchPlatformStats(username: string): Promise<PlatformStats[] | null> {
    try {
        const response = await fetch(`/api/db/history/platform-stats?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch platform stats";
            console.log(error);
            return null;
        }

        const data: PlatformStats[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchPlatformStats():", err);
        return null;
    }
}

export interface SkippedTrack {
    index: number;
    track_name: string;
    artist: string;
    skip_count: number;
}

export async function fetchMostSkippedTracks(username: string, limit: number = 10): Promise<SkippedTrack[] | null> {
    try {
        const response = await fetch(`/api/db/history/most-skipped-tracks?username=${username}&limit=${limit}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch most skipped tracks";
            console.log(error);
            return null;
        }

        const data: SkippedTrack[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchMostSkippedTracks():", err);
        return null;
    }
}

export interface SkipStats {
    total_plays: number;
    skipped_tracks: number;
    skip_rate: number;
    skip_percentage: number;
}

export async function fetchSkipStats(username: string): Promise<SkipStats | null> {
    try {
        const response = await fetch(`/api/db/history/skip-stats?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch skip stats";
            console.log(error);
            return null;
        }

        const data: SkipStats = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchSkipStats():", err);
        return null;
    }
}

export interface EndReason {
    reason_end: string;
    count: number;
}

export async function fetchEndReasons(username: string): Promise<EndReason[] | null> {
    try {
        const response = await fetch(`/api/db/history/end-reasons?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch end reasons";
            console.log(error);
            return null;
        }

        const data: EndReason[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchEndReasons():", err);
        return null;
    }
}

export interface UniqueTracksCount {
    unique_tracks_count: number;
}

export async function fetchUniqueTracksCount(username: string): Promise<UniqueTracksCount | null> {
    try {
        const response = await fetch(`/api/db/history/unique-tracks-count?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch unique tracks count";
            console.log(error);
            return null;
        }

        const data: UniqueTracksCount = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchUniqueTracksCount():", err);
        return null;
    }
}

// TODO: In theory it could be interesting to show what tracks were played in longest session, so yeah, think where to show it
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

export async function fetchLongestListeningSession(username: string, gap: number = 30): Promise<ListeningSession | null> {
    try {
        const response = await fetch(`/api/db/history/sessions/longest?username=${username}&gap=${gap}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch listening sessions";
            console.log(error);
            return null;
        }

        const data: ListeningSession = await response.json();
        data.session_start = new Date(data.session_start).toLocaleString('uk');
        data.session_end = new Date(data.session_end).toLocaleString('uk');
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchLongestListeningSession():", err);
        return null;
    }
}

export interface HourTrend {
    hour: number;
    play_count: number;
    total_ms_played: number;
}

export async function fetchHourlyTrends(username: string): Promise<HourTrend[] | null> {
    try {
        const response = await fetch(`/api/db/history/hourly-trends?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch hourly trends";
            console.log(error);
            return null;
        }

        const data: HourTrend[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchHourlyTrends():", err);
        return null;
    }
}

export interface WeeklyTrend {
    day_of_week: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchWeeklyTrends(username: string): Promise<WeeklyTrend[] | null> {
    try {
        const response = await fetch(`/api/db/history/weekly-trends?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch weekly trends";
            console.log(error);
            return null;
        }

        const data: WeeklyTrend[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchWeeklyTrends():", err);
        return null;
    }
}

export interface DailyTrend {
    day: string;
    play_count: number;
    total_ms_played: number;
}

export async function fetchDailyTrends(username: string): Promise<DailyTrend[] | null> {
    try {
        const response = await fetch(`/api/db/history/daily-trends?username=${username}`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch daily trends";
            console.log(error);
            return null;
        }

        const data: DailyTrend[] = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchDailyTrends():", err);
        return null;
    }
}
