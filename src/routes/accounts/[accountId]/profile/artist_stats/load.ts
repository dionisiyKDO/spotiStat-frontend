export interface ArtistStats {
    artist_name: string;
    avg_playtime_per_play: number;
    distinct_days_played: number;
    first_played: string;
    last_played: string;
    timeline_data: TimelineData[];
}

interface TimelineData {
    date: string | Date;
    play_count: number;
    total_ms_played: number;
}

export interface Tracks {
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
    limit_count: number = 10,
    limit_play: number = 1000
): Promise<Tracks[] | null> {
    try {
        const response = await fetch(
            `/api/db/history/played-tracks?limit_count=${limit_count}&limit_play=${limit_play}&group_by=artist`
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

export async function fetchArtistStats(
    artist: string
): Promise<ArtistStats | null> {
    try {
        const response = await fetch(`/api/db/history/artist/${artist}/stats`);
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
    limit: number,
    date: string,
    artist: string
): Promise<Tracks[] | null> {
    try {
        const sortby = "total_ms_played";
        const response = await fetch(
            `/api/db/history/top-tracks?limit=${limit}&date=${date}&artist=${artist}&sort_by=${sortby}`
        );
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch top tracks";
            console.log(error);
            return null;
        }
        const data = (await response.json()) as {
            tracks: Tracks[];
        };

        // Find the maximum total_ms_played
        const max = Math.max(...data.map((track) => track[sortby]));

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

// Fill missing dates with zero values, skipping dates that are too far apart(?)
// TODO: go line by line and understand the logic
function fillMissingDates(
    data: ArtistStats,
    gapThresholdDays: number = 30
): TimelineData[] {
    const startDate = new Date(data.first_played);
    const endDate = new Date(data.last_played);

    const allDates: string[] = [];
    let currentDate = startDate;

    // Add the first played date to start with
    let lastActivityDate = new Date(data.first_played);

    while (currentDate <= endDate) {
        // Find the closest existing play date before currentDate
        const nextPlayedDate = data.timeline_data
            .filter((item) => new Date(item.date) >= currentDate)
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];

        const gap = nextPlayedDate
            ? (new Date(nextPlayedDate.date).getTime() -
                  currentDate.getTime()) /
              (1000 * 3600 * 24)
            : Infinity;

        // If the gap is larger than the threshold, skip adding zeros for that range
        if (gap > gapThresholdDays) {
            // Move currentDate to the date of the next activity
            currentDate = new Date(nextPlayedDate.date);
            allDates.push(currentDate.toISOString().split("T")[0]); // Log the active date only
            currentDate.setDate(currentDate.getDate() + 1);
        } else {
            // Normal behavior: add date and move forward one day
            allDates.push(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return allDates.map((date) => {
        const existingItem = data.timeline_data.find(
            (item) => item.date === date
        );

        if (!existingItem) {
            return {
                date: new Date(date),
                total_minutes_played: 0,
                total_ms_played: 0,
                play_count: 0,
            };
        }

        return {
            date: new Date(existingItem.date),
            total_minutes_played: parseInt(
                (existingItem.total_ms_played / 60000).toFixed(2)
            ),
            total_ms_played: existingItem.total_ms_played,
            play_count: existingItem.play_count,
        };
    });
}

// Fill missing dates with zero values, no skipping
// function fillMissingDates(data: ArtistStats): TimelineData[] {
//     // Get all unique dates from existing data (optional)
//     // const existingDates = new Set(data.timeline_data.map(item => item.date));

//     // Create a range of dates from first_played to last_played (inclusive)
//     const startDate = new Date(data.first_played);
//     const endDate = new Date(data.last_played);

//     const allDates: string[] = [];
//     let currentDate = startDate;
//     while (currentDate <= endDate) {
//         allDates.push(currentDate.toISOString().split("T")[0]); // Extract date part (dd-mm-yyyy)
//         currentDate.setDate(currentDate.getDate() + 1); // Increment date by 1 day, move to next day
//     }

//     // Map existing data and format, fill in missing dates with formatted data
//     return allDates.map((date) => {
//         const existingItem = data.timeline_data.find(
//             (item) => item.date === date
//         );

//         if (!existingItem) {
//             return {
//                 // If no existing item, create new object with date and zero values, format date
//                 date: new Date(date),
//                 total_minutes_played: 0,
//                 total_ms_played: 0,
//                 play_count: 0,
//             };
//         }

//         return {
//             // If existing item exists, use existing data and format existing properties
//             date: new Date(existingItem.date),
//             total_minutes_played: parseInt(
//                 (existingItem.total_ms_played / 60000).toFixed(2)
//             ),
//             total_ms_played: existingItem.total_ms_played,
//             play_count: existingItem.play_count,
//         };
//     });
// }
