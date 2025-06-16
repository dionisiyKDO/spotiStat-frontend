<script lang="ts">
    import * as d3 from "d3";
    import {
        chartFontSize,
        chartColor,
        chartStroke,
        chartStrokeWidth,
        chartStrokeOpacity,
        chartBar,
        tooltipFontSize,
        tooltipColor,
        tooltipBG,
        tooltipBorder,
        tooltipBorderRadius,
        tooltipPadding,
        tooltipBoxShadow,
    } from "$lib/chartStyles";

    interface Props {
        data: any[] | [any[], any?]; // Can be single array or tuple of two arrays
        yAxisLabel: string;
        xAxisLabel: string;
        userLabels?: [string?, string?]; // Optional labels for the users/datasets
        barColors?: [string?, string?]; // Optional custom colors for the bars
    }

    let { data, yAxisLabel, xAxisLabel, userLabels = ["User 1", "User 2"], barColors }: Props = $props();

    let chartContainer: HTMLDivElement;
    let chartSvg: SVGSVGElement;
    let resizeObserver: ResizeObserver;
    let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    // Determine if we have dual data
    const isDualData = $derived(() => Array.isArray(data) && Array.isArray(data[0]) && data.length === 2);
    const dataset1 = $derived(() => isDualData() ? (data as [any[], any[]])[0] : data as any[]);
    const dataset2 = $derived(() => isDualData() ? (data as [any[], any[]])[1] : []);

    // Default colors - using chartBar for first user, slightly different hue for second
    const defaultColors = [chartBar, "#4f83cc"]; // You can adjust the second color as needed
    const colors = $derived(() => barColors || defaultColors);

    // Process data for both datasets
    const processedData1 = $derived(() => 
        dataset1().map((d) => ({
            ...d,
            value: yAxisLabel === "total_ms_played" 
                ? (d.total_ms_played ?? 0) / 3.6e6 
                : d.play_count ?? 0,
            label: xAxisLabel === "hour"
                ? d.hour ?? ""
                : xAxisLabel === "weekday"
                ? d.weekday ?? ""
                : xAxisLabel === "year"
                ? d.year ?? ""
                : xAxisLabel === "month"
                ? d.month ?? ""
                : d[xAxisLabel] ?? "",
            user: userLabels[0] || "User 1"
        }))
    );

    const processedData2 = $derived(() => 
        dataset2().map((d) => ({
            ...d,
            value: yAxisLabel === "total_ms_played" 
                ? (d.total_ms_played ?? 0) / 3.6e6 
                : d.play_count ?? 0,
            label: xAxisLabel === "hour"
                ? d.hour ?? ""
                : xAxisLabel === "weekday"
                ? d.weekday ?? ""
                : xAxisLabel === "year"
                ? d.year ?? ""
                : xAxisLabel === "month"
                ? d.month ?? ""
                : d[xAxisLabel] ?? "",
            user: userLabels[1] || "User 2"
        }))
    );

    // Get all unique labels for consistent x-axis
    const allLabels = $derived(() => {
        const labels1 = processedData1().map(d => d.label);
        const labels2 = processedData2().map(d => d.label);
        return [...new Set([...labels1, ...labels2])].sort((a, b) => {
            // Sort numerically if possible, otherwise alphabetically
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });
    });

    // Create combined dataset for easier processing
    const combinedData = $derived(() => {
        const result: any[] = [];
        
        allLabels().forEach(label => {
            const data1Item = processedData1().find(d => d.label === label);
            const data2Item = processedData2().find(d => d.label === label);
            
            if (data1Item) {
                result.push({ ...data1Item, datasetIndex: 0 });
            }
            
            if (data2Item && isDualData()) {
                result.push({ ...data2Item, datasetIndex: 1 });
            }
        });
        
        return result;
    });

    function drawChart() {
        if (!chartContainer || !chartSvg || !processedData1().length) return;

        // Clear previous chart
        d3.select(chartSvg).selectAll("*").remove();

        // Get actual container dimensions
        const containerRect = chartContainer.getBoundingClientRect();
        const margin = { top: 20, right: isDualData() ? 120 : 20, bottom: 40, left: 60 };
        const width = containerRect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) return;

        // Set up SVG with proper dimensions
        const svg = d3.select(chartSvg)
            .attr("width", containerRect.width)
            .attr("height", 350)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(allLabels())
            .range([0, width])
            .padding(0.1);

        const xSubScale = d3.scaleBand()
            .domain(isDualData() ? ["0", "1"] : ["0"])
            .range([0, xScale.bandwidth()])
            .padding(0.05);

        const maxValue = Math.max(
            d3.max(processedData1(), d => d.value) || 0,
            isDualData() ? (d3.max(processedData2(), d => d.value) || 0) : 0
        );

        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0])
            .nice();

        // Add axes
        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale))
            .call(g => g.select(".domain").remove());

        xAxis
            .selectAll(".tick line")
            .style("stroke", chartStroke)
            .style("stroke-opacity", 0);

        svg.append("g")
            .attr("class", "y-axis")
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisLeft(yScale))
            .call(g => g.select(".domain").remove())
            .selectAll(".tick line")
            .style("stroke", chartStroke)
            .style("stroke-opacity", 0);

        // Add grid lines (y-axis only for bar charts)
        svg.selectAll(".y-grid")
            .data(yScale.ticks().slice(1))
            .join("line")
            .attr("class", "y-grid")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

        // Add chart border
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("fill", "none");

        // Add bars
        svg.selectAll(".bar")
            .data(combinedData())
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => (xScale(d.label) || 0) + (xSubScale(d.datasetIndex.toString()) || 0))
            .attr("y", d => yScale(d.value))
            .attr("width", xSubScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", d => colors()[d.datasetIndex])
            .on("mouseover", function(event, d) {
                // Highlight bar on hover
                d3.select(this).attr("opacity", 0.8);
                showTooltip(event, d);
            })
            .on("mousemove", function(event, d) {
                showTooltip(event, d);
            })
            .on("mouseout", function() {
                // Remove highlight
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });

        // Add legend if dual data
        if (isDualData()) {
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width + 20}, 20)`);

            const legendItems = legend.selectAll(".legend-item")
                .data([
                    { label: userLabels[0] || "User 1", color: colors()[0] },
                    { label: userLabels[1] || "User 2", color: colors()[1] }
                ])
                .join("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0, ${i * 25})`);

            legendItems.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d => d.color);

            legendItems.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .style("font-size", chartFontSize)
                .style("fill", chartColor)
                .text(d => d.label);
        }

        function showTooltip(event: MouseEvent, d: any) {
            // Position and show tooltip
            const tooltipContent = yAxisLabel === 'total_ms_played'
                ? `${d.user}<br/>At ${d.label}: ${d.value.toFixed(2)} Hours`
                : `${d.user}<br/>At ${d.label}: ${Math.round(d.value)} ${d.value === 1 ? 'play' : 'plays'}`;

            tooltip
                .style("opacity", 1)
                .html(tooltipContent);

            const tooltipNode = tooltip.node() as HTMLElement;
            const tooltipRect = tooltipNode.getBoundingClientRect();
            
            let left = event.clientX + 15;
            let top = event.clientY - 15;

            // Adjust if tooltip goes off screen
            if (left + tooltipRect.width > window.innerWidth) {
                left = event.clientX - tooltipRect.width - 15;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = event.clientY - tooltipRect.height - 15;
            }

            tooltip
                .style("left", `${left}px`)
                .style("top", `${top}px`);
        }

        function hideTooltip() {
            tooltip.style("opacity", 0);
        }
    }

    function setupResizeObserver() {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        resizeObserver = new ResizeObserver(() => {
            drawChart();
        });

        if (chartContainer) {
            resizeObserver.observe(chartContainer);
        }
    }

    function initializeTooltip() {
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("position", "fixed")
            .style("z-index", "1000")
            .style("pointer-events", "none")
            .style("background-color", tooltipBG)
            .style("border", tooltipBorder)
            .style("font-size", tooltipFontSize)
            .style("color", tooltipColor)
            .style("padding", tooltipPadding)
            .style("border-radius", tooltipBorderRadius)
            .style("box-shadow", tooltipBoxShadow)
            .style("opacity", 0);
    }

    function cleanup() {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
        if (tooltip) {
            tooltip.remove();
        }
    }

    $effect(() => {
        if (chartContainer) {
            initializeTooltip();
            setupResizeObserver();
            drawChart();
        }

        return cleanup;
    });

    $effect(() => {
        // Redraw when data changes
        if (processedData1().length > 0) {
            drawChart();
        }
    });
</script>

<div bind:this={chartContainer} class="chart-container w-full h-full">
    <svg bind:this={chartSvg} class="w-full"></svg>
</div>