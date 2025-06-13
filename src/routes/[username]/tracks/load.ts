import { tick } from "svelte";

export interface TrackStats {
    avg_playtime_per_play: number;
    distinct_days_played: number;
    first_played: string;
    last_played: string;
    most_frequent_play_count: number;
    most_frequent_play_hour: number;
    timeline_data: TimelineData[];
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
    total_minutes_played?: number;
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
    username,
    limit_count: number = 5,
    limit_play: number = 1000
): Promise<Tracks[] | null> {
    try {
        const response = await fetch(
            `/api/db/history/played-tracks?username=${username}&limit_count=${limit_count}&limit_play=${limit_play}&group_by=artist,track`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as { played_tracks: Tracks[] };
        return data.played_tracks;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchTrackStats(
    username,
    track_id: string
): Promise<TrackStats | null> {
    try {
        const response = await fetch(`/api/db/history/track/${track_id}/stats?username=${username}`);

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch track stats";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as TrackStats;
        data.timeline_data = fillMissingDates(data);
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

// TODO: fix spotify api call
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





















/**
 * Fills in missing dates in timeline data with zero values.
 * 
 * @param data - Artist stats containing timeline data
 * @param useGapSkipping - Whether to skip large gaps (default: false for cleaner graphs)
 * @param gapThresholdDays - Maximum gap in days before skipping zero-fill (default: 30)
 * @returns Array of timeline data with missing dates filled
 */
// TODO: go line by line and understand the logic
function fillMissingDates(
    data: ArtistStats,
    useGapSkipping: boolean = false,
    gapThresholdDays: number = 30
): TimelineData[] {
    // Input validation
    if (!data?.timeline_data?.length || !data.first_played || !data.last_played) {
        return [];
    }

    // Sort existing data by date to ensure proper ordering
    const sortedData = [...data.timeline_data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Create a map for O(1) lookups of existing data
    const dataMap = new Map<string, typeof sortedData[0]>();
    sortedData.forEach(item => {
        const dateKey = formatDateKey(item.date);
        dataMap.set(dateKey, item);
    });

    if (!useGapSkipping) {
        // Simple approach: fill all dates between first and last play
        return fillAllDates(data, dataMap);
    }

    // Complex approach with gap skipping + zero padding to prevent ugly lines
    return fillWithGapSkipping(data, sortedData, dataMap, gapThresholdDays);
}

/**
 * Simple approach: Fill all dates between first and last play with zeros where needed
 */
function fillAllDates(data: ArtistStats, dataMap: Map<string, any>): TimelineData[] {
    const result: TimelineData[] = [];
    const startDate = new Date(data.first_played);
    const endDate = new Date(data.last_played);
    
    // Ensure we don't go beyond today
    const today = new Date();
    const actualEndDate = endDate > today ? today : endDate;

    let currentDate = new Date(startDate);

    while (currentDate <= actualEndDate) {
        const currentDateKey = formatDateKey(currentDate);
        const existingData = dataMap.get(currentDateKey);

        if (existingData) {
            result.push(createTimelineEntry(existingData));
        } else {
            result.push(createEmptyTimelineEntry(currentDate));
        }

        currentDate = addDays(currentDate, 1);
    }

    return result;
}

/**
 * Complex approach: Skip long gaps but add zero padding to prevent ugly connecting lines
 */
function fillWithGapSkipping(
    data: ArtistStats, 
    sortedData: any[], 
    dataMap: Map<string, any>, 
    gapThresholdDays: number
): TimelineData[] {
    const result: TimelineData[] = [];
    const startDate = new Date(data.first_played);
    const endDate = new Date(data.last_played);
    
    const today = new Date();
    const actualEndDate = endDate > today ? today : endDate;

    let currentDate = new Date(startDate);
    let dataIndex = 0;

    while (currentDate <= actualEndDate) {
        const currentDateKey = formatDateKey(currentDate);
        const existingData = dataMap.get(currentDateKey);

        if (existingData) {
            // We have data for this date
            result.push(createTimelineEntry(existingData));
            currentDate = addDays(currentDate, 1);
            dataIndex++;
        } else {
            // No data for this date - check if we should fill the gap
            const nextDataDate = findNextDataDate(sortedData, currentDate, dataIndex);
            
            if (nextDataDate) {
                const gapDays = getDaysDifference(currentDate, nextDataDate);
                
                if (gapDays <= gapThresholdDays) {
                    // Gap is small enough - fill with zeros
                    result.push(createEmptyTimelineEntry(currentDate));
                    currentDate = addDays(currentDate, 1);
                } else {
                    // Gap is too large - skip but add zero padding to prevent ugly lines
                    
                    // Add a zero value for the current date (end of previous activity period)
                    result.push(createEmptyTimelineEntry(currentDate));
                    
                    // Skip to day before next activity and add another zero
                    const dayBeforeNext = addDays(nextDataDate, -1);
                    if (getDaysDifference(currentDate, dayBeforeNext) > 1) {
                        result.push(createEmptyTimelineEntry(dayBeforeNext));
                    }
                    
                    // Move to the next data point
                    currentDate = new Date(nextDataDate);
                    dataIndex = findDataIndex(sortedData, currentDate);
                }
            } else {
                // No more data points - we're done
                break;
            }
        }
    }

    return result;
}

/**
 * Helper function to format date as YYYY-MM-DD string
 */
function formatDateKey(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
}

/**
 * Helper function to add days to a date without mutating the original
 */
function addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

/**
 * Helper function to calculate difference in days between two dates
 */
function getDaysDifference(date1: Date, date2: Date): number {
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Find the next date in the data that comes after the current date
 */
function findNextDataDate(sortedData: any[], currentDate: Date, startIndex: number): Date | null {
    for (let i = startIndex; i < sortedData.length; i++) {
        const dataDate = new Date(sortedData[i].date);
        if (dataDate > currentDate) {
            return dataDate;
        }
    }
    return null;
}

/**
 * Find the index of data that matches or comes after the given date
 */
function findDataIndex(sortedData: any[], targetDate: Date): number {
    for (let i = 0; i < sortedData.length; i++) {
        const dataDate = new Date(sortedData[i].date);
        if (dataDate >= targetDate) {
            return i;
        }
    }
    return sortedData.length;
}

/**
 * Create a timeline entry from existing data
 */
function createTimelineEntry(existingData: any): TimelineData {
    return {
        date: new Date(existingData.date),
        total_minutes_played: Math.round(existingData.total_ms_played / 60000),
        total_ms_played: existingData.total_ms_played,
        play_count: existingData.play_count || 0,
    };
}

/**
 * Create an empty timeline entry for dates with no data
 */
function createEmptyTimelineEntry(date: Date): TimelineData {
    return {
        date: new Date(date),
        total_minutes_played: 0,
        total_ms_played: 0,
        play_count: 0,
    };
}