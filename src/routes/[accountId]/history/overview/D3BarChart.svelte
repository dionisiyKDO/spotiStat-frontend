<script lang="ts">
    import * as d3 from "d3";

    let chartsvg;

    interface Props {
        data: any;
        yAxisLabel: string;
        xAxisLabel: string;
    }

    let { data, yAxisLabel, xAxisLabel }: Props = $props();
    if (yAxisLabel === "total_ms_played") {
        for (let i = 0; i < data.length; i++) {
            data[i]["value"] = data[i]["total_ms_played"] / 3.6e6;
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i]["value"] = data[i]["play_count"];
        }
    }

    if (xAxisLabel === "hour") {
        for (let i = 0; i < data.length; i++) {
            data[i]["label"] = data[i]["hour"];
        }
    }
    if (xAxisLabel === "day_of_week") {
        for (let i = 0; i < data.length; i++) {
            data[i]["label"] = data[i]["day_of_week"];
        }
    }
    console.log(xAxisLabel, data);

    function drawChart() {
        d3.select(chartsvg).selectAll("*").remove();

        // styles for the chart
        // #region
        const chartFontSize = "14px";
        const chartColor = "#c2c7d0";
        const chartBG = "#777";

        const chartStroke = "#7b8495";
        const chartStrokeWidth = 1;
        const chartStrokeOpacity = 0.33;
        // const chartBar = colors.emerald[500];
        // const chartBarHover = colors.emerald[600];
        // const chartLineStroke = colors.emerald[600];
        const chartBar = "#7b8495";
        const chartBarHover = "#7b8495";
        const chartLineStroke = "#7b8495";
        const chartLineStrokeWidth = 1.5;
        const chartLineStrokeOpacity = 0.66;

        const tooltipFontSize = "18px";
        const tooltipColor = "#c2c7d0";
        const tooltipBG = "#0c0c0c";
        // const tooltipBorderColor = colors.emerald[500];
        const tooltipBorderColor = "#7b8495";
        const tooltipBorderWidth = "2px";
        const tooltipBorder =
            tooltipBorderWidth + " solid " + tooltipBorderColor;

        const tooltipBorderRadius = "6px";
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

        // Create the chart variables
        // #region
        const container = d3.select("#chart-container");
        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width =
            container.node().getBoundingClientRect().width -
            margin.left -
            margin.right;
        const height = 400 - margin.top - margin.bottom;
        // #endregion

        // Create the SVG elements
        // #region
        const svg = d3
            .select(chartsvg)
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
            )
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3
            .scaleBand()
            .range([0, width])
            .domain(data.map((d) => d.label));
        // .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, (d) => d.value)])
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
            // .style("stroke-opacity", chartStrokeOpacity);
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
            // .style("stroke-opacity", chartStrokeOpacity);
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
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(d.label))
            .attr("y", (d) => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.value))
            .attr("fill", chartBar);

        // Tooltip setup
        const tooltip = d3
            .select("#tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("pointer-events", "none")
            .style("background-color", tooltipBG)
            .style("border", tooltipBorder)
            .style("font-size", tooltipFontSize)
            .style("color", tooltipColor)
            .style("padding", tooltipPadding)
            .style("border-radius", tooltipBorderRadius)
            .style("box-shadow", tooltipBoxShadow);

        // Interaction listeners for the bars
        svg.selectAll(".bar")
            .on("mousemove", drawTooltip)
            .on("mouseout", removeTooltip);

        function drawTooltip(event, d) {
            const [mouseX, mouseY] = [event.clientX, event.clientY];
            const tooltipWidth = tooltip.node().offsetWidth;
            const tooltipHeight = tooltip.node().offsetHeight;

            // Position the tooltip based on mouse position and viewport boundaries
            let tooltipLeft = mouseX + 15 + window.scrollX;
            let tooltipTop = mouseY - 30 + window.scrollY;

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
            if (yAxisLabel === "total_ms_played") {
                tooltip.html(`
                    <div>
                        At ${d.label} </br>
                        ${d.value.toFixed(2)} Hours
                    </div>
                `);
            } else {
                tooltip.html(`
                    <div>
                        ${d.value} Times
                    </div>
                `);
            }
        }

        function removeTooltip() {
            tooltip.style("opacity", 0);
        }
    }

    $effect(() => {
        drawChart();
    });
</script>

<p>aboba1</p>
<div id="chart-container">
    <svg id="chart" bind:this={chartsvg} />
    <div id="tooltip"></div>
</div>
