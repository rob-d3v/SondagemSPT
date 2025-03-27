// Main application file
import { TabManager } from './tabManager.js';
import { SoilLayerManager } from './soilLayerManager.js';
import { SptDataManager } from './sptDataManager.js';
import { ReportGenerator } from './reportGenerator.js';
import { PdfGenerator } from './pdfGenerator.js';
import { ChartManager } from './chartManager.js';
import { DataStorage } from './dataStorage.js';
import { TemplateManager } from './templateManager.js';
import { showToast } from './utils.js';

// Helper function to fill form fields with data
function fillFormWithData(formData) {
    for (const key in formData) {
        const element = document.getElementById(key);
        if (element) {
            element.value = formData[key];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tab manager
    const tabManager = new TabManager();
    
    // Initialize soil layer manager
    const soilLayerManager = new SoilLayerManager();
    
    // Initialize SPT data manager
    const sptDataManager = new SptDataManager();
    
    // Initialize chart manager
    const chartManager = new ChartManager();
    
    // Initialize report generator
    const reportGenerator = new ReportGenerator(soilLayerManager, sptDataManager, chartManager);
    
    // Initialize PDF generator
    const pdfGenerator = new PdfGenerator();
    
    // Initialize data storage
    const dataStorage = new DataStorage();
    
    // Initialize template manager
    const templateManager = new TemplateManager(soilLayerManager, reportGenerator);
    
    // Event listeners for tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabManager.activateTab(tabId);
            
            // If preview tab is clicked, generate a preview
            if (tabId === 'preview') {
                reportGenerator.generatePreview();
            }
        });
    });
    
    // Event listener for adding soil layers
    document.getElementById('add-layer').addEventListener('click', () => {
        soilLayerManager.addLayer();
    });
    
    // Event listener for generating depth rows
    document.getElementById('generate-depths').addEventListener('click', () => {
        const finalDepth = parseFloat(document.getElementById('profundidade-final').value);
        if (!isNaN(finalDepth) && finalDepth > 0) {
            sptDataManager.generateDepthRows(finalDepth);
        } else {
            alert('Por favor, insira uma profundidade final válida na aba "Informações Gerais".');
        }
    });
    
    // Event listener for generating PDF
    document.addEventListener('DOMContentLoaded', function() {
        // Your existing initialization code
        
        // Fix the PDF export button event listener
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', function() {
                const reportGenerator = new ReportGenerator(soilLayerManager, sptDataManager, chartManager);
                const formData = reportGenerator.collectFormData();
                const soilLayers = soilLayerManager.getLayersData();
                const sptData = sptDataManager.getSptData();
                
                // Generate PDF using html2pdf
                const pdfContent = reportGenerator.generatePdfHtml(formData, soilLayers, sptData);
                
                // Create a hidden div to render the PDF content
                const pdfContainer = document.createElement('div');
                pdfContainer.style.position = 'absolute';
                pdfContainer.style.left = '-9999px';
                pdfContainer.innerHTML = pdfContent;
                document.body.appendChild(pdfContainer);
                
                // Use html2pdf to generate and download the PDF
                html2pdf()
                    .from(pdfContainer)
                    .set({
                        margin: [10, 10],
                        filename: `Laudo_SPT_${formData.reportNumber || 'Relatório'}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    })
                    .save()
                    .then(() => {
                        // Remove the temporary container
                        document.body.removeChild(pdfContainer);
                    });
            });
        } else {
            console.error('Export PDF button not found in the document');
        }
    });
    
    // Add save/load data buttons to the interface
    const buttonGroup = document.querySelector('.button-group');
    
    const saveButton = document.createElement('button');
    saveButton.id = 'save-data';
    saveButton.className = 'btn';
    saveButton.textContent = 'Salvar Dados';
    buttonGroup.appendChild(saveButton);
    
    const loadButton = document.createElement('button');
    loadButton.id = 'load-data';
    loadButton.className = 'btn';
    loadButton.textContent = 'Carregar Dados';
    buttonGroup.appendChild(loadButton);
    
    const exportButton = document.createElement('button');
    exportButton.id = 'export-data';
    exportButton.className = 'btn';
    exportButton.textContent = 'Exportar Backup';
    buttonGroup.appendChild(exportButton);
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.id = 'import-data';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    buttonGroup.appendChild(importInput);
    
    const importButton = document.createElement('button');
    importButton.id = 'import-button';
    importButton.className = 'btn';
    importButton.textContent = 'Importar Backup';
    buttonGroup.appendChild(importButton);
    
    // Event listeners for data storage
    saveButton.addEventListener('click', () => {
        // Get all form data
        const formData = reportGenerator.collectFormData();
        const soilLayers = soilLayerManager.getLayersData();
        const sptData = sptDataManager.getSptData();
        
        // Save data
        const success = dataStorage.saveReportData(formData, soilLayers, sptData);
        if (success) {
            showToast('Dados salvos com sucesso!', 'success');
        } else {
            showToast('Erro ao salvar dados.', 'error');
        }
    });
    
    loadButton.addEventListener('click', () => {
        // Load saved data
        const savedData = dataStorage.loadReportData();
        if (savedData) {
            // Fill the form with saved data
            fillFormWithData(savedData.formData);
            
            // Regenerate soil layers
            soilLayerManager.loadLayersData(savedData.soilLayers);
            
            // Regenerate SPT data
            sptDataManager.loadSptData(savedData.sptData);
            
            // Update preview
            reportGenerator.generatePreview();
            
            showToast('Dados carregados com sucesso!', 'success');
        } else {
            showToast('Não há dados salvos para carregar.', 'error');
        }
    });
    
    exportButton.addEventListener('click', () => {
        dataStorage.exportData();
    });
    
    importButton.addEventListener('click', () => {
        importInput.click();
    });
    
    importInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            try {
                await dataStorage.importData(e.target.files[0]);
                showToast('Dados importados com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao importar dados. Verifique o console para mais detalhes.', 'error');
            }
        }
    });
    
    // Add initial default values
    soilLayerManager.addLayer(); // Add first soil layer
    document.getElementById('escala').value = '1:100'; // Default scale
    
    // Update water level when changed
    document.getElementById('nivel-agua').addEventListener('input', (e) => {
        const waterLevel = parseFloat(e.target.value);
        if (!isNaN(waterLevel)) {
            sptDataManager.setWaterLevel(waterLevel);
        }
    });
});