export interface ArtistStats {
    artist_name: string;
    avg_playtime_per_play: number;
    distinct_days_played: number;
    first_played: string;
    last_played: string;
    timeline_data: TimelineData[];
    total_plays: number | null;
    total_ms_played: number | null;
}

interface TimelineData {
    date: string | Date;
    play_count: number;
    total_ms_played: number;
    total_minutes_played: number;
}

export interface Track {
    album_image_url: string;
    artist: string;
    play_count: number;
    total_ms_played: number;
    index: number;
    track_name: string;
    percentage_of_max: number;
    spotify_track_uri: string;
}

export async function fetchTracks(
    username,
    limit_count: number = 10,
    limit_play: number = 1000
): Promise<Track[] | null> {
    try {
        const response = await fetch(
            `/api/db/history/played-tracks?username=${username}&limit_count=${limit_count}&limit_play=${limit_play}&group_by=artist`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as { played_tracks: Track[] };
        return data.played_tracks;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchArtistStats(
    username,
    artist: string
): Promise<ArtistStats | null> {
    try {
        const response = await fetch(`/api/db/history/artist/${artist}/stats?username=${username}`);

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch artist stats";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as ArtistStats;
        data.timeline_data = fillMissingDates(data);
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchPlayedTracks(
    username,
    limit: number,
    date: string,
    artist: string
): Promise<Track[] | null> {
    try {
        const sortby = "total_ms_played";
        const response = await fetch(
            `/api/db/history/top-tracks?username=${username}limit=${limit}&date=${date}&artist=${artist}&sort_by=${sortby}`
        );
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch top tracks";
            console.log(error);
            return null;
        }
        const data = (await response.json()) as {
            tracks: Track[];
        };

        // Find the maximum total_ms_played
        const max = Math.max(...data.map((track: Track) => track[sortby]));

        // Add percentage key to each track
        const tracksWithPercentage = data.map((track: Track) => ({
            ...track, // Spread the existing properties
            percentage_of_max: (track[sortby] / max) * 100,
        }));

        return tracksWithPercentage;
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