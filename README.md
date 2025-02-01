# SpotiStat Frontend

Web interface for visualizing Spotify listening statistics using both Spotify API and exported extended streaming history data.

Built with:
- **Svelte 5**: For a reactive and efficient UI.
- **Tailwind CSS**: For styling and responsive design.
- **D3.js**: For creating interactive and dynamic data visualizations.

## Features

- Spotify account integration and authentication
- Real-time stats via Spotify API
- Advanced visualizations of extended streaming history
- Interactive charts and statistics
- Responsive design with Tailwind CSS

## Setup

1. Clone this repository:
```bash
git clone https://github.com/dionisiyKDO/spotiStat-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Requirements

- Node.js 16+
- Spotify account
- Extended streaming history export from Spotify - [Link](https://www.spotify.com/us/account/privacy/)
- Running instance of [SpotiStat backend](https://github.com/dionisiyKDO/spotiStat-backend).
