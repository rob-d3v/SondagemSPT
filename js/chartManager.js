// Chart Manager - Handles the SPT chart generation
export class ChartManager {
    constructor() {
        this.chart = null;
    }
    
    generateSptChart(sptData, chartContainer) {
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Clear the container
        chartContainer.innerHTML = '';
        
        // Prepare data for the chart
        const depths = sptData.map(data => data.depth);
        const golpesInicial = sptData.map(data => data.golpesInicial);
        const golpesFinal = sptData.map(data => data.golpesFinal);
        
        // Create canvas element for the chart
        const canvas = document.createElement('canvas');
        canvas.id = 'spt-chart';
        chartContainer.appendChild(canvas);
        
        // Create the chart - Note: This is a horizontally inverted chart to match the geological report format
        const ctx = canvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: depths,
                datasets: [
                    {
                        label: 'Golpes Inicial',
                        data: golpesInicial,
                        borderColor: 'rgba(255, 0, 0, 1)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false
                    },
                    {
                        label: 'Golpes Final',
                        data: golpesFinal,
                        borderColor: 'rgba(0, 0, 255, 1)',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false
                    }
                ]
            },
            options: {
                indexAxis: 'y', // Use horizontal bar chart
                scales: {
                    y: {
                        reverse: true, // Reverse the y-axis to show depth increasing downward
                        title: {
                            display: true,
                            text: 'Profundidade (m)'
                        },
                        beginAtZero: false
                    },
                    x: {
                        position: 'top', // Place the x-axis at the top
                        min: 0,
                        max: 60, // Standard SPT values usually go up to about 60
                        title: {
                            display: true,
                            text: 'Número de Golpes'
                        },
                        grid: {
                            display: true,
                            drawTicks: true,
                            drawOnChartArea: true
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Profundidade: ' + tooltipItems[0].label + 'm';
                            }
                        }
                    }
                },
                maintainAspectRatio: false,
                responsive: true
            }
        });
        
        return this.chart;
    }
    
    // Method to get the chart data for PDF generation
    getChartDataUrl() {
        if (this.chart) {
            return this.chart.toBase64Image();
        }
        return null;
    }
    
    // Generate a static SVG version of the chart for PDF reports
    generateStaticSptChart(sptData, finalDepth) {
        // Prepare SVG for the SPT chart that matches the format in the example
        // This will be a grid with depth on the y-axis and SPT values on the x-axis
        
        const svgWidth = 400;
        const svgHeight = 30 * finalDepth; // Height based on number of depth levels
        
        let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Draw background grid
        svg += `<g class="grid">`;
        // Vertical grid lines (for SPT values at intervals of 10)
        for (let i = 0; i <= 60; i += 10) {
            const x = (i / 60) * svgWidth;
            svg += `<line x1="${x}" y1="0" x2="${x}" y2="${svgHeight}" stroke="#ddd" stroke-width="1" />`;
        }
        
        // Horizontal grid lines (for each depth)
        for (let i = 0; i <= finalDepth; i++) {
            const y = (i / finalDepth) * svgHeight;
            svg += `<line x1="0" y1="${y}" x2="${svgWidth}" y2="${y}" stroke="#ddd" stroke-width="1" />`;
        }
        svg += `</g>`;
        
        // Draw axes labels
        svg += `<g class="labels">`;
        // X-axis labels (SPT values)
        for (let i = 0; i <= 60; i += 10) {
            const x = (i / 60) * svgWidth;
            svg += `<text x="${x}" y="15" text-anchor="middle" font-size="12">${i}</text>`;
        }
        
        // Y-axis labels (depths)
        for (let i = 0; i <= finalDepth; i++) {
            const y = (i / finalDepth) * svgHeight;
            svg += `<text x="10" y="${y + 15}" text-anchor="start" font-size="12">${i}m</text>`;
        }
        svg += `</g>`;
        
        // Draw the SPT data lines
        if (sptData && sptData.length > 0) {
            // Initial golpes line (red)
            let initialLine = `<path d="M`;
            sptData.forEach((data, index) => {
                const x = (data.golpesInicial / 60) * svgWidth;
                const y = (data.depth / finalDepth) * svgHeight;
                if (index === 0) {
                    initialLine += `${x},${y}`;
                } else {
                    initialLine += ` L${x},${y}`;
                }
            });
            initialLine += `" stroke="red" stroke-width="2" fill="none" />`;
            svg += initialLine;
            
            // Final golpes line (blue)
            let finalLine = `<path d="M`;
            sptData.forEach((data, index) => {
                const x = (data.golpesFinal / 60) * svgWidth;
                const y = (data.depth / finalDepth) * svgHeight;
                if (index === 0) {
                    finalLine += `${x},${y}`;
                } else {
                    finalLine += ` L${x},${y}`;
                }
            });
            finalLine += `" stroke="blue" stroke-width="2" fill="none" />`;
            svg += finalLine;
            
            // Draw points
            sptData.forEach(data => {
                const xInitial = (data.golpesInicial / 60) * svgWidth;
                const xFinal = (data.golpesFinal / 60) * svgWidth;
                const y = (data.depth / finalDepth) * svgHeight;
                
                svg += `<circle cx="${xInitial}" cy="${y}" r="3" fill="red" />`;
                svg += `<circle cx="${xFinal}" cy="${y}" r="3" fill="blue" />`;
            });
        }
        
        svg += `</svg>`;
        
        return svg;
    }
}
