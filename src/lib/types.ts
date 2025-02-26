export interface UserInfo {
    display_name: string;
    email: string;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: Image[];
    type: string;
    uri: string;
}

interface ExternalUrls {
    spotify: string;
}

interface Followers {
    href: any;
    total: number;
}

interface Image {
    height: number;
    url: string;
    width: number;
}

export interface Track {
    album_image_url: string
    artist: string
    index: number
    play_count: number
    spotify_url: string
    total_ms_played: number
    track_name: string
}

export interface SavedTrack {
    added_at: any;
    album_image_url: string;
    artist: string;
    duration_ms: number;
    name: string;
    played_at: any;
    popularity: number;
    release_date: string;
    spotify_url: string;
}

export interface TrackByYear {
    count: number;
    release_date: Date;
}