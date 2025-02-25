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
    album_image_url: string;
    artist: string;
    play_count: number;
    total_ms_played: number;
    index: number;
    track_name: string;
    percentage_of_max: number | null;
}