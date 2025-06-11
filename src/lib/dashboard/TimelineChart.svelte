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

    interface Props {
        data: any[];
        yAxisLabel: string;
        xAxisLabel: string;
    }

    let { data, yAxisLabel, xAxisLabel }: Props = $props();

    let chartContainer: HTMLDivElement;
    let chartSvg: SVGSVGElement;
    let resizeObserver: ResizeObserver;
    let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    // Process data once
    const processedData = $derived(() => 
        data.map((d) => ({
            ...d,
            value: yAxisLabel === "total_ms_played" 
                ? d.total_ms_played / 3.6e6 
                : d.play_count,
            label: xAxisLabel === "days" ? new Date(d.day) : d[xAxisLabel]
        }))
    );

    function calculateOptimalTicks(scale: d3.ScaleTime<number, number, never>, width: number): Date[] {
        const minTickSpacing = 80; // Minimum pixels between ticks
        const maxTicks = Math.floor(width / minTickSpacing);
        
        // Get the time extent
        const [startDate, endDate] = scale.domain();
        const timeSpan = endDate.getTime() - startDate.getTime();
        const daySpan = timeSpan / (24 * 60 * 60 * 1000);
        
        let interval: d3.TimeInterval;
        
        if (daySpan <= 7) {
            interval = d3.timeDay;
        } else if (daySpan <= 31) {
            interval = d3.timeDay.every(Math.ceil(daySpan / maxTicks)) || d3.timeDay;
        } else if (daySpan <= 90) {
            interval = d3.timeWeek;
        } else if (daySpan <= 365) {
            interval = d3.timeMonth;
        } else {
            const yearSpan = daySpan / 365;
            const yearStep = Math.ceil(yearSpan / maxTicks);
            interval = d3.timeYear.every(yearStep) || d3.timeYear;
        }
        
        return interval.range(startDate, endDate);
    }

    function drawChart() {
        if (!chartContainer || !chartSvg || !processedData().length) return;

        // Clear previous chart
        d3.select(chartSvg).selectAll("*").remove();

        // Get actual container dimensions
        const containerRect = chartContainer.getBoundingClientRect();
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
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
        const xScale = d3.scaleTime()
            .domain(d3.extent(processedData(), d => d.label) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData(), d => d.value) || 0])
            .range([height, 0])
            .nice();

        // Calculate optimal x-axis ticks
        const xTicks = calculateOptimalTicks(xScale, width);
        
        // Create time format based on data span
        const timeSpan = (xScale.domain()[1].getTime() - xScale.domain()[0].getTime()) / (24 * 60 * 60 * 1000);
        const timeFormat = timeSpan <= 31 
            ? d3.timeFormat("%m/%d")
            : timeSpan <= 365 
                ? d3.timeFormat("%m/%d") 
                : d3.timeFormat("%Y/%m");

        // Add axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale)
                .tickValues(xTicks)
                .tickFormat(timeFormat as any))
            .call(g => g.select(".domain").remove())
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

        // Add grid lines
        svg.selectAll(".x-grid")
            .data(xTicks)
            .join("line")
            .attr("class", "x-grid")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", chartStroke)
            .attr("stroke-width", chartStrokeWidth)
            .attr("stroke-opacity", chartStrokeOpacity);

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

        // Add line
        const line = d3.line<any>()
            .x(d => xScale(d.label))
            .y(d => yScale(d.value))
            .curve(d3.curveLinear);

        svg.append("path")
            .datum(processedData())
            .attr("fill", "none")
            .attr("stroke", chartLineStroke)
            .attr("stroke-width", chartLineStrokeWidth)
            .attr("stroke-opacity", chartLineStrokeOpacity)
            .attr("d", line);

        // Tooltip elements
        const tooltipLine = svg.append("line")
            .attr("class", "tooltip-line")
            .style("opacity", 0);

        // Mouse interaction (?????)
        const bisectDate = d3.bisector((d: any) => d.label).left;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", function(event) {
                const [mouseX] = d3.pointer(event);
                const x0 = xScale.invert(mouseX);
                const i = bisectDate(processedData(), x0, 1);
                const d0 = processedData()[i - 1];
                const d1 = processedData()[i];
                const d = d1 && (x0.getTime() - d0.label.getTime() > d1.label.getTime() - x0.getTime()) ? d1 : d0;

                if (!d) return;

                showTooltip(event, d, xScale(d.label));
            })
            .on("mouseout", hideTooltip);

        function showTooltip(event: MouseEvent, d: any, xPos: number) {
            // Show tooltip line
            tooltipLine
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", tooltipLineStroke)
                .attr("stroke-width", tooltipLineStrokeWidth)
                .attr("stroke-opacity", tooltipLineStrokeOpacity)
                .style("opacity", 1);

            // Show tooltip circle
            svg.selectAll(".tooltip-circle").remove();
            svg.append("circle")
                .attr("class", "tooltip-circle")
                .attr("cx", xPos)
                .attr("cy", yScale(d.value))
                .attr("r", tooltipCircleRadius)
                .attr("fill", tooltipCircleFill)
                .attr("fill-opacity", tooltipCircleOpacity);

            // Position and show tooltip
            const tooltipContent = yAxisLabel === 'total_ms_played'
                ? `${d.value.toFixed(2)} Hours<br/>${d3.timeFormat("%Y-%m-%d")(d.label)}`
                : `${Math.round(d.value)} plays<br/>${d3.timeFormat("%Y-%m-%d")(d.label)}`;

            tooltip
                .style("opacity", 1)
                .html(tooltipContent);

            const tooltipNode = tooltip.node() as HTMLElement;
            const tooltipRect = tooltipNode.getBoundingClientRect();
            const containerRect = chartContainer.getBoundingClientRect();
            
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
            tooltipLine.style("opacity", 0);
            svg.selectAll(".tooltip-circle").remove();
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
            .style("position", "absolute")
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
        if (processedData().length > 0) {
            drawChart();
        }
    });
</script>

<div bind:this={chartContainer} class="chart-container w-full h-full">
    <svg bind:this={chartSvg} class="w-full"></svg>
</div>
