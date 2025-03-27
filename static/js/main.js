document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const soilLayersContainer = document.getElementById('soil-layers-container');
    const sptDataContainer = document.getElementById('spt-data-container');
    const addSoilLayerBtn = document.getElementById('add-soil-layer-btn');
    const addSptDataBtn = document.getElementById('add-spt-data-btn');
    const previewBtn = document.getElementById('preview-btn');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const previewContainer = document.getElementById('preview-container');
    const sptForm = document.getElementById('spt-form');
    
    // Add event listeners
    if (addSoilLayerBtn) addSoilLayerBtn.addEventListener('click', addSoilLayer);
    if (addSptDataBtn) addSptDataBtn.addEventListener('click', addSptData);
    if (previewBtn) previewBtn.addEventListener('click', generatePreview);
    if (generatePdfBtn) generatePdfBtn.addEventListener('click', generatePdf);
    
    // Add soil layer and corresponding SPT data
    function addSoilLayer() {
        const layerCount = soilLayersContainer.querySelectorAll('.soil-layer-item').length;
        
        // Determine initial depth based on previous layer's end depth
        let initialDepth = 0;
        if (layerCount > 0) {
            const lastLayer = soilLayersContainer.querySelectorAll('.soil-layer-item')[layerCount - 1];
            const lastEndDepth = lastLayer.querySelector('.soil-layer-end-depth').value;
            initialDepth = lastEndDepth ? parseFloat(lastEndDepth) : 0;
        }
        
        const layerHtml = `
            <div class="soil-layer-item card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Camada <span class="layer-number">${layerCount + 1}</span></h5>
                    <button type="button" class="btn btn-danger btn-sm remove-soil-layer-btn">Remover</button>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Profundidade Inicial (m)</label>
                            <input type="number" step="0.01" class="form-control soil-layer-start-depth" value="${initialDepth}" readonly>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Profundidade Final (m)</label>
                            <input type="number" step="0.01" class="form-control soil-layer-end-depth" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-control soil-layer-description" rows="2"></textarea>
                    </div>
                </div>
            </div>
        `;
        
        soilLayersContainer.insertAdjacentHTML('beforeend', layerHtml);
        
        // Add remove event listener to the new button
        const newLayer = soilLayersContainer.lastElementChild;
        const removeBtn = newLayer.querySelector('.remove-soil-layer-btn');
        removeBtn.addEventListener('click', function() {
            newLayer.remove();
            updateSoilLayerNumbers();
            
            // Also remove corresponding SPT data
            const sptItems = sptDataContainer.querySelectorAll('.spt-data-item');
            if (sptItems.length > layerCount) {
                sptItems[layerCount].remove();
                updateSptDataNumbers();
            }
        });
        
        // Add event listener to end depth to update next layer's start depth
        const endDepthInput = newLayer.querySelector('.soil-layer-end-depth');
        endDepthInput.addEventListener('change', function() {
            // Update start depths for all layers
            const layerItems = soilLayersContainer.querySelectorAll('.soil-layer-item');
            for (let i = 1; i < layerItems.length; i++) {
                const prevLayer = layerItems[i-1];
                const currentLayer = layerItems[i];
                
                const prevEndDepth = prevLayer.querySelector('.soil-layer-end-depth').value;
                if (prevEndDepth) {
                    currentLayer.querySelector('.soil-layer-start-depth').value = prevEndDepth;
                }
            }
            
            // Also update the corresponding SPT data point depth
            const sptItems = sptDataContainer.querySelectorAll('.spt-data-item');
            const layerIndex = Array.from(layerItems).indexOf(newLayer);
            if (layerIndex >= 0 && layerIndex < sptItems.length) {
                const sptItem = sptItems[layerIndex];
                const depthInput = sptItem.querySelector('.spt-data-depth');
                if (depthInput) {
                    depthInput.value = endDepthInput.value;
                }
            }
        });
        
        // Automatically add corresponding SPT data
        addSptData(true);
    }
    
    // Add SPT data
    function addSptData(isAutomatic = false) {
        const dataCount = sptDataContainer.querySelectorAll('.spt-data-item').length;
        
        // If adding manually and there are already more SPT points than soil layers, don't add more
        if (!isAutomatic) {
            const layerCount = soilLayersContainer.querySelectorAll('.soil-layer-item').length;
            if (dataCount >= layerCount) {
                alert('Você precisa adicionar uma camada de solo antes de adicionar mais dados SPT.');
                return;
            }
        }
        
        // Get the corresponding soil layer data
        const layerItems = soilLayersContainer.querySelectorAll('.soil-layer-item');
        let startDepth = 0;
        let endDepth = 0;
        
        if (dataCount < layerItems.length) {
            const layer = layerItems[dataCount];
            startDepth = parseFloat(layer.querySelector('.soil-layer-start-depth').value || 0);
            endDepth = parseFloat(layer.querySelector('.soil-layer-end-depth').value || 0);
        }
        
        const dataHtml = `
            <div class="spt-data-item card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Ponto <span class="data-number">${dataCount + 1}</span></h5>
                    <button type="button" class="btn btn-danger btn-sm remove-spt-data-btn">Remover</button>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Profundidade (m) - Automático</label>
                            <input type="number" step="0.01" class="form-control spt-data-depth" value="${endDepth}" readonly>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Amostra - Automático</label>
                            <input type="text" class="form-control spt-data-amostra" value="${dataCount + 1}" readonly>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Golpes Inicial</label>
                            <input type="number" class="form-control spt-data-golpes-inicial" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Golpes Final</label>
                            <input type="number" class="form-control spt-data-golpes-final" required>
                        </div>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input spt-data-has-water-level" type="checkbox" value="">
                        <label class="form-check-label">
                            Nível d'água nesta profundidade
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        sptDataContainer.insertAdjacentHTML('beforeend', dataHtml);
        
        // Add remove event listener to the new button
        const newData = sptDataContainer.lastElementChild;
        const removeBtn = newData.querySelector('.remove-spt-data-btn');
        removeBtn.addEventListener('click', function() {
            // Don't allow removing if it would leave fewer SPT points than soil layers
            const layerCount = soilLayersContainer.querySelectorAll('.soil-layer-item').length;
            const dataCount = sptDataContainer.querySelectorAll('.spt-data-item').length;
            
            if (dataCount <= layerCount) {
                alert('Você não pode remover este ponto SPT porque cada camada de solo precisa ter pelo menos um ponto SPT correspondente.');
                return;
            }
            
            newData.remove();
            updateSptDataNumbers();
        });
    }
    
    // Update soil layer numbers
    function updateSoilLayerNumbers() {
        const layerItems = soilLayersContainer.querySelectorAll('.soil-layer-item');
        layerItems.forEach((item, index) => {
            item.querySelector('.layer-number').textContent = index + 1;
        });
    }
    
    // Update SPT data numbers
    function updateSptDataNumbers() {
        const dataItems = sptDataContainer.querySelectorAll('.spt-data-item');
        dataItems.forEach((item, index) => {
            item.querySelector('.data-number').textContent = index + 1;
        });
    }
    
    // Collect form data
    function collectFormData() {
        // General form data
        const formData = {};
        if (sptForm) {
            const formElements = sptForm.elements;
            
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                if (element && element.name && element.name !== '') {
                    formData[element.name] = element.value;
                }
            }
        }
        
        // Soil layers data
        const soilLayers = [];
        if (soilLayersContainer) {
            const layerItems = soilLayersContainer.querySelectorAll('.soil-layer-item');
            
            layerItems.forEach(item => {
                if (item) {
                    const startDepthElement = item.querySelector('.soil-layer-start-depth');
                    const endDepthElement = item.querySelector('.soil-layer-end-depth');
                    const descriptionElement = item.querySelector('.soil-layer-description');
                    
                    // Check if elements exist before accessing their values
                    const startDepth = startDepthElement ? startDepthElement.value : "0";
                    const endDepth = endDepthElement ? endDepthElement.value : "0";
                    const description = descriptionElement ? descriptionElement.value : "";
                    
                    soilLayers.push({
                        start_depth: startDepth,
                        end_depth: endDepth,
                        description: description
                    });
                }
            });
        }
        
        // SPT data - ensure one-to-one mapping with soil layers
        const sptData = [];
        if (sptDataContainer) {
            const dataItems = sptDataContainer.querySelectorAll('.spt-data-item');
            
            // First, create an array with the same length as soil layers
            for (let i = 0; i < soilLayers.length; i++) {
                sptData.push({
                    depth: soilLayers[i].end_depth,
                    amostra: (i + 1).toString(),
                    golpes_inicial: "0",
                    golpes_final: "0",
                    has_water_level: false
                });
            }
            
            // Then fill in the actual SPT data where available
            dataItems.forEach((item, index) => {
                if (item && index < sptData.length) {
                    const golpesInicialElement = item.querySelector('.spt-data-golpes-inicial');
                    const golpesFinalElement = item.querySelector('.spt-data-golpes-final');
                    const hasWaterLevelElement = item.querySelector('.spt-data-has-water-level');
                    
                    sptData[index].golpes_inicial = golpesInicialElement ? golpesInicialElement.value : "0";
                    sptData[index].golpes_final = golpesFinalElement ? golpesFinalElement.value : "0";
                    sptData[index].has_water_level = hasWaterLevelElement ? hasWaterLevelElement.checked : false;
                }
            });
        }
        
        return {
            formData: formData,
            soilLayers: soilLayers,
            sptData: sptData
        };
    }
    
    // Generate preview
    function generatePreview() {
        const data = collectFormData();
        
        // Show loading
        previewContainer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-3">Gerando visualização...</p>
            </div>
        `;
        
        // Send data to server
        fetch('/api/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                previewContainer.innerHTML = result.html;
            } else {
                previewContainer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Erro ao gerar visualização: ${result.error || 'Erro desconhecido'}
                    </div>
                `;
            }
        })
        .catch(error => {
            previewContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Erro ao gerar visualização: ${error.message}
                </div>
            `;
        });
    }
    
    // Generate PDF
    function generatePdf() {
        const data = collectFormData();
        
        // Show loading
        previewContainer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Gerando PDF...</span>
                </div>
                <p class="mt-3">Gerando PDF...</p>
            </div>
        `;
        
        // Send data to server
        fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Show success message and download link
                previewContainer.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        PDF gerado com sucesso!
                    </div>
                    <div class="text-center mb-3">
                        <a href="/download-pdf/${result.pdfPath}" class="btn btn-primary" download>
                            <i class="bi bi-download"></i> Baixar PDF
                        </a>
                    </div>
                    <div class="pdf-preview">
                        <iframe src="/download-pdf/${result.pdfPath}" width="100%" height="800" style="border: 1px solid #ddd;"></iframe>
                    </div>
                `;
            } else {
                previewContainer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Erro ao gerar PDF: ${result.error || 'Erro desconhecido'}
                    </div>
                `;
            }
        })
        .catch(error => {
            previewContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Erro ao gerar PDF: ${error.message}
                </div>
            `;
        });
    }
    
    // Add initial items if containers exist
    if (soilLayersContainer && soilLayersContainer.children.length === 0) {
        addSoilLayer(); // This will also add the first SPT data point
    }
});