export interface TopArtist {
    artist: string;
    play_count: number;
    total_hours: number;
    total_ms_played: number;
}

export interface TimelineData {
  date: string | Date
  play_count: number
  total_ms_played: number
  total_minutes_played?: number
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
        const response = await fetch(`/api/db/history/${username}/artist/${artist}/stats`);

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



function fillMissingDates(data: ArtistStats): TimelineData[] {
    if (!data?.timeline_data?.length || !data.first_played || !data.last_played) {
        return [];
    }

    // Create a map of existing data for O(1) lookups
    const dataMap = new Map<string, TimelineData>();
    data.timeline_data.forEach(item => {
        const dateKey = new Date(item.date).toISOString().split('T')[0];
        dataMap.set(dateKey, item);
    });

    const result: TimelineData[] = [];
    const startDate = new Date(data.first_played);
    const endDate = new Date(Math.min(new Date(data.last_played).getTime(), Date.now()));
    
    // Fill all dates between start and end
    for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
        const dateKey = current.toISOString().split('T')[0];
        const existingData = dataMap.get(dateKey);
        
        if (existingData) {
            result.push({
                date: new Date(current),
                total_minutes_played: Math.round(existingData.total_ms_played / 60000),
                total_ms_played: existingData.total_ms_played,
                play_count: existingData.play_count || 0
            });
        } else {
            result.push({
                date: new Date(current),
                total_minutes_played: 0,
                total_ms_played: 0,
                play_count: 0
            });
        }
    }

    return result;
}