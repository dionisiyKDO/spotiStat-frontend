<script>
    let selectedFiles = [];
    let tableData = [];

    // File selection handler
    function handleFileSelect(event) {
        selectedFiles = Array.from(event.target.files);
    }

    // Upload files to the backend
    async function uploadFiles() {
        if (selectedFiles.length === 0) {
            alert("Please select files before uploading.");
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });

        const response = await fetch('/user/import_history', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            tableData = data.entries;
        } else {
            alert('Failed to upload files.');
        }
    }
</script>

<div class="container">
    <h2>Import history</h2>
    <p>This page allows you to import your Spotify history into SpotiStat.</p>
    
    <!-- File input and button to upload -->
    <input type="file" multiple accept=".json" onchange={handleFileSelect} />
    <button onclick={uploadFiles}>Upload Files</button>

    <!-- Display the first 10 entries in a table -->
    {#if tableData.length > 0}
        <table>
            <thead>
                <tr>
                    {#each Object.keys(tableData[0]) as key}
                        <th>{key}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        {#each Object.values(row) as value}
                            <td>{value}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>


<style>

</style>