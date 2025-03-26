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
        // Generate main soil layer description
        let soilLayersHtml = '';
        soilLayers.forEach(layer => {
            soilLayersHtml += `
                <div class="soil-layer-description">
                    <div class="layer-depth">
                        <span>${layer.startDepth.toFixed(2)}</span>
                        <span class="depth-separator">-</span>
                        <span>${layer.endDepth.toFixed(2)}</span>
                    </div>
                    <div class="layer-text">${layer.description}</div>
                </div>
            `;
        });
        
        // Generate SPT data table rows
        let sptTableRows = '';
        sptData.forEach((data, index) => {
            sptTableRows += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${data.cota.toFixed(2)}</td>
                    <td>${data.amostra}</td>
                    <td>${data.golpesInicial}</td>
                    <td>${data.golpesFinal}</td>
                    <td>${data.hasWaterLevel ? 'Sim' : 'Não'}</td>
                </tr>
            `;
        });
        
        // Format the date
        const dateObj = formData.data ? new Date(formData.data) : new Date();
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        // Generate the complete report HTML
        return `
            <div class="spt-report">
                <div class="spt-report-header">
                    <h1>PERFIL GEOTÉCNICO</h1>
                    <div class="report-info">
                        <div class="report-info-row">
                            <span class="report-label">LAUDO Nº:</span>
                            <span class="report-value">${formData.laudoNumero}</span>
                            <span class="report-label">SONDAGEM DE SIMPLES RECONHECIMENTO</span>
                            <span class="report-label">SPT:</span>
                            <span class="report-value">${formData.sptNumero}</span>
                        </div>
                        <div class="report-info-row">
                            <span class="report-label">OBRA:</span>
                            <span class="report-value">${formData.obra}</span>
                            <span class="report-label">COTA:</span>
                            <span class="report-value">${formData.cota}</span>
                            <span class="report-label">REL. Nº:</span>
                            <span class="report-value">${formData.relNumero}</span>
                        </div>
                        <div class="report-info-row">
                            <span class="report-label">LOCAL:</span>
                            <span class="report-value">${formData.local}</span>
                            <span class="report-label">FL.Nº:</span>
                            <span class="report-value">${formData.flNumero}</span>
                        </div>
                        <div class="report-info-row">
                            <span class="report-label">CLIENTE:</span>
                            <span class="report-value">${formData.cliente}</span>
                        </div>
                        <div class="report-info-row">
                            <span class="report-label">DES.:</span>
                            <span class="report-value">${formData.desenhista}</span>
                            <span class="report-label">SOND.:</span>
                            <span class="report-value">${formData.sondador}</span>
                            <span class="report-label">ESC.:</span>
                            <span class="report-value">${formData.escala}</span>
                            <span class="report-label">DATA:</span>
                            <span class="report-value">${formattedDate}</span>
                        </div>
                    </div>
                </div>
                
                <div class="spt-report-content">
                    <div class="spt-report-left">
                        <div class="soil-layers-container">
                            <h3>CAMADAS DETECTADAS</h3>
                            ${soilLayersHtml}
                        </div>
                        
                        <div class="water-level-info">
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
                    
                    <div class="spt-report-right">
                        <div class="spt-data-container">
                            <h3>CAMADAS DETECTADAS</h3>
                            <table class="spt-data-table">
                                <thead>
                                    <tr>
                                        <th>AMOSTRA</th>
                                        <th>COTA</th>
                                        <th>REF.</th>
                                        <th>INICIAL</th>
                                        <th>FINAL</th>
                                        <th>N.A.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sptTableRows}
                                </tbody>
                            </table>
                        </div>
                        
                        <div id="spt-chart-container" class="spt-chart-container">
                            <!-- Chart will be inserted here by JavaScript -->
                        </div>
                    </div>
                </div>
                
                <div class="spt-footer">
                    <div class="engineer-info">
                        <p>${formData.engenheiro}</p>
                        <p>Engenheiro Civil</p>
                        <p>Crea: ${formData.crea}</p>
                    </div>
                </div>
            </div>
        `;
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
