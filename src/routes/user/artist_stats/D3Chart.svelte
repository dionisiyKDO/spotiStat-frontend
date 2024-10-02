<script>
    import * as d3 from "d3";
    import * as colors from "tailwindcss/colors";

    let { timeline_data } = $props();

    async function drawChart() {
        d3.select("#chart").selectAll("*").remove();

        const chartFontSize = '14px';
        const chartColor = '#c2c7d0';
        const chartStroke = '#7b8495';
        const chartLineStroke = colors.emerald[600];

        const container = d3.select("#chart-container");
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(timeline_data, d => d.date));

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(timeline_data, d => d.total_minutes_played)]).nice();

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(timeline_data)
            .attr("fill", "none")
            .attr("stroke", chartLineStroke)
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.total_minutes_played)));

        const tooltip = d3.select('#tooltip').style('opacity', 0);

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('opacity', 0)
            .on('mousemove', (event) => {
                const [mouseX] = d3.pointer(event);
                const xDate = xScale.invert(mouseX);

                const closestPoint = d3.least(timeline_data, d => Math.abs(xScale(d.date) - mouseX));

                tooltip.style('opacity', 1).html(`
                    ${closestPoint.total_minutes_played} minutes on ${d3.timeFormat("%Y-%m-%d")(closestPoint.date)}
                `);
            })
            .on('mouseout', () => tooltip.style('opacity', 0));
    }

    $effect(() => {
        drawChart();
    });
</script>

<div id="chart-container">
    <svg id="chart"></svg>
    <div id="tooltip"></div>
</div>
