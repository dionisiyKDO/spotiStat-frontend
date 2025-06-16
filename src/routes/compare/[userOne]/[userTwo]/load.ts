export interface Stats {
    calculated_at: string;
    end_reasons: EndReason[];
    listening_by_date: ListeningByDate[];
    listening_by_hour: ListeningByHour[];
    listening_by_month: ListeningByMonth[];
    listening_by_weekday: ListeningByWeekday[];
    listening_by_year: ListeningByYear[];
    longest_session: LongestSession;
    most_skipped_tracks: MostSkippedTrack[];
    platform_stats: PlatformStat[];
    skip_stats: SkipStats;
    top_artists: TopArtist[];
    top_tracks: TopTrack[];
    total_listening_time: TotalListeningTime;
    unique_tracks_count: UniqueTracksCount;
    username: string;
}

export interface EndReason {
    count: number;
    reason_end: string;
}

export interface ListeningByDate {
    date: string;
    play_count: number;
    total_ms_played: number;
}

export interface ListeningByHour {
    hour: number;
    play_count: number;
    total_ms_played: number;
}

export interface ListeningByMonth {
    month: number;
    play_count: number;
    total_ms_played: number;
    year: number;
}

export interface ListeningByWeekday {
    play_count: number;
    total_ms_played: number;
    weekday: string;
}

export interface ListeningByYear {
    play_count: number;
    total_ms_played: number;
    year: number;
}

export interface LongestSession {
    session_end: string;
    session_start: string;
    total_ms_played: number;
    total_tracks: number;
    tracks: Track[];
}

export interface Track {
    ms_played: number;
    timestamp: string;
    track_artist: string;
    track_name: string;
    track_uri: string;
}

export interface MostSkippedTrack {
    artist: string;
    skip_count: number;
    spotify_track_uri: string;
    track_name: string;
}

export interface PlatformStat {
    platform: string;
    play_count: number;
    total_ms_played: number;
}

export interface SkipStats {
    skip_percentage: number;
    skip_rate: number;
    skipped_tracks: number;
    total_plays: number;
}

export interface TopArtist {
    artist: string;
    play_count: number;
    total_hours: number;
    total_ms_played: number;
    distinct_track_count: number;
}

export interface TopTrack {
    artist: string;
    play_count: number;
    spotify_track_uri: string;
    total_ms_played: number;
    total_hours: number;
    track_name: string;
}

export interface TotalListeningTime {
    total_listening_days: number;
    total_listening_hours: number;
    total_listening_minutes: number;
    total_listening_ms: number;
}

export interface UniqueTracksCount {
    unique_tracks_count: number;
}

export async function fetchAllStats(username: string): Promise<Stats | null> {
    try {
        const response = await fetch(`/api/db/stats/${username}/all`);
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch stats";
            console.log(error);
            return null;
        }

        const data: Stats = await response.json();
        return data;
    } catch (err) {
        console.error("Network or parsing error in fetchAllStats():", err);
        return null;
    }
}

export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
