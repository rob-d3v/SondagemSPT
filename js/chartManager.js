// Chart Manager - Handles chart generation for SPT data
export class ChartManager {
    constructor() {
        this.chart = null;
    }
    
    generateSptChart(sptData, container) {
        // Clear previous chart
        container.innerHTML = '';
        
        if (!sptData || sptData.length === 0) {
            container.innerHTML = '<p>Sem dados para exibir</p>';
            return;
        }
        
        // Create chart grid and lines using native DOM methods instead of d3
        this.createChartGrid(container, sptData);
        this.drawDataLines(container, sptData);
        
        // Add water level indicator if present
        const waterLevelData = sptData.find(d => d.hasWaterLevel);
        if (waterLevelData) {
            this.addWaterLevelIndicator(container, waterLevelData, sptData.length);
        }
    }

    createChartGrid(container, sptData) {
        // Criar o container de grade
        const gridContainer = document.createElement('div');
        gridContainer.className = 'chart-grid-container';
        
        // Determinar o número máximo de golpes para escala
        const maxGolpes = this.getMaxGolpes(sptData);
        const gridColumns = Math.min(Math.ceil(maxGolpes / 5) + 1, 11); // Limitar a 11 colunas (0-50 golpes)
        
        // Criar cabeçalho com números de golpes
        const headerRow = document.createElement('div');
        headerRow.className = 'grid-header-row';
        
        for (let i = 0; i < gridColumns; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-header-cell';
            headerCell.textContent = i * 5;
            headerRow.appendChild(headerCell);
        }
        
        gridContainer.appendChild(headerRow);
        
        // Criar linhas de grade para cada profundidade
        sptData.forEach((data, index) => {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            gridRow.dataset.depth = data.depth;
            
            // Adicionar células para cada coluna
            for (let i = 0; i < gridColumns; i++) {
                const gridCell = document.createElement('div');
                gridCell.className = 'grid-cell';
                gridRow.appendChild(gridCell);
            }
            
            // Adicionar informações de profundidade
            const depthLabel = document.createElement('div');
            depthLabel.className = 'depth-label';
            depthLabel.textContent = data.depth.toFixed(2) + 'm';
            gridRow.appendChild(depthLabel);
            
            gridContainer.appendChild(gridRow);
        });
        
        container.appendChild(gridContainer);
        
        // Add CSS to container
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        
        // Add CSS for grid
        const style = document.createElement('style');
        style.textContent = `
            .chart-grid-container {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                position: relative;
            }
            .grid-header-row {
                display: flex;
                height: 20px;
                border-bottom: 1px solid #ccc;
            }
            .grid-header-cell {
                flex: 1;
                text-align: center;
                font-size: 10px;
                border-right: 1px solid #eee;
            }
            .grid-row {
                display: flex;
                flex: 1;
                position: relative;
                border-bottom: 1px solid #eee;
            }
            .grid-cell {
                flex: 1;
                border-right: 1px solid #eee;
            }
            .depth-label {
                position: absolute;
                left: -40px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 10px;
            }
            .chart-lines {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .water-level-line {
                position: absolute;
                left: 0;
                width: 100%;
                border-top: 2px dashed blue;
                z-index: 10;
            }
            .water-level-label {
                position: absolute;
                left: 5px;
                color: blue;
                font-size: 10px;
                z-index: 11;
            }
        `;
        document.head.appendChild(style);
    }

    drawDataLines(container, sptData) {
        // Criar SVG para as linhas
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chart-lines');
        svg.style.position = 'absolute';
        svg.style.top = '20px'; // Ajustar para o cabeçalho
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = 'calc(100% - 20px)'; // Ajustar para o cabeçalho
        svg.style.pointerEvents = 'none';
        
        // Determinar escala
        const maxGolpes = this.getMaxGolpes(sptData);
        const gridColumns = Math.min(Math.ceil(maxGolpes / 5) + 1, 11);
        
        // Altura de cada linha
        const rowHeight = 100 / sptData.length;
        
        // Criar pontos para linha inicial (azul)
        const inicialPoints = [];
        sptData.forEach((data, index) => {
            if (data.golpesInicial > 0) {
                const x = (data.golpesInicial / ((gridColumns - 1) * 5)) * 100;
                const y = (index * rowHeight) + (rowHeight / 2);
                inicialPoints.push({ x, y });
            }
        });
        
        // Criar pontos para linha final (vermelha)
        const finalPoints = [];
        sptData.forEach((data, index) => {
            if (data.golpesFinal > 0) {
                const x = (data.golpesFinal / ((gridColumns - 1) * 5)) * 100;
                const y = (index * rowHeight) + (rowHeight / 2);
                finalPoints.push({ x, y });
            }
        });
        
        // Desenhar linha inicial (azul)
        if (inicialPoints.length > 1) {
            const inicialLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            inicialLine.setAttribute('points', inicialPoints.map(p => `${p.x}%,${p.y}%`).join(' '));
            inicialLine.setAttribute('fill', 'none');
            inicialLine.setAttribute('stroke', 'blue');
            inicialLine.setAttribute('stroke-width', '2');
            svg.appendChild(inicialLine);
            
            // Adicionar pontos
            inicialPoints.forEach(point => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', `${point.x}%`);
                circle.setAttribute('cy', `${point.y}%`);
                circle.setAttribute('r', '3');
                circle.setAttribute('fill', 'blue');
                svg.appendChild(circle);
            });
        }
        
        // Desenhar linha final (vermelha)
        if (finalPoints.length > 1) {
            const finalLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            finalLine.setAttribute('points', finalPoints.map(p => `${p.x}%,${p.y}%`).join(' '));
            finalLine.setAttribute('fill', 'none');
            finalLine.setAttribute('stroke', 'red');
            finalLine.setAttribute('stroke-width', '2');
            svg.appendChild(finalLine);
            
            // Adicionar pontos
            finalPoints.forEach(point => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', `${point.x}%`);
                circle.setAttribute('cy', `${point.y}%`);
                circle.setAttribute('r', '3');
                circle.setAttribute('fill', 'red');
                svg.appendChild(circle);
            });
        }
        
        container.appendChild(svg);
    }

    addWaterLevelIndicator(container, waterLevelData, totalRows) {
        // Calcular a posição vertical do nível d'água
        const rowHeight = 100 / totalRows;
        let waterLevelIndex = 0;
        
        // Encontrar o índice da linha mais próxima da profundidade do nível d'água
        for (let i = 0; i < totalRows; i++) {
            if (i * 1.0 >= waterLevelData.depth) {
                waterLevelIndex = i;
                break;
            }
        }
        
        const waterLevelPosition = (waterLevelIndex * rowHeight) + 20; // +20px para o cabeçalho
        
        // Criar linha de nível d'água
        const waterLevelLine = document.createElement('div');
        waterLevelLine.className = 'water-level-line';
        waterLevelLine.style.top = `${waterLevelPosition}px`;
        
        // Criar rótulo de nível d'água
        const waterLevelLabel = document.createElement('div');
        waterLevelLabel.className = 'water-level-label';
        waterLevelLabel.textContent = `N.A. ${waterLevelData.depth.toFixed(2)}m`;
        waterLevelLabel.style.top = `${waterLevelPosition - 15}px`;
        
        container.appendChild(waterLevelLine);
        container.appendChild(waterLevelLabel);
    }

    getMaxGolpes(sptData) {
        let max = 0;
        sptData.forEach(data => {
            max = Math.max(max, data.golpesInicial || 0, data.golpesFinal || 0);
        });
        return Math.max(max, 40); // Mínimo de 40 para garantir escala adequada
    }
}
