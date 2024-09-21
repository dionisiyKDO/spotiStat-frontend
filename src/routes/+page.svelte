<script>

</script>


<div>
    <h2>Welcome to SpotiStat!</h2>
    <div class="links sp_api_links">
        <h3>Spotify API links</h3>
        <a href="/spotify/recently_played">Recently played</a>
        <a href="/spotify/saved_tracks">Saved tracks</a>
        <a href="/spotify/top/tracks">Top tracks</a>
        <a href="/spotify/top/artists">Top artists</a>
        <a href="/spotify/tracks_by_year">Tracks by year</a>
    </div>
    <div class="links file_api_links"> 
        <h3>From file stats</h3>
        <a href="/user">User</a>
    </div>
</div>


<style>
    .links {
        margin-bottom: 2rem;
    }
    a {
        display: inline-block;

        margin-bottom: 10px;
        padding: 10px;

        text-decoration: none;
        font-size: 20px;
        font-weight: bold;

        border: 1px solid var(--pico-color);
        border-radius: 5px;

        cursor: pointer;
        text-align: center;

        transition: all 0.3s ease-in-out;
    }
    a:hover {
        color: var(--pico-primary-hover);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease-in-out;

    }
</style>