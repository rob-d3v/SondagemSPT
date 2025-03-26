// Data Storage - Handles saving and loading report data
export class DataStorage {
    constructor() {
        this.storageKey = 'spt-report-data';
    }
    
    saveReportData(formData, soilLayers, sptData) {
        const data = {
            formData,
            soilLayers,
            sptData,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados do relatório:', error);
            return false;
        }
    }
    
    loadReportData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
            return null;
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            return null;
        }
    }
    
    saveReportTemplate(templateName, formData, soilLayers) {
        const templates = this.getTemplates();
        
        templates[templateName] = {
            formData,
            soilLayers,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('spt-report-templates', JSON.stringify(templates));
            return true;
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            return false;
        }
    }
    
    getTemplates() {
        try {
            const templates = localStorage.getItem('spt-report-templates');
            return templates ? JSON.parse(templates) : {};
        } catch (error) {
            console.error('Erro ao obter templates:', error);
            return {};
        }
    }
    
    loadTemplate(templateName) {
        const templates = this.getTemplates();
        return templates[templateName] || null;
    }
    
    deleteTemplate(templateName) {
        const templates = this.getTemplates();
        
        if (templates[templateName]) {
            delete templates[templateName];
            
            try {
                localStorage.setItem('spt-report-templates', JSON.stringify(templates));
                return true;
            } catch (error) {
                console.error('Erro ao excluir template:', error);
                return false;
            }
        }
        
        return false;
    }
    
    // Export data as JSON file for backup
    exportData() {
        const allData = {
            reportData: this.loadReportData(),
            templates: this.getTemplates()
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'spt-report-data-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Import data from JSON file
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (data.reportData) {
                        localStorage.setItem(this.storageKey, JSON.stringify(data.reportData));
                    }
                    
                    if (data.templates) {
                        localStorage.setItem('spt-report-templates', JSON.stringify(data.templates));
                    }
                    
                    resolve(true);
                } catch (error) {
                    console.error('Erro ao importar dados:', error);
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }
}
