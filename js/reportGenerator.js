// Report Generator - Generates the HTML preview of the SPT report
export class ReportGenerator {
    constructor(soilLayerManager, sptDataManager, chartManager) {
        this.soilLayerManager = soilLayerManager;
        this.sptDataManager = sptDataManager;
        this.chartManager = chartManager;
        this.previewContainer = document.getElementById('report-preview');
    }
    
    generatePreview() {
        try {
            // Get all form data
            const formData = this.collectFormData();
            console.log('Form data collected:', formData);
            
            // Get soil layers data
            const soilLayers = this.soilLayerManager.getLayersData();
            console.log('Soil layers data:', soilLayers);
            
            // Get SPT data
            const sptData = this.sptDataManager.getSptData();
            console.log('SPT data:', sptData);
            
            // Generate the HTML for the report
            const reportHtml = this.generateReportHtml(formData, soilLayers, sptData);
            
            // Update the preview container
            this.previewContainer.innerHTML = reportHtml;
            
            // Generate the SPT chart
            const chartContainer = document.getElementById('spt-chart-container');
            if (chartContainer && sptData.length > 0) {
                this.chartManager.generateSptChart(sptData, chartContainer);
            }
        } catch (error) {
            console.error('Error generating preview:', error);
            this.previewContainer.innerHTML = `<div class="error-message">Erro ao gerar visualização: ${error.message}</div>`;
        }
    }
    
    collectFormData() {
        // Helper function to safely get element value
        const getElementValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };
        
        // Coletar todos os dados do formulário com verificação de existência
        const formData = {
            companyName: getElementValue('company-name'),
            companyLocation: getElementValue('company-location'),
            companyPhone: getElementValue('company-phone'),
            reportNumber: getElementValue('report-number'),
            sptNumber: getElementValue('spt-number'),
            projectName: getElementValue('project-name'),
            elevation: getElementValue('elevation'),
            relNumber: getElementValue('rel-number'),
            location: getElementValue('location'),
            pageNumber: getElementValue('page-number'),
            clientName: getElementValue('client-name'),
            designer: getElementValue('designer'),
            surveyor: getElementValue('surveyor'),
            date: getElementValue('date') || this.getCurrentDate(),
            
            // Adicionando campos que podem estar sendo usados em outras partes do código
            laudoNumero: getElementValue('laudo-numero'),
            obra: getElementValue('obra'),
            cliente: getElementValue('cliente'),
            local: getElementValue('local'),
            nivelAgua: getElementValue('nivel-agua'),
            profundidadeFinal: getElementValue('profundidade-final'),
            observacoes: getElementValue('observacoes'),
            engenheiro: getElementValue('engenheiro'),
            crea: getElementValue('crea')
        };
        
        return formData;
    }

    getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Update the generateReportHtml method to match the requirements
    generateReportHtml(formData, soilLayers, sptData) {
        // Criar o HTML do relatório com layout conforme requisitado
        return `
            <div class="spt-report">
                <div class="report-content">
                    <!-- Coluna Camadas Detectadas com 3 subcolunas -->
                    <div class="soil-layers-section">
                        <table class="soil-layers-table">
                            <thead>
                                <tr>
                                    <th colspan="3">CAMADAS DETECTADAS</th>
                                </tr>
                                <tr>
                                    <th class="profund-col">PROFUND. (m)</th>
                                    <th class="na-col">N.A.</th>
                                    <th class="class-col">CLASSIFICAÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateSoilLayersHtml(soilLayers, sptData)}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="spt-data-section">
                        <!-- Coluna Escala das cotas e Amostra revestida -->
                        <div class="escala-container">
                            <table class="escala-table">
                                <thead>
                                    <tr>
                                        <th colspan="2">ESCALA DAS COTAS</th>
                                        <th rowspan="2" class="amostra-header">AMOSTRA REVESTIDA</th>
                                    </tr>
                                    <tr>
                                        <th>PROF.</th>
                                        <th>COTA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateSptDataHtml(sptData)}
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Coluna Camadas Detectadas com gráfico -->
                        <div class="spt-chart-section">
                            <div class="chart-header">
                                <h4>CAMADAS DETECTADAS</h4>
                            </div>
                            <div class="golpes-header">
                                <div class="golpes-header-title">GOLPES P/30cm</div>
                                <div class="golpes-labels">
                                    <span class="inicial-label">INICIAL</span>
                                    <span class="final-label">FINAL</span>
                                </div>
                            </div>
                            <div id="spt-chart-container" class="spt-chart-container">
                                <!-- O gráfico será gerado pelo JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Observações no final de camadas detectadas -->
                <div class="observations-section">
                    <p>Observação:</p>
                    <ul>
                        // <li>- Limite de sondagem ao S.P.T.</li>
                        // <li>- Profundidade atingida: ${this.getMaxDepth(sptData).toFixed(2)}m</li>
                        <li>${this.waterLevelText(sptData)}</li>
                        ${formData.observacoes ? `<li>- ${formData.observacoes}</li>` : ''}
                    </ul>
                </div>
                
                <!-- Título Perfil Geotécnico abaixo de todas as colunas -->
                <div class="report-title">
                    <h3>PERFIL GEOTÉCNICO</h3>
                </div>
                
                <!-- Cabeçalho abaixo do título -->
                <div class="report-footer">
                    <div class="company-logo">
                        <div class="logo-container">
                            <div class="logo-text">
                                <strong>ROBSON<br>COSTA</strong>
                            </div>
                        </div>
                        <div class="company-location">
                            <p>RIO VERDE GO</p>
                            <p>TEL: (64) 98406-9090</p>
                        </div>
                    </div>
                    <div class="report-info">
                        <table class="info-table">
                            <tr>
                                <td>LAUDO Nº</td>
                                <td>${formData.reportNumber || formData.laudoNumero || ''}</td>
                                <td>SONDAGEM DE SIMPLES RECONHECIMENTO</td>
                                <td>SPT:</td>
                                <td>${formData.sptNumber || ''}</td>
                            </tr>
                            <tr>
                                <td>OBRA:</td>
                                <td>${formData.projectName || formData.obra || ''}</td>
                                <td>COTA:</td>
                                <td>${formData.elevation || ''}</td>
                                <td>REL. Nº ${formData.relNumber || ''}</td>
                            </tr>
                            <tr>
                                <td>LOCAL:</td>
                                <td colspan="3">${formData.location || formData.local || ''}</td>
                                <td>FL. Nº ${formData.pageNumber || '01/03'}</td>
                            </tr>
                            <tr>
                                <td>CLIENTE:</td>
                                <td colspan="4">${formData.clientName || formData.cliente || ''}</td>
                            </tr>
                            <tr>
                                <td>DES.:</td>
                                <td>${formData.designer || ''}</td>
                                <td>SOND.:</td>
                                <td>${formData.surveyor || ''}</td>
                                <td>DATA: ${formData.date || ''}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update the generateSoilLayersHtml method to show water level
    generateSoilLayersHtml(soilLayers, sptData) {
        if (!soilLayers || soilLayers.length === 0) {
            return '<tr><td colspan="3">Nenhuma camada definida</td></tr>';
        }
        
        let html = '';
        let currentDepth = 1.0;
        
        // Find water level if exists
        const waterLevelRow = sptData.find(data => data.hasWaterLevel);
        const waterLevelDepth = waterLevelRow ? waterLevelRow.depth : null;
        
        soilLayers.forEach(layer => {
            // Adicionar linhas para cada metro de profundidade dentro desta camada
            while (currentDepth <= layer.endDepth) {
                const isWaterLevel = waterLevelDepth && Math.abs(currentDepth - waterLevelDepth) < 0.1;
                
                html += `
                    <tr>
                        <td class="depth-cell">${currentDepth.toFixed(2)}</td>
                        <td class="water-cell">${isWaterLevel ? '<span class="water-level">água</span>' : ''}</td>
                        ${currentDepth === layer.startDepth ? `<td class="description-cell" rowspan="${this.calculateRowspan(layer)}">${layer.description}</td>` : ''}
                    </tr>
                `;
                
                // Adicionar linhas horizontais a cada metro
                html += `
                    <tr class="horizontal-line">
                        <td colspan="3"></td>
                    </tr>
                `;
                
                currentDepth += 1.0;
            }
        });
        
        return html;
    }
    
    calculateRowspan(layer) {
        // Calcular quantas linhas esta camada ocupa (1 linha por metro)
        return Math.ceil(layer.endDepth - layer.startDepth);
    }
    
    isWaterLevel(depth) {
        // Verificar se esta profundidade tem nível d'água
        // Implementar lógica baseada nos dados de SPT
        return false; // Placeholder
    }
    
    waterLevelText(sptData) {
        const waterLevelRow = sptData.find(data => data.hasWaterLevel);
        
        if (waterLevelRow) {
            return `- Água com ${waterLevelRow.depth.toFixed(2)}m de profundidade`;
        }
        
        return '- Não foi encontrado nível d\'água';
    }
    
    // Update the generateSptDataHtml method to include proper columns
    generateSptDataHtml(sptData) {
        if (!sptData || sptData.length === 0) {
            return '<tr><td colspan="3">Nenhum dado SPT disponível</td></tr>';
        }
        
        let html = '';
        
        sptData.forEach((data, index) => {
            html += `
                <tr>
                    <td class="depth-cell">${data.depth.toFixed(2)}</td>
                    <td class="cota-cell">${data.cota ? data.cota.toFixed(2) : ''}</td>
                    <td class="amostra-cell">${data.amostra || (index + 1)}</td>
                </tr>
            `;
        });
        
        return html;
    }
    
    getMaxDepth(sptData) {
        if (!sptData || sptData.length === 0) {
            return 0;
        }
        
        return Math.max(...sptData.map(data => data.depth));
    }
    
    // Method for generating a simplified HTML version suitable for PDF export
    generatePdfHtml(formData, soilLayers, sptData) {
        // Similar to generateReportHtml but optimized for PDF export
        // This might include simplifications and adjustments for better PDF generation
        
        // Generate the soil layers description
        let soilLayersHtml = '';
        soilLayers.forEach(layer => {
            soilLayersHtml += `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; align-items: center;">
                        <span style="width: 50px;">${layer.startDepth.toFixed(2)}</span>
                        <span>-</span>
                        <span style="width: 50px;">${layer.endDepth.toFixed(2)}</span>
                        <span>${layer.description}</span>
                    </div>
                </div>
            `;
        });
        
        // Generate SPT data table
        let sptTableHtml = `
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #000; padding: 5px;">AMOSTRA</th>
                        <th style="border: 1px solid #000; padding: 5px;">COTA</th>
                        <th style="border: 1px solid #000; padding: 5px;">INICIAL</th>
                        <th style="border: 1px solid #000; padding: 5px;">FINAL</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sptData.forEach((data, index) => {
            sptTableHtml += `
                <tr>
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;">${data.cota.toFixed(2)}</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;">${data.golpesInicial}</td>
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;">${data.golpesFinal}</td>
                </tr>
            `;
        });
        
        sptTableHtml += `
                </tbody>
            </table>
        `;
        
        // Format the date
        const dateObj = formData.data ? new Date(formData.data) : new Date();
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        // Generate static SPT chart SVG
        const staticChartSvg = this.chartManager.generateStaticSptChart(sptData, parseFloat(formData.profundidadeFinal));
        
        // Complete HTML for PDF
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Laudo SPT - ${formData.laudoNumero}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { text-align: center; font-size: 18px; margin-bottom: 20px; }
                    .header-info { margin-bottom: 20px; }
                    .info-row { display: flex; margin-bottom: 5px; }
                    .info-label { font-weight: bold; width: 100px; }
                    .content { display: flex; }
                    .left-column { width: 50%; padding-right: 10px; }
                    .right-column { width: 50%; padding-left: 10px; }
                    .water-level { margin: 15px 0; font-weight: bold; }
                    .observations { margin-top: 20px; }
                    .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <h1>PERFIL GEOTÉCNICO</h1>
                
                <div class="header-info">
                    <div class="info-row">
                        <span class="info-label">LAUDO Nº:</span>
                        <span>${formData.laudoNumero}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">OBRA:</span>
                        <span>${formData.obra}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CLIENTE:</span>
                        <span>${formData.cliente}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">LOCAL:</span>
                        <span>${formData.local}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">DATA:</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>
                
                <div class="content">
                    <div class="left-column">
                        <h3>CAMADAS DETECTADAS</h3>
                        ${soilLayersHtml}
                        
                        <div class="water-level">
                            <p>N.A. ${formData.nivelAgua}m</p>
                        </div>
                        
                        <div class="observations">
                            <h3>Observação:</h3>
                            <p>- Profundidade atingida: ${formData.profundidadeFinal}m</p>
                            <p>- Limite de sondagem ao S.P.T.</p>
                            <p>- Água com ${formData.nivelAgua}m de profundidade.</p>
                            <p>${formData.observacoes}</p>
                        </div>
                    </div>
                    
                    <div class="right-column">
                        <h3>DADOS SPT</h3>
                        ${sptTableHtml}
                        
                        <div style="margin-top: 20px;">
                            ${staticChartSvg}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>${formData.engenheiro}</p>
                    <p>Engenheiro Civil</p>
                    <p>Crea: ${formData.crea}</p>
                </div>
            </body>
            </html>
        `;
    }
}
