// Soil Layer Manager - Handles adding and managing soil layers
export class SoilLayerManager {
    constructor() {
        this.layersContainer = document.getElementById('soil-layers-container');
        this.layers = [];
    }
    
    addLayer() {
        // Create a new layer element
        const layerDiv = document.createElement('div');
        layerDiv.className = 'soil-layer';
        
        // Set the layer starting depth based on the previous layer's end depth
        let startDepth = 0;
        if (this.layers.length > 0) {
            const lastLayer = this.layersContainer.querySelector('.soil-layer:last-child');
            const lastEndDepth = lastLayer.querySelector('.layer-depth-end').value;
            startDepth = parseFloat(lastEndDepth) || 0;
        }
        
        // Create the form content
        layerDiv.innerHTML = `
            <div class="form-group">
                <label>Profundidade inicial (m):</label>
                <input type="number" class="layer-depth-start" step="0.01" value="${startDepth}" readonly>
            </div>
            <div class="form-group">
                <label>Profundidade final (m):</label>
                <input type="number" class="layer-depth-end" step="0.01" value="${startDepth + 1}">
            </div>
            <div class="form-group">
                <label>Descrição da camada:</label>
                <textarea class="layer-description"></textarea>
            </div>
            ${this.layers.length > 0 ? '<button class="btn remove-layer">Remover Camada</button>' : ''}
        `;
        
        // Add the layer to the DOM
        this.layersContainer.appendChild(layerDiv);
        
        // Add event listener for the remove button
        const removeButton = layerDiv.querySelector('.remove-layer');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                this.removeLayer(e.target.closest('.soil-layer'));
            });
        }
        
        // Add event listener for depth changes
        const endDepthInput = layerDiv.querySelector('.layer-depth-end');
        endDepthInput.addEventListener('change', () => {
            this.updateLayerDepths();
        });
        
        // Add the layer to the layers array
        this.layers.push(layerDiv);
        
        return layerDiv;
    }
    
    removeLayer(layerElement) {
        // Remove the layer from the DOM
        this.layersContainer.removeChild(layerElement);
        
        // Remove the layer from the layers array
        this.layers = Array.from(this.layersContainer.querySelectorAll('.soil-layer'));
        
        // Update the depths of the remaining layers
        this.updateLayerDepths();
    }
    
    updateLayerDepths() {
        // Update the starting depths of all layers based on the ending depth of the previous layer
        const layers = this.layersContainer.querySelectorAll('.soil-layer');
        
        for (let i = 1; i < layers.length; i++) {
            const prevLayer = layers[i - 1];
            const currentLayer = layers[i];
            
            const prevEndDepth = parseFloat(prevLayer.querySelector('.layer-depth-end').value) || 0;
            currentLayer.querySelector('.layer-depth-start').value = prevEndDepth;
        }
    }
    
    getLayersData() {
        // Get the data for all layers
        const layersData = [];
        const layers = this.layersContainer.querySelectorAll('.soil-layer');
        
        layers.forEach(layer => {
            const startDepth = parseFloat(layer.querySelector('.layer-depth-start').value) || 0;
            const endDepth = parseFloat(layer.querySelector('.layer-depth-end').value) || 0;
            const description = layer.querySelector('.layer-description').value || '';
            
            layersData.push({
                startDepth,
                endDepth,
                description
            });
        });
        
        return layersData;
    }
}
