<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";

    let tracksByYear = $state([]);
    let years = $state([]);
    let values = $state([]);
    let error = $state('');

    // Fetch amount of tracks by year on component mount
    async function fetchTracksByYear() {
        try {
            const response = await fetch('/api/tracks_by_year');
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Something went wrong!';
            } else {
                const data = await response.json();
                tracksByYear = data.tracks_by_year;
            }
        } catch (err) {
            error = 'Error fetching tracks by year';
        }
    }

    onMount(() => {
        fetchTracksByYear().then(() => {
            console.log(tracksByYear);

            tracksByYear.sort(function(a, b) {
                return a.release_date - b.release_date;
            });

            for (let i = 0; i < tracksByYear.length; i++) {
                tracksByYear[i].release_date = new Date(tracksByYear[i].release_date);
            }
            drawChart();
        });
    });

    function drawChart() {
        d3.select("#chart").selectAll("*").remove();

        // const tooltipColor = 'var(--pico-primary-hover)';

        const chartFontSize = '14px';
        const chartColor = 'var(--pico-color)';
        const chartBG = '#777';
        const chartStroke = 'var(--pico-muted-color)';
        const chartStrokeWidth = 1;
        const chartStrokeOpacity = 0.33;
        const chartLineStroke = 'var(--pico-primary)';
        const chartLineStrokeWidth = 1.5;
        const chartLineStrokeOpacity = 0.66;

        const tooltipFontSize = '18px';
        const tooltipColor = 'var(--pico-color)';
        const tooltipBG = 'var(--pico-background-color)';
        const tooltipBorder = 'solid 1px var(--pico-primary-hover)';
        const tooltipBorderRadius = '3px';
        const tooltipPadding = '5px';
        const tooltipBoxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

        const tooltipCircleFill = 'var(--pico-primary-hover)';
        const tooltipCircleRadius = 3;
        const tooltipCircleOpacity = 1;

        const tooltipLineStroke = chartStroke;
        const tooltipLineStrokeWidth = 1;
        const tooltipLineStrokeOpacity = 0.66;


        const container = d3.select("#chart-container");
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width  = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(tracksByYear, d => d.release_date));

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(tracksByYear, d => d.count)])
            .nice();

        // add x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale))
            .call(g => g.select(".domain").remove())
            .selectAll(".tick line")
                .style("stroke-opacity", 0);

        // add y-axis
        const yAxis = svg.append("g")
            .attr("class", "y-axis")
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisLeft(yScale))
            .call(g => g.select(".domain").remove())
            .selectAll(".tick line")
                .style("stroke-opacity", 0);



        // add x-grid
        svg.selectAll("xGrid")
            .data(xScale.ticks())
            .join("line")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

        // add y-grid
        svg.selectAll("yGrid")
            .data(yScale.ticks().slice(1, -1))
            .join("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

        // add border around chart
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", chartStroke)
            .attr("fill", "none");

        // add line chart
        svg.append("path")
            .datum(tracksByYear)
            .attr("fill", "none")
            .attr("stroke", chartLineStroke)
            .attr("stroke-width", chartLineStrokeWidth)
            .attr("d", d3.line()
                .x(function(d) { return xScale(d.release_date) })
                .y(function(d) { return yScale(d.count) })
                );



        const tooltipLine = svg.append('line');
        const tooltip = d3.select('#tooltip').style('opacity', 0)
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('pointer-events', 'none')
            .style("background-color", tooltipBG)
            .style("border", tooltipBorder)
            .style("font-size", tooltipFontSize)
            .style("color", tooltipColor)
            .style("padding", tooltipPadding)
            .style("border-radius", tooltipBorderRadius)
            .style('box-shadow', tooltipBoxShadow);

        const listeningRect = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)
            .on('mousemove', drawTooltip)
            .on('mouseout', removeTooltip);
        
        function drawTooltip(event) {
            const [mouseXsvg, mouseYsvg] = d3.pointer(event);
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const xDate = xScale.invert(mouseXsvg);

            // Find the closest data point to the mouse x position
            const closestPoint = d3.least(tracksByYear, d => Math.abs(xScale(d.release_date) - mouseXsvg));

            // Calculate tooltip position
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;

            let tooltipLeft = mouseX + 20;
            let tooltipTop = mouseY - 40;

            // Adjust tooltip position if it goes out of viewport
            if (tooltipLeft + tooltipWidth > window.innerWidth) {
                tooltipLeft = mouseX - tooltipWidth - 10;
            }
            if (tooltipTop + tooltipHeight > window.innerHeight) {
                tooltipTop = mouseY - tooltipHeight - 10;
            }

            tooltip
                .style("left", `${tooltipLeft}px`)
                .style("top", `${tooltipTop}px`)
                .style("opacity", 1);

            // Update tooltip content
            tooltip.html(`
                <div>
                    ${closestPoint.count} tracks released in ${d3.timeFormat("%Y")(closestPoint.release_date)}
                </div>
            `);


            // Update tooltip line
            tooltipLine
                .attr("x1", mouseXsvg)
                .attr("x2", mouseXsvg)
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", tooltipLineStroke)
                .attr("stroke-width", tooltipLineStrokeWidth)
                .attr("stroke-opacity", tooltipLineStrokeOpacity);

            // Update tooltip circles
            let circles = svg.selectAll(".tooltip-circle")
                .data([closestPoint], d => d.release_date);

            // Remove any existing circles that are no longer needed
            circles.exit().remove();

            // Add new circles
            circles.enter()
                .append("circle")
                .attr("class", "tooltip-circle")
                .attr("cx", d => xScale(d.release_date))
                .attr("cy", d => yScale(d.count))
                .attr("r", tooltipCircleRadius)
                .attr("fill", tooltipCircleFill)
                .attr("fill-opacity", tooltipCircleOpacity);
        }

        // Tooltip removal function
        function removeTooltip() {
            tooltip.style("opacity", 0);
            tooltipLine.attr("stroke-width", 0);
            svg.selectAll(".tooltip-circle").remove();
        }
    }
</script>

{#if error}
    <p style="color: darkred">{error}</p>
{:else}
    <div id="chart-container">
        <svg id="chart"/>
        <div id="tooltip"></div>
    </div>
{/if}

{#if false}<div class="red" ></div>{/if} 


<style>

</style>