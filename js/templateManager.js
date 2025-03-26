// Template Manager - Handles saving and loading report templates
import { DataStorage } from './dataStorage.js';
import { showToast } from './utils.js';

export class TemplateManager {
    constructor(soilLayerManager, reportGenerator) {
        this.soilLayerManager = soilLayerManager;
        this.reportGenerator = reportGenerator;
        this.dataStorage = new DataStorage();
        this.templateSelectContainer = null;
        
        this.initUI();
    }
    
    initUI() {
        // Create template management UI
        const previewTab = document.getElementById('preview');
        const buttonGroup = previewTab.querySelector('.button-group');
        
        // Create template container
        const templateContainer = document.createElement('div');
        templateContainer.className = 'template-container';
        templateContainer.innerHTML = `
            <h3>Gerenciar Templates</h3>
            <div class="template-actions">
                <div class="template-save">
                    <input type="text" id="template-name" placeholder="Nome do Template">
                    <button id="save-template" class="btn">Salvar como Template</button>
                </div>
                <div class="template-load">
                    <select id="template-select">
                        <option value="">Selecione um template...</option>
                    </select>
                    <button id="load-template" class="btn">Carregar Template</button>
                    <button id="delete-template" class="btn">Excluir Template</button>
                </div>
            </div>
        `;
        
        // Insert before button group
        previewTab.insertBefore(templateContainer, buttonGroup);
        
        // Store reference to template select
        this.templateSelectContainer = document.getElementById('template-select');
        
        // Add event listeners
        document.getElementById('save-template').addEventListener('click', () => this.saveTemplate());
        document.getElementById('load-template').addEventListener('click', () => this.loadTemplate());
        document.getElementById('delete-template').addEventListener('click', () => this.deleteTemplate());
        
        // Load template list on initialization
        this.loadTemplateList();
    }
    
    saveTemplate() {
        const templateName = document.getElementById('template-name').value.trim();
        
        if (!templateName) {
            showToast('Por favor, insira um nome para o template.', 'error');
            return;
        }
        
        // Get form data
        const formData = this.reportGenerator.collectFormData();
        
        // Get soil layers data
        const soilLayers = this.soilLayerManager.getLayersData();
        
        // Save template
        const success = this.dataStorage.saveReportTemplate(templateName, formData, soilLayers);
        
        if (success) {
            showToast(`Template "${templateName}" salvo com sucesso.`, 'success');
            this.loadTemplateList();
        } else {
            showToast('Erro ao salvar o template.', 'error');
        }
    }
    
    loadTemplate() {
        const templateName = this.templateSelectContainer.value;
        
        if (!templateName) {
            showToast('Por favor, selecione um template para carregar.', 'error');
            return;
        }
        
        // Load template data
        const templateData = this.dataStorage.loadTemplate(templateName);
        
        if (templateData) {
            // Fill form with template data
            this.fillFormWithData(templateData.formData);
            
            // Load soil layers
            this.soilLayerManager.loadLayersData(templateData.soilLayers);
            
            // Update preview
            this.reportGenerator.generatePreview();
            
            showToast(`Template "${templateName}" carregado com sucesso.`, 'success');
        } else {
            showToast('Erro ao carregar o template.', 'error');
        }
    }
    
    deleteTemplate() {
        const templateName = this.templateSelectContainer.value;
        
        if (!templateName) {
            showToast('Por favor, selecione um template para excluir.', 'error');
            return;
        }
        
        if (confirm(`Tem certeza que deseja excluir o template "${templateName}"?`)) {
            const success = this.dataStorage.deleteTemplate(templateName);
            
            if (success) {
                showToast(`Template "${templateName}" excluído com sucesso.`, 'success');
                this.loadTemplateList();
            } else {
                showToast('Erro ao excluir o template.', 'error');
            }
        }
    }
    
    loadTemplateList() {
        const templates = this.dataStorage.getTemplates();
        
        // Clear current options
        this.templateSelectContainer.innerHTML = '<option value="">Selecione um template...</option>';
        
        // Add options for each template
        for (const templateName in templates) {
            const option = document.createElement('option');
            option.value = templateName;
            option.textContent = templateName;
            this.templateSelectContainer.appendChild(option);
        }
    }
    
    fillFormWithData(formData) {
        // Helper function to fill form fields with data
        for (const key in formData) {
            const element = document.getElementById(key);
            if (element) {
                element.value = formData[key];
            }
        }
    }
}