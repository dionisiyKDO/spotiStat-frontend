<script lang="ts">
    import * as d3 from "d3";

    let chartsvg: SVGSVGElement;
    let chartContainer: HTMLElement;

    let { year = $bindable(), tracksByYear } = $props();

    $effect(() => {
        // console.log("tracksByYear", tracksByYear);
        // console.log("year", year);
        
        
        drawChart();
    });

    function drawChart() {
        d3.select(chartsvg).selectAll("*").remove();

        // TODO: export styles to other ts file
        // #region styles for the chart
        const chartFontSize = "14px";
        const chartColor = "#c2c7d0";
        const chartBG = "#777";
        const chartStroke = "#7b8495";
        const chartStrokeWidth = 1;
        const chartStrokeOpacity = 0.33;
        // const chartLineStroke = colors.emerald[600];
        const chartLineStroke = "#7b8495";
        const chartLineStrokeWidth = 1.5;
        const chartLineStrokeOpacity = 0.66;

        const tooltipFontSize = "18px";
        const tooltipColor = "#c2c7d0";
        const tooltipBG = "#0c0c0c";
        // const tooltipBorder = colors.emerald[500];
        const tooltipBorder = "#7b8495";
        const tooltipBorderRadius = "3px";
        const tooltipPadding = "5px";
        const tooltipBoxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";

        // const tooltipCircleFill = colors.emerald[500];
        const tooltipCircleFill = "#7b8495";
        const tooltipCircleRadius = 3;
        const tooltipCircleOpacity = 1;

        const tooltipLineStroke = chartStroke;
        const tooltipLineStrokeWidth = 1;
        const tooltipLineStrokeOpacity = 0.66;
        // #endregion

        // #region Create the chart variables
        const container = d3.select(chartContainer);
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width =
            container.node().getBoundingClientRect().width -
            margin.left -
            margin.right;
        const height = 400 - margin.top - margin.bottom;
        // #endregion

        // #region SVG Initialization
        const svg = d3
            .select(chartsvg)
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
            )
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define Time scale (x-axis)
        const xScale = d3
            .scaleTime()
            .range([0, width])
            .domain(d3.extent(tracksByYear, (d: any) => d.release_date));

        // Define Linear scale (y-axis)
        const yScale = d3
            .scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(tracksByYear, (d: any) => d.count)])
            .nice();

        // #endregion

        // #region Axes, Grid, Bounds

        // Draw the x-axis
        let xAxis = svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(
                d3
                    .axisBottom(xScale)
                    .ticks(d3.timeMonth.every(3))
                    .tickFormat(d3.timeFormat("%b %Y"))
            )
            .call((g: any) => {
                g.select(".domain").remove();
                g.selectAll(".tick line").style("stroke-opacity", 0);
                g.selectAll(".tick text")
                    .style("fill", "#777")
                    .style("font-size", "14px");
            });

        // Draw the y-axis
        const yAxis = svg
            .append("g")
            .attr("class", "y-axis")
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisLeft(yScale))
            .call((g: any) => {
                g.select(".domain").remove();
                g.selectAll(".tick line").style("stroke-opacity", 0);
                g.selectAll(".tick text")
                    .style("fill", "#777")
                    .style("font-size", "14px");
            });

        // Draw x-grid lines.
        const xGrid = svg
            .selectAll("xGrid")
            .data(xScale.ticks(d3.timeMonth.every(1)))
            .join("line")
            .attr("x1", (d: any) => xScale(d))
            .attr("x2", (d: any) => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

        // Draw y-grid lines.
        const yGrid = svg
            .selectAll("yGrid")
            .data(yScale.ticks().slice(1, -1)) // Remove the first and last tick to prevent overlap
            .join("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", (d: any) => yScale(d))
            .attr("y2", (d: any) => yScale(d))
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

        // Add y-axis label.
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#777")
            .style("font-family", "sans-serif")
            .text("Count");

        // Draw chart boundary.
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", chartStroke)
            .attr("fill", "none");

        // #endregion

        // #region Draw Chart Lines

        // Draw the line
        svg.append("path")
            .attr("class", "line")
            .datum(tracksByYear)
            .attr("fill", "none")
            .attr("stroke", chartLineStroke)
            .attr("stroke-width", chartLineStrokeWidth)
            .attr(
                "d",
                d3
                    .line()
                    .x((d: any) => xScale(d.release_date))
                    // .x(function (d) {
                    //     return xScale(d.release_date);
                    // })
                    .y((d: any) => yScale(d.count))
                    // .y(function (d) {
                    //     return yScale(d.count);
                    // })
            );
		// #endregion

		// #region Draw Tooltip

		// Set up the tooltip line to indicate the cursor's x-position
        const tooltipLine = svg
			.append('line')
			.attr('stroke', '#fff')
			.attr('stroke-width', 1)
			.attr('opacity', 0);
        
		// Set up the tooltip container
		const tooltip = d3
			.select('#tooltip')
			.style('opacity', 0)
			.style('position', 'fixed')
			.style('white-space', 'nowrap')
			.style('z-index', '10')
			.style('pointer-events', 'none')
            .style("background-color", tooltipBG)
            .style("border", tooltipBorder)
            .style("font-size", tooltipFontSize)
            .style("color", tooltipColor)
            .style("padding", tooltipPadding)
            .style("border-radius", tooltipBorderRadius)
            .style("box-shadow", tooltipBoxShadow);

		// Add an invisible rectangle to listen for mouse events
        const listeningRect = svg
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0)
            .on("mousemove", drawTooltip)
            .on("mouseout", removeTooltip)
            .on("click", handleClick);
        // #endregion

        function handleClick(event) {
            const [mouseXsvg, mouseYsvg] = d3.pointer(event);
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const xDate = xScale.invert(mouseXsvg);

            const closestPoint = d3.least(tracksByYear, (d: any) =>
                Math.abs(xScale(d.release_date) - mouseXsvg)
            );

            year = closestPoint.release_date.getFullYear();
        }

        function drawTooltip(event) {
            const [mouseXsvg, mouseYsvg] = d3.pointer(event);
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const xDate = xScale.invert(mouseXsvg);

            // Find the closest data point to the mouse x position
            const closestPoint = d3.least(tracksByYear, (d) =>
                Math.abs(xScale(d.release_date) - mouseXsvg)
            );

            console.log("tracksByYear", tracksByYear);
            console.log("mouseXsvg", mouseXsvg);
            
            
            console.log("closestPoint", closestPoint);
            

            // Calculate tooltip position
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;

            // Modified: Account for page scroll
            let tooltipLeft = mouseX + 15 + window.scrollX;
            let tooltipTop = mouseY - 30 + window.scrollY;

            // Adjust tooltip position if it goes out of viewport
            if (
                tooltipLeft + tooltipWidth + 15 >=
                window.innerWidth + window.scrollX
            ) {
                tooltipLeft = mouseX - tooltipWidth - 10 + window.scrollX;
            }
            if (
                tooltipTop + tooltipHeight >=
                window.innerHeight + window.scrollY
            ) {
                tooltipTop = mouseY - tooltipHeight - 10 + window.scrollY;
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
            let circles = svg
                .selectAll(".tooltip-circle")
                .data([closestPoint], (d) => d.release_date);

            // Remove any existing circles that are no longer needed
            circles.exit().remove();

            // Add new circles
            circles
                .enter()
                .append("circle")
                .attr("class", "tooltip-circle")
                .attr("cx", (d) => xScale(d.release_date))
                .attr("cy", (d) => yScale(d.count))
                .attr("r", tooltipCircleRadius)
                .attr("fill", tooltipCircleFill)
                .attr("fill-opacity", tooltipCircleOpacity);
        }

        function removeTooltip() {
            tooltip.style("opacity", 0);
            tooltipLine.attr("stroke-width", 0);
            svg.selectAll(".tooltip-circle").remove();
        }
    }
</script>

<div id="chart-container" bind:this={chartContainer}>
    <svg id="chart" bind:this={chartsvg} />
    <div id="tooltip"></div>
</div>
