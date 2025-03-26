// SPT Data Manager - Handles SPT data entry and management
export class SptDataManager {
    constructor() {
        this.tableBody = document.getElementById('spt-table-body');
        this.waterLevel = null;
    }
    
    generateDepthRows(finalDepth) {
        // Clear existing rows
        this.tableBody.innerHTML = '';
        
        // Generate rows for each meter depth
        for (let depth = 1; depth <= finalDepth; depth++) {
            this.addDepthRow(depth);
        }
    }
    
    addDepthRow(depth) {
        // Create new row for the given depth
        const row = document.createElement('tr');
        row.dataset.depth = depth;
        
        // Set the water level indicator if needed
        const isWaterLevel = this.waterLevel && 
            (depth - 1 <= this.waterLevel && depth > this.waterLevel);
        
        // Calculate the sample number (related to depth)
        const sampleNumber = depth - 1;
        
        row.innerHTML = `
            <td>${depth.toFixed(2)} ${isWaterLevel ? '<span class="water-level-indicator">água</span>' : ''}</td>
            <td class="cota">${(depth * 0.95 + 0.5).toFixed(2)}</td>
            <td class="amostra-number">${sampleNumber}</td>
            <td><input type="number" class="golpes-inicial" min="0" max="100"></td>
            <td><input type="number" class="golpes-final" min="0" max="100"></td>
        `;
        
        this.tableBody.appendChild(row);
    }
    
    setWaterLevel(waterLevel) {
        this.waterLevel = waterLevel;
        
        // Update the water level indicator in the table
        const rows = this.tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const depth = parseFloat(row.dataset.depth);
            const depthCell = row.querySelector('td:first-child');
            
            // Check if this row should show the water level
            const isWaterLevel = this.waterLevel && 
                (depth - 1 <= this.waterLevel && depth > this.waterLevel);
            
            // Update the cell content
            if (isWaterLevel) {
                if (!depthCell.querySelector('.water-level-indicator')) {
                    depthCell.innerHTML = `${depth.toFixed(2)} <span class="water-level-indicator">água</span>`;
                }
            } else {
                depthCell.innerHTML = `${depth.toFixed(2)}`;
            }
        });
    }
    
    getSptData() {
        // Get all SPT data from the table
        const sptData = [];
        const rows = this.tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const depth = parseFloat(row.dataset.depth);
            const cota = parseFloat(row.querySelector('.cota').textContent);
            const amostra = parseInt(row.querySelector('.amostra-number').textContent);
            const golpesInicial = parseInt(row.querySelector('.golpes-inicial').value) || 0;
            const golpesFinal = parseInt(row.querySelector('.golpes-final').value) || 0;
            
            sptData.push({
                depth,
                cota,
                amostra,
                golpesInicial,
                golpesFinal,
                hasWaterLevel: depth - 1 <= this.waterLevel && depth > this.waterLevel
            });
        });
        
        return sptData;
    }
    
    loadSptData(sptData) {
        if (!sptData || !Array.isArray(sptData) || sptData.length === 0) {
            return;
        }
        
        // Clear existing rows
        this.tableBody.innerHTML = '';
        
        // Get the maximum depth to ensure all rows are generated
        const maxDepth = Math.max(...sptData.map(data => data.depth));
        
        // Generate rows for each depth
        for (let depth = 1; depth <= maxDepth; depth++) {
            this.addDepthRow(depth);
        }
        
        // Fill the data
        const rows = this.tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const depth = parseFloat(row.dataset.depth);
            const dataRow = sptData.find(data => data.depth === depth);
            
            if (dataRow) {
                row.querySelector('.golpes-inicial').value = dataRow.golpesInicial;
                row.querySelector('.golpes-final').value = dataRow.golpesFinal;
            }
        });
        
        // Set water level if available
        const waterLevelRow = sptData.find(data => data.hasWaterLevel);
        if (waterLevelRow) {
            this.setWaterLevel(waterLevelRow.depth - 0.5); // Approximate the water level
        }
    }
}
