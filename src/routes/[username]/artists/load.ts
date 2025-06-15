export interface TopArtist {
    artist: string;
    play_count: number;
    total_hours: number;
    total_ms_played: number;
}

export interface ArtistStats {
  artist_name: string
  avg_playtime_per_play: number
  distinct_days_played: number
  first_played: string
  last_played: string
  timeline_data: TimelineData[]
  total_ms_played: number
  total_plays: number
}

export interface TimelineData {
  date: string | Date
  play_count: number
  total_ms_played: number
  total_minutes_played?: number
}

export interface ArtistTrack {
  play_count: number
  spotify_track_uri: string
  total_hours: number
  total_ms_played: number
  track_name: string
}



export async function fetchArtists(username: string): Promise<TopArtist[] | null> {
    try {
        const response = await fetch(
            `/api/db/stats/${username}/listened-artists`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks";
            console.log(error);
            return null;
        }

        const data: TopArtist[] = await response.json();
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchArtistStats(username: string, artist: string): Promise<ArtistStats | null> { 
    try {
        const response = await fetch(`/api/db/stats/${username}/artist/${artist}`);

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

export async function fetchPlayedTracks(username: string,artist: string): Promise<ArtistTrack[] | null> {
    try {
        const response = await fetch(`/api/db/stats/${username}/artist/${artist}/listened-tracks`);
        
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch top tracks";
            console.log(error);
            return null;
        }

        const data: ArtistTrack[] = await response.json();
        return data;
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