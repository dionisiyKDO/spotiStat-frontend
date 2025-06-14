import { tick } from "svelte";



export interface TopTrack {
    artist: string;
    play_count: number;
    spotify_track_uri: string;
    total_ms_played: number;
    total_hours: number;
    track_name: string;
}

export interface TrackStats {
  avg_playtime_per_play: number
  distinct_days_played: number
  first_played: string
  last_played: string
  song_length: number
  timeline_data: TimelineData[]
  total_ms_played: number
  total_plays: number
  track_id: string
}

export interface TimelineData {
  date: string | Date
  play_count: number
  total_ms_played: number
  total_minutes_played?: number
}



export async function fetchTracks(username: string): Promise<TopTrack[] | null> {
    try {
        const response = await fetch(
            `/api/db/stats/${username}/listened-tracks`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks";
            console.log(error);
            return null;
        }

        const data: TopTrack[] = await response.json();
        return data;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchTrackStats(username: string, track_id: string): Promise<TrackStats | null> {
    try {
        const response = await fetch(`/api/db/stats/${username}/track/${track_id}/stats`);

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
// export async function fetchTrackMeta(
//     track_id: string
// ): Promise<TrackMeta | null> {
//     try {
//         const response = await fetch(
//             `/api/spotify/track_meta?track_id=${track_id}`
//         );
//         const data = await response.json();
//         if (!response.ok) {
//             const err = await response.json();
//             console.log(err);
//             return null;
//         }

//         return data.track_meta as TrackMeta;
//     } catch (err) {
//         console.log(err);
//         return null;
//     }
// }



function fillMissingDates(data: TrackStats): TimelineData[] {
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