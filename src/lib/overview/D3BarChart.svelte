<script lang="ts">
    import * as d3 from "d3";
    import {
        chartFontSize,
        chartColor,
        chartStroke,
        chartStrokeWidth,
        chartStrokeOpacity,
        chartBar,
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

    interface DataPoint {
        label?: string;
		total_ms_played?: number;
		play_count?: number;
		hour?: string;
		day_of_week?: string;
	}

	interface Props {
		data: any;
		// data: DataPoint[];
		yAxisLabel: string;
		xAxisLabel: string;
	}

    let { data, yAxisLabel, xAxisLabel }: Props = $props();

    const processedData = data.map((d) => ({
		...d,
		value: yAxisLabel === 'total_ms_played'
			? (d.total_ms_played ?? 0) / 3.6e6
			: d.play_count ?? 0,
		label: xAxisLabel === 'hour'
			? d.hour ?? ''
			: xAxisLabel === 'day_of_week'
			? d.day_of_week ?? ''
			: ''
	}));

    function drawChart() {
		d3.select(chartsvg).selectAll('*').remove();

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

        const xScale = d3.scaleBand()
			.range([0, width])
			.domain(processedData.map(d => d.label))
			.padding(0.1);

		const yScale = d3.scaleLinear()
			.range([height, 0])
			.domain([0, d3.max(processedData, d => d.value)!])
			.nice();

		// Axes
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

        // add bars
        svg.selectAll(".bar")
            .data(processedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.label))
            .attr("y", (d) => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.value))
            .attr("fill", chartBar)
            .on('mousemove', drawTooltip)
			.on('mouseout', () => d3.select('#tooltip').style('opacity', 0));

        function drawTooltip(event, d) {
            const tooltip = d3.select('#tooltip');
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;

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
                        ? `At ${d.label} <br>${d.value.toFixed(2)} Hours`
                        : `${d.value} Times`
                );
        }
    }

    $effect(drawChart);
</script>

<div id="chart-container">
    <svg id="chart" bind:this={chartsvg} />
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
