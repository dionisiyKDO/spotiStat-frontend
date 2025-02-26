import type { Track, SavedTrack } from "./types";

export const mockSavedTracks: SavedTrack[] = [
    {
        added_at: null,
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273e59bdb7ca29ddfcb23ec4bf6",
        artist: "Lotus Juice",
        duration_ms: 227240,
        name: "Color Your Night",
        played_at: null,
        popularity: 67,
        release_date: "2024-04-24",
        spotify_url: "https://open.spotify.com/album/20Bf2RVERC5Bc2eo3vyvJv",
    },
    {
        added_at: null,
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b2733816caccf98c339e59b0e7b6",
        artist: "\u585e\u58ec\u5531\u7247-MSR",
        duration_ms: 240890,
        name: "Arsonist",
        played_at: null,
        popularity: 39,
        release_date: "2024-05-01",
        spotify_url: "https://open.spotify.com/album/4Bvez6KwrNGTtHBJCKAlGd",
    },
    {
        added_at: null,
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273fb92d42b359379cc0c1a3486",
        artist: "\u585e\u58ec\u5531\u7247-MSR",
        duration_ms: 117321,
        name: "Storyteller",
        played_at: null,
        popularity: 33,
        release_date: "2024-04-26",
        spotify_url: "https://open.spotify.com/album/7MKvZyMLLSBd4Mzp7iA5BE",
    },
    {
        added_at: null,
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b2734ccf88b66e04cfd247f287eb",
        artist: "Dasha",
        duration_ms: 171782,
        name: "Austin (Boots Stop Workin')",
        played_at: null,
        popularity: 89,
        release_date: "2024-02-16",
        spotify_url: "https://open.spotify.com/album/40HsqPqeSR9Xe3IyAJWr6e",
    },
    {
        added_at: null,
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273c04a73dbd532ff03273e6059",
        artist: "\u30c8\u30b2\u30ca\u30b7\u30c8\u30b2\u30a2\u30ea",
        duration_ms: 223061,
        name: "Bleeding Hearts",
        played_at: null,
        popularity: 42,
        release_date: "2024-04-24",
        spotify_url: "https://open.spotify.com/album/0tUrac3qBoX2tfsqtUFBfk",
    },
];

export const mockDbTracks: Track[] = [
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273670b2c6851814193d6f22c11",
        artist: "\u585e\u58ec\u5531\u7247-MSR",
        index: 0,
        play_count: 178,
        spotify_url: "https://open.spotify.com/album/1B1qJKZsd3JYOcPjJqnMPc",
        total_ms_played: 35258906,
        track_name: "Battleplan Pyrolysis",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273405821bcbb01d247dd24ec63",
        artist: "Thousand Foot Krutch",
        index: 1,
        play_count: 165,
        spotify_url: "https://open.spotify.com/album/4fSovBNtliN1OY3CXNDS16",
        total_ms_played: 34812423,
        track_name: "War of Change",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b2737158ec602fe6e8165cae6091",
        artist: "K/DA",
        index: 2,
        play_count: 162,
        spotify_url: "https://open.spotify.com/album/7C8nskYbHG7N0LDrNVvt7x",
        total_ms_played: 22659974,
        track_name: "THE BADDEST",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b27332339ec17caf28e2fd13cecf",
        artist: "\u585e\u58ec\u5531\u7247-MSR",
        index: 3,
        play_count: 149,
        spotify_url: "https://open.spotify.com/album/4o469Mz5jMw0vkjm3vHyrX",
        total_ms_played: 32825690,
        track_name: "Speed of Light",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273f5aba3392389512e824d7b2a",
        artist: "K/DA",
        index: 4,
        play_count: 144,
        spotify_url: "https://open.spotify.com/album/23yd1cYlPgl643vE8bb0WD",
        total_ms_played: 28058179,
        track_name: "MORE",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273d557ec1b2bbcc949b8603db1",
        artist: "Against The Current",
        index: 5,
        play_count: 143,
        spotify_url: "https://open.spotify.com/album/3MBuWCEWssM1Yc7JmvuYB7",
        total_ms_played: 25234070,
        track_name: "weapon",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b2731ff35c76300e4978a40360cb",
        artist: "\u585e\u58ec\u5531\u7247-MSR",
        index: 6,
        play_count: 140,
        spotify_url: "https://open.spotify.com/album/3ztW1pVjZEtRFJusUmsN9j",
        total_ms_played: 31239055,
        track_name: "Radiant",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273f81cbb10f6abc4348763cb21",
        artist: "Red",
        index: 7,
        play_count: 135,
        spotify_url: "https://open.spotify.com/album/4sruD6fFajEm7CWetpxQd9",
        total_ms_played: 29306753,
        track_name: "Death of Me",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273eef2f969585ecd89a33564c6",
        artist: "Set It Off",
        index: 8,
        play_count: 135,
        spotify_url: "https://open.spotify.com/album/4mPWTksMsByAvomErPtJwK",
        total_ms_played: 22536034,
        track_name: "Wolf in Sheep's Clothing",
    },
    {
        album_image_url:
            "https://i.scdn.co/image/ab67616d0000b273f2bf9685109a09bdc176fb43",
        artist: "K/DA",
        index: 9,
        play_count: 134,
        spotify_url: "https://open.spotify.com/album/26IdRjba8f8DNa7c0FwfQb",
        total_ms_played: 23586686,
        track_name: "DRUM GO DUM",
    },
];

export const fetchMockDbTracks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(mockDbTracks);
            // reject(new Error("Failed to fetch track list")); // to simulate an error - reject the promise
        }, 1000); // 1 second delay
    });
};

export const fetchMockSavedTracks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(mockDbTracks);
            // reject(new Error("Failed to fetch track list")); // to simulate an error - reject the promise
        }, 1000); // 1 second delay
    });
};
