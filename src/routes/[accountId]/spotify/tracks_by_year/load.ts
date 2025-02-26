import type { TrackByYear, SavedTrack } from "$lib/types";

export async function fetchTracksByYear(): Promise<TrackByYear[] | null> {
    try {
        const response = await fetch("/api/spotify/tracks_by_year");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch tracks by year";
            console.log(error);
            return null;
        }

        const data = await response.json();
        const tracksByYear = data.tracks_by_year.map((track) => {
            track.release_date = new Date(track.release_date); // Update the release_date
            return track; // Return the full track object
        }) as TrackByYear[];

        tracksByYear.sort(function (a, b) {
            return +a.release_date - +b.release_date;
        }); // sort by release date

        return tracksByYear;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function fetchSavedTracks(year: number): Promise<SavedTrack[] | null> {
    try {
        const response = await fetch(
            `/api/spotify/saved_tracks/filter?year=${year}`
        );

        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch saved tracks";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as {
            results: SavedTrack[];
        };
        return data.results;
    } catch (err) {
        console.log(err);
        return null;
    }
}