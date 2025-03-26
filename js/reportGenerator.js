// Report Generator - Generates the HTML preview of the SPT report
export class ReportGenerator {
    constructor(soilLayerManager, sptDataManager, chartManager) {
        this.soilLayerManager = soilLayerManager;
        this.sptDataManager = sptDataManager;
        this.chartManager = chartManager;
        this.previewContainer = document.getElementById('report-preview');
    }
    
    generatePreview() {
        // Get all form data
        const formData = this.collectFormData();
        
        // Get soil layers data
        const soilLayers = this.soilLayerManager.getLayersData();
        
        // Get SPT data
        const sptData = this.sptDataManager.getSptData();
        
        // Generate the HTML for the report
        const reportHtml = this.generateReportHtml(formData, soilLayers, sptData);
        
        // Update the preview container
        this.previewContainer.innerHTML = reportHtml;
        
        // Generate the SPT chart
        const chartContainer = document.getElementById('spt-chart-container');
        if (chartContainer && sptData.length > 0) {
            this.chartManager.generateSptChart(sptData, chartContainer);
        }
    }
    
    collectFormData() {
        return {
            laudoNumero: document.getElementById('laudo-numero').value || '',
            obra: document.getElementById('obra').value || '',
            cliente: document.getElementById('cliente').value || '',
            local: document.getElementById('local').value || '',
            data: document.getElementById('data').value || '',
            sondador: document.getElementById('sondador').value || '',
            desenhista: document.getElementById('desenhista').value || '',
            escala: document.getElementById('escala').value || '1:100',
            cota: document.getElementById('cota').value || '',
            relNumero: document.getElementById('rel-numero').value || '',
            sptNumero: document.getElementById('spt-numero').value || '',
            flNumero: document.getElementById('fl-numero').value || '',
            engenheiro: document.getElementById('engenheiro').value || '',
            crea: document.getElementById('crea').value || '',
            nivelAgua: document.getElementById('nivel-agua').value || '',
            profundidadeFinal: document.getElementById('profundidade-final').value || '',
            observacoes: document.getElementById('observacoes').value || ''
        };
    }
    
    generateReportHtml(formData, soilLayers, sptData) {
        // Criar o HTML do relatório com layout melhorado
        return `
            <div class="spt-report">
                <div class="report-header">
                    <div class="company-info">
                        <h2>${formData.companyName || 'ROBSON COSTA'}</h2>
                        <p>${formData.companyLocation || 'RIO VERDE GO'}</p>
                        <p>TEL: ${formData.companyPhone || '(64) 98406-9090'}</p>
                    </div>
                    <div class="report-info">
                        <table class="info-table">
                            <tr>
                                <td>LAUDO Nº:</td>
                                <td>${formData.reportNumber || ''}</td>
                                <td>SONDAGEM DE SIMPLES RECONHECIMENTO</td>
                                <td>SPT:</td>
                                <td>${formData.sptNumber || ''}</td>
                            </tr>
                            <tr>
                                <td>OBRA:</td>
                                <td>${formData.projectName || ''}</td>
                                <td>COTA:</td>
                                <td>${formData.elevation || ''}</td>
                                <td>REL. Nº ${formData.relNumber || ''}</td>
                            </tr>
                            <tr>
                                <td>LOCAL:</td>
                                <td colspan="3">${formData.location || ''}</td>
                                <td>FL. Nº ${formData.pageNumber || '01/01'}</td>
                            </tr>
                            <tr>
                                <td>CLIENTE:</td>
                                <td colspan="4">${formData.clientName || ''}</td>
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
                
                <div class="report-content">
                    <h3 class="section-title">PERFIL GEOTÉCNICO</h3>
                    
                    <div class="report-body">
                        <div class="soil-layers-section">
                            <table class="soil-layers-table">
                                <thead>
                                    <tr>
                                        <th class="profund-col">PROFUND. (m)</th>
                                        <th class="na-col">N.A.</th>
                                        <th class="class-col">CLASSIFICAÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.generateSoilLayersHtml(soilLayers)}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="spt-data-section">
                            <div class="spt-table-container">
                                <table class="spt-data-table">
                                    <thead>
                                        <tr>
                                            <th colspan="2">ESCALA DAS COTAS</th>
                                            <th rowspan="2">AMOSTRA Nº</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.generateSptDataHtml(sptData)}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="spt-chart-section">
                                <h4>CAMADAS DETECTADAS</h4>
                                <div class="spt-chart-header">
                                    <div class="golpes-header">GOLPES P/30cm</div>
                                    <div class="chart-labels">
                                        <div class="inicial-label">(INICIAL)</div>
                                        <div class="final-label">(FINAL)</div>
                                    </div>
                                </div>
                                <div id="spt-chart-container" class="spt-chart-container">
                                    <!-- O gráfico será gerado pelo JavaScript -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="observations-section">
                    <h4>Observação:</h4>
                    <ul>
                        <li>Limite de sondagem ao S.P.T.</li>
                        <li>Profundidade atingida: ${this.getMaxDepth(sptData)}m</li>
                        ${this.waterLevelHtml(sptData)}
                    </ul>
                </div>
            </div>
        `;
    }
    
    generateSoilLayersHtml(soilLayers) {
        if (!soilLayers || soilLayers.length === 0) {
            return '<tr><td colspan="3">Nenhuma camada definida</td></tr>';
        }
        
        let html = '';
        
        soilLayers.forEach(layer => {
            html += `
                <tr>
                    <td class="depth-cell">${layer.startDepth.toFixed(2)}</td>
                    <td></td>
                    <td class="description-cell">${layer.description}</td>
                </tr>
            `;
        });
        
        return html;
    }
    
    generateSptDataHtml(sptData) {
        if (!sptData || sptData.length === 0) {
            return '<tr><td colspan="3">Nenhum dado SPT disponível</td></tr>';
        }
        
        let html = '';
        
        sptData.forEach(data => {
            html += `
                <tr>
                    <td>${data.depth.toFixed(2)}</td>
                    <td class="cota-cell">${data.cota.toFixed(2)}</td>
                    <td class="amostra-cell">${data.amostra}</td>
                    <td class="golpes-cell">${data.golpesInicial}</td>
                    <td class="golpes-cell">${data.golpesFinal}</td>
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
    
    waterLevelHtml(sptData) {
        const waterLevelRow = sptData.find(data => data.hasWaterLevel);
        
        if (waterLevelRow) {
            return `<li>Água com ${waterLevelRow.depth.toFixed(2)}m de profundidade</li>`;
        }
        
        return '<li>Não foi encontrado nível d\'água</li>';
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
