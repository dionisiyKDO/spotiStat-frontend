<script lang="ts">
    import * as d3 from "d3";
    import {
        chartFontSize,
        chartColor,
        chartStroke,
        chartStrokeWidth,
        chartStrokeOpacity,
        chartLineStroke,
        chartLineStrokeWidth,
        chartLineStrokeOpacity,
        tooltipFontSize,
        tooltipColor,
        tooltipBG,
        tooltipBorder,
        tooltipBorderRadius,
        tooltipPadding,
        tooltipBoxShadow,
        tooltipCircleFill,
        tooltipCircleRadius,
        tooltipCircleOpacity,
        tooltipLineStroke,
        tooltipLineStrokeWidth,
        tooltipLineStrokeOpacity,
    } from "$lib/chartStyles";
    
    let chartsvg: SVGSVGElement;

    interface Props {
        data: any;
        yAxisLabel: string;
        xAxisLabel: string;
    }

    let { data, yAxisLabel, xAxisLabel }: Props = $props();

    const processedData = data.map((d) => ({
        ...d,
        value: yAxisLabel === "total_ms_played"
            ? d.total_ms_played / 3.6e6
            : d.play_count,
        label: xAxisLabel === "days" ? new Date(d.day) : d[xAxisLabel]
    }));

    
    function drawChart() {
        d3.select(chartsvg).selectAll("*").remove();

        // Create the chart variables
        // #region
        const container = d3.select("#chart-container");
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width  = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;
        // #endregion

        // Create the SVG elements
        // #region
        const svg = d3
			.select(chartsvg)
			.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(processedData, d => d.label));

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(processedData, d => d.value)])
            .nice();

        // add x-axis
        const xAxis = svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale))
            .call((g) => g.select(".domain").remove())
            .selectAll(".tick line")
            .style("color", chartStroke)
            .style("stroke-opacity", 0);
        
        // add y-axis
        const yAxis = svg
            .append("g")
            .attr("class", "y-axis")
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisLeft(yScale))
            .call((g) => g.select(".domain").remove())
            .selectAll(".tick line")
            .style("color", chartStroke)
            .style("stroke-opacity", 0);

        // add x-grid
        svg.selectAll("xGrid")
            .data(xScale.ticks())
            .join("line")
            .attr("x1", (d) => xScale(d))
            .attr("x2", (d) => xScale(d))
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
            .attr("y1", (d) => yScale(d))
            .attr("y2", (d) => yScale(d))
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
            .datum(processedData)
            .attr("fill", "none")
            .attr("stroke", chartLineStroke)
            .attr("stroke-width", chartLineStrokeWidth)
            .attr("d", d3.line()
                .x((d) => xScale(d.label))
                .y((d) => yScale(d.value)));

        const tooltip = d3.select('#tooltip');
        const tooltipLine = svg.append('line');

        const listeningRect = svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)
            .on('mousemove', drawTooltip)
            .on('mouseout', () => {
                tooltip.style.opacity = "0";
                tooltipLine.attr("stroke-width", 0);
                svg.selectAll(".tooltip-circle").remove();
            });
        // #endregion


        function drawTooltip(event) {
            const tooltip = d3.select('#tooltip');
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;
            const [mouseXsvg, mouseYsvg] = d3.pointer(event);
            
            // Find the closest data point to the mouse x position
            const closestPoint = d3.least(processedData, d => Math.abs(xScale(d.label) - mouseXsvg));            

            // Update tooltip box
            let left = event.clientX + 15 + window.scrollX;
            let top = event.clientY - 30 + window.scrollY;

            if (left + tooltipWidth + 15 >= window.innerWidth + window.scrollX)
                left = event.clientX - tooltipWidth - 10 + window.scrollX;
            
            if (top + tooltipHeight >= window.innerHeight + window.scrollY)
                top = event.clientY - tooltipHeight - 10 + window.scrollY;

            tooltip
                .style("left", `${left}px`)
                .style("top", `${top}px`)
                .style("opacity", 1)
                .html(
                    yAxisLabel === 'total_ms_played'
                        ? `${(closestPoint.value).toFixed(2)} Hours at ${d3.timeFormat("%Y-%m-%d")(closestPoint.label)}`
                        : `${(closestPoint.value)} times at ${d3.timeFormat("%Y-%m-%d")(closestPoint.label)}`
                );

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
                .data([closestPoint], d => d.label);

            // Remove any existing circles that are no longer needed
            circles.exit().remove();

            // Add new circles
            circles.enter()
                .append("circle")
                .attr("class", "tooltip-circle")
                .attr("cx", d => xScale(d.label))
                .attr("cy", d => yScale(d.value))
                .attr("r", tooltipCircleRadius)
                .attr("fill", tooltipCircleFill)
                .attr("fill-opacity", tooltipCircleOpacity);
        }
    }

    $effect(drawChart);
</script>


<div id="chart-container">
    <svg id="chart" bind:this={chartsvg}/>
    <div id="tooltip" style="
		position: absolute;
		z-index: 10;
		pointer-events: none;
		background-color: {tooltipBG};
		border: {tooltipBorder};
		font-size: {tooltipFontSize};
		color: {tooltipColor};
		padding: {tooltipPadding};
		border-radius: {tooltipBorderRadius};
		box-shadow: {tooltipBoxShadow};
		opacity: 0;
	"></div>
</div>
