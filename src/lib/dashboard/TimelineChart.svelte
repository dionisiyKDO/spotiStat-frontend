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
        data: any[] | [any[], any?]; // Can be single array or tuple of two arrays
        yAxisLabel: string;
        xAxisLabel: string;
        userLabels?: [string?, string?]; // Optional labels for the users/datasets
        lineColors?: [string?, string?]; // Optional custom colors for the lines
    }

    let { 
        data, 
        yAxisLabel, 
        xAxisLabel, 
        userLabels = ["User 1", "User 2"], 
        lineColors = ["#3b82f6", "#ef4444"] // Default blue and red
    }: Props = $props();

    let chartContainer: HTMLDivElement;
    let chartSvg: SVGSVGElement;
    let resizeObserver: ResizeObserver;
    let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    
    // Zoom state
    let originalXDomain: [Date, Date] | null = null;
    let currentXDomain: [Date, Date] | null = null;
    let isSelecting = false;
    let selectionStart: number | null = null;
    
    // Pan state
    let isPanning = false;
    let panStart: number | null = null;
    let panStartDomain: [Date, Date] | null = null;

    // Process data - handle both single array and dual array formats
    const processedData = $derived(() => {
        const processDataset = (dataset: any[]) => 
            dataset.map((d) => ({
                ...d,
                value: yAxisLabel === "total_ms_played" 
                    ? d.total_ms_played / 3.6e6 
                    : d.play_count,
                label: xAxisLabel === "date"
                    ? new Date(d.date) ?? ""
                    : xAxisLabel === "month"
                    ? new Date(d.month) ?? ""
                    : d[xAxisLabel] ?? ""
            }));

        // Check if data is a tuple of two arrays or a single array
        if (Array.isArray(data) && data.length === 2 && Array.isArray(data[0])) {
            // Dual dataset format: [dataset1, dataset2]
            const [dataset1, dataset2] = data as [any[], any[]];
            return {
                dataset1: processDataset(dataset1),
                dataset2: dataset2 ? processDataset(dataset2) : [],
                isDual: true
            };
        } else {
            // Single dataset format
            return {
                dataset1: processDataset(data as any[]),
                dataset2: [],
                isDual: false
            };
        }
    });

    function calculateOptimalTicks(scale: d3.ScaleTime<number, number, never>, width: number): Date[] {
        const minTickSpacing = 80;
        const maxTicks = Math.floor(width / minTickSpacing);
        
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
        if (!chartContainer || !chartSvg || !processedData().dataset1.length) return;

        const { dataset1, dataset2, isDual } = processedData();

        // Clear previous chart
        d3.select(chartSvg).selectAll("*").remove();

        // Get container dimensions
        const containerRect = chartContainer.getBoundingClientRect();
        const margin = { top: 15, right: 10, bottom: 25, left: 30 }; // Increased top margin for legend
        const width = containerRect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) return;

        // Set up SVG with proper dimensions
        const svg = d3.select(chartSvg)
            .attr("width", containerRect.width)
            .attr("height", 350)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Combine datasets to find overall domain
        const allData = [...dataset1, ...dataset2];

        // Set up domains
        if (!originalXDomain) {
            originalXDomain = d3.extent(allData, d => d.label) as [Date, Date];
            currentXDomain = [...originalXDomain];
        }

        // Create scales
        const xScale = d3.scaleTime()
            .domain(currentXDomain || originalXDomain!)
            .range([0, width]);

        // Filter data to current domain
        const visibleData1 = dataset1.filter(d => 
            d.label >= (currentXDomain?.[0] || originalXDomain![0]) && 
            d.label <= (currentXDomain?.[1] || originalXDomain![1])
        );

        const visibleData2 = dataset2.filter(d => 
            d.label >= (currentXDomain?.[0] || originalXDomain![0]) && 
            d.label <= (currentXDomain?.[1] || originalXDomain![1])
        );

        // Use combined data for Y scale to ensure both lines fit
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(allData, d => d.value) || 0])
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
        const xAxisGroup = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", chartFontSize)
            .style("color", chartColor)
            .call(d3.axisBottom(xScale)
                .tickValues(xTicks)
                .tickFormat(timeFormat as any))
            .call(g => g.select(".domain").remove());
            
        xAxisGroup.selectAll(".tick line")
            .style("stroke", chartStroke)
            .style("stroke-opacity", 0);

        // Handle panning for zoomed state
        const isZoomed = currentXDomain && (
            currentXDomain[0].getTime() !== originalXDomain![0].getTime() ||
            currentXDomain[1].getTime() !== originalXDomain![1].getTime()
        );

        if (isZoomed) {
            const xAxisDragArea = svg.append("rect")
                .attr("class", "x-axis-drag-area")
                .attr("x", 0)
                .attr("y", height)
                .attr("width", width)
                .attr("height", 30)
                .attr("fill", "transparent")
                .style("cursor", "grab")
                .on("mousedown", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    const [mouseX] = d3.pointer(event);
                    isPanning = true;
                    panStart = mouseX;
                    panStartDomain = currentXDomain ? [...currentXDomain] : null;
                    d3.select(this).style("cursor", "grabbing");
                    
                    const handlePanMove = (e: MouseEvent) => {
                        if (!isPanning || panStart === null || !panStartDomain) return;
                        
                        const rect = chartContainer.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left - 60;
                        const dx = mouseX - panStart;
                        const timeDiff = xScale.invert(dx).getTime() - xScale.invert(0).getTime();
                        
                        const newStart = new Date(panStartDomain[0].getTime() - timeDiff);
                        const newEnd = new Date(panStartDomain[1].getTime() - timeDiff);
                        
                        const originalStart = originalXDomain![0];
                        const originalEnd = originalXDomain![1];
                        const domainWidth = panStartDomain[1].getTime() - panStartDomain[0].getTime();
                        
                        let constrainedStart = newStart;
                        let constrainedEnd = newEnd;
                        
                        if (newStart.getTime() < originalStart.getTime()) {
                            constrainedStart = originalStart;
                            constrainedEnd = new Date(originalStart.getTime() + domainWidth);
                        } else if (newEnd.getTime() > originalEnd.getTime()) {
                            constrainedEnd = originalEnd;
                            constrainedStart = new Date(originalEnd.getTime() - domainWidth);
                        }
                        
                        currentXDomain = [constrainedStart, constrainedEnd];
                        drawChart();
                    };
                    
                    const handlePanEnd = () => {
                        isPanning = false;
                        panStart = null;
                        panStartDomain = null;
                        svg.selectAll(".x-axis-drag-area").style("cursor", "grab");
                        
                        document.removeEventListener('mousemove', handlePanMove);
                        document.removeEventListener('mouseup', handlePanEnd);
                    };
                    
                    document.addEventListener('mousemove', handlePanMove);
                    document.addEventListener('mouseup', handlePanEnd);
                });

            xAxisGroup.style("cursor", "grab");
        }

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

        // Create line generator
        const line = d3.line<any>()
            .x(d => xScale(d.label))
            .y(d => yScale(d.value))
            .curve(d3.curveLinear);

        // Add first line (always present)
        svg.append("path")
            .datum(visibleData1)
            .attr("class", "line-1")
            .attr("fill", "none")
            .attr("stroke", lineColors[0] || chartLineStroke)
            .attr("stroke-width", chartLineStrokeWidth)
            .attr("stroke-opacity", chartLineStrokeOpacity)
            .attr("d", line);

        // Add second line if data exists
        if (isDual && dataset2.length > 0) {
            svg.append("path")
                .datum(visibleData2)
                .attr("class", "line-2")
                .attr("fill", "none")
                .attr("stroke", lineColors[1] || "#ef4444")
                .attr("stroke-width", chartLineStrokeWidth)
                .attr("stroke-opacity", chartLineStrokeOpacity)
                .attr("d", line);
        }

        // Add legend if dual mode
        // if (isDual && dataset2.length > 0) {
        //     const legend = svg.append("g")
        //         .attr("class", "legend")
        //         .attr("transform", `translate(${width - 120}, -25)`);

        //     // Legend for first line
        //     legend.append("line")
        //         .attr("x1", 0)
        //         .attr("x2", 15)
        //         .attr("y1", 0)
        //         .attr("y2", 0)
        //         .attr("stroke", lineColors[0] || chartLineStroke)
        //         .attr("stroke-width", 2);

        //     legend.append("text")
        //         .attr("x", 20)
        //         .attr("y", 0)
        //         .attr("dy", "0.35em")
        //         .style("font-size", "12px")
        //         .style("fill", chartColor)
        //         .text(userLabels[0] || "User 1");

        //     // Legend for second line
        //     legend.append("line")
        //         .attr("x1", 0)
        //         .attr("x2", 15)
        //         .attr("y1", 15)
        //         .attr("y2", 15)
        //         .attr("stroke", lineColors[1] || "#ef4444")
        //         .attr("stroke-width", 2);

        //     legend.append("text")
        //         .attr("x", 20)
        //         .attr("y", 15)
        //         .attr("dy", "0.35em")
        //         .style("font-size", "12px")
        //         .style("fill", chartColor)
        //         .text(userLabels[1] || "User 2");
        // }

        // Tooltip elements
        const tooltipLine = svg.append("line")
            .attr("class", "tooltip-line")
            .style("opacity", 0);

        // Selection rectangle for zooming
        const selectionRect = svg.append("rect")
            .attr("class", "selection-rect")
            .attr("fill", "rgba(70, 130, 180, 0.3)")
            .attr("stroke", "rgba(70, 130, 180, 0.8)")
            .attr("stroke-width", 1)
            .style("opacity", 0);

        // Mouse interaction
        const bisectDate = d3.bisector((d: any) => d.label).left;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .style("cursor", isZoomed ? "default" : "crosshair")
            .on("mousedown", function(event) {
                if (isPanning) return;
                
                event.preventDefault();
                const [mouseX] = d3.pointer(event);
                isSelecting = true;
                selectionStart = mouseX;
                
                hideTooltip();
            })
            .on("mousemove", function(event) {
                const [mouseX] = d3.pointer(event);
                
                if (isSelecting && selectionStart !== null) {
                    const x = Math.min(selectionStart, mouseX);
                    const width = Math.abs(mouseX - selectionStart);
                    
                    selectionRect
                        .attr("x", x)
                        .attr("y", 0)
                        .attr("width", width)
                        .attr("height", height)
                        .style("opacity", 1);
                } else if (!isPanning) {
                    const x0 = xScale.invert(mouseX);
                    
                    // Find closest data points for both datasets
                    const i1 = bisectDate(visibleData1, x0, 1);
                    const d0_1 = visibleData1[i1 - 1];
                    const d1_1 = visibleData1[i1];
                    const d1 = d1_1 && (x0.getTime() - d0_1?.label.getTime() > d1_1.label.getTime() - x0.getTime()) ? d1_1 : d0_1;

                    let d2 = null;
                    if (isDual && visibleData2.length > 0) {
                        const i2 = bisectDate(visibleData2, x0, 1);
                        const d0_2 = visibleData2[i2 - 1];
                        const d1_2 = visibleData2[i2];
                        d2 = d1_2 && (x0.getTime() - d0_2?.label.getTime() > d1_2.label.getTime() - x0.getTime()) ? d1_2 : d0_2;
                    }

                    if (d1 || d2) {
                        showTooltip(event, d1, d2, mouseX);
                    }
                }
            })
            .on("mouseup", function(event) {
                if (isSelecting && selectionStart !== null) {
                    const [mouseX] = d3.pointer(event);
                    const minX = Math.min(selectionStart, mouseX);
                    const maxX = Math.max(selectionStart, mouseX);
                    
                    if (Math.abs(maxX - minX) > 10) {
                        const newDomain: [Date, Date] = [
                            xScale.invert(minX),
                            xScale.invert(maxX)
                        ];
                        
                        currentXDomain = newDomain;
                        drawChart();
                    }
                    
                    isSelecting = false;
                    selectionStart = null;
                    selectionRect.style("opacity", 0);
                }
            })
            .on("mouseout", function() {
                if (!isSelecting && !isPanning) {
                    hideTooltip();
                }
            })
            .on("dblclick", function() {
                if (originalXDomain) {
                    currentXDomain = [...originalXDomain];
                    drawChart();
                }
            });

        // Handle mouse up outside the chart area
        d3.select("body").on("mouseup.chart", function() {
            if (isSelecting) {
                isSelecting = false;
                selectionStart = null;
                selectionRect.style("opacity", 0);
            }
            if (isPanning) {
                isPanning = false;
                panStart = null;
                panStartDomain = null;
                svg.selectAll(".x-axis-drag-area").style("cursor", "grab");
            }
        });

        function showTooltip(event: MouseEvent, d1: any, d2: any, xPos: number) {
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

            // Show tooltip circles
            svg.selectAll(".tooltip-circle").remove();
            
            if (d1) {
                svg.append("circle")
                    .attr("class", "tooltip-circle")
                    .attr("cx", xScale(d1.label))
                    .attr("cy", yScale(d1.value))
                    .attr("r", tooltipCircleRadius)
                    .attr("fill", lineColors[0] || tooltipCircleFill)
                    .attr("fill-opacity", tooltipCircleOpacity);
            }

            if (d2) {
                svg.append("circle")
                    .attr("class", "tooltip-circle")
                    .attr("cx", xScale(d2.label))
                    .attr("cy", yScale(d2.value))
                    .attr("r", tooltipCircleRadius)
                    .attr("fill", lineColors[1] || "#ef4444")
                    .attr("fill-opacity", tooltipCircleOpacity);
            }

            // Format tooltip content
            const formatValue = (d: any) => 
                yAxisLabel === "total_ms_played"
                    ? `${d.value.toFixed(2)} Hours`
                    : `${Math.round(d.value)} plays`;

            const formatDate = (d: any) => {
                if (xAxisLabel === "date") return d3.timeFormat("%Y-%m-%d")(new Date(d.date));
                if (xAxisLabel === "month") return d3.timeFormat("%Y-%m")(new Date(d.month));
                if (xAxisLabel === "year") return d3.timeFormat("%Y")(new Date(d.year));
                if (xAxisLabel === "weekday") return d3.timeFormat("%A")(new Date(d.weekday));
                return d[xAxisLabel] ?? "";
            };

            let tooltipContent = "";
            
            if (d1 && d2) {
                // Both datasets have data at this point
                tooltipContent = `
                    <div style="margin-bottom: 8px;">${formatDate(d1)}</div>
                    <div style="color: ${lineColors[0] || chartLineStroke};">
                        <strong>${userLabels[0] || "User 1"}:</strong> ${formatValue(d1)}
                    </div>
                    <div style="color: ${lineColors[1] || "#ef4444"};">
                        <strong>${userLabels[1] || "User 2"}:</strong> ${formatValue(d2)}
                    </div>
                `;
            } else if (d1) {
                // Only first dataset has data
                tooltipContent = `
                    <div style="margin-bottom: 4px;">${formatDate(d1)}</div>
                    <div style="color: ${lineColors[0] || chartLineStroke};">
                        <strong>${userLabels[0] || "User 1"}:</strong> ${formatValue(d1)}
                    </div>
                `;
            } else if (d2) {
                // Only second dataset has data
                tooltipContent = `
                    <div style="margin-bottom: 4px;">${formatDate(d2)}</div>
                    <div style="color: ${lineColors[1] || "#ef4444"};">
                        <strong>${userLabels[1] || "User 2"}:</strong> ${formatValue(d2)}
                    </div>
                `;
            }

            tooltip
                .style("opacity", 1)
                .html(tooltipContent);

            const tooltipNode = tooltip.node() as HTMLElement;
            const tooltipRect = tooltipNode.getBoundingClientRect();
            
            let left = event.clientX + 15;
            let top = event.clientY - 15;

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
        d3.select("body").on("mouseup.chart", null);
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
        if (processedData().dataset1.length > 0) {
            drawChart();
        }
    });
</script>

<div bind:this={chartContainer} class="chart-container w-full h-full">
    <svg bind:this={chartSvg} class="w-full"></svg>
</div>