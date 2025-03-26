// PDF Generator - Generates PDF from the report
export class PdfGenerator {
    constructor() {
        this.pdf = null;
    }
    
    generatePDF() {
        this.showLoading();
        
        const reportElement = document.getElementById('report-preview');
        
        // Configurar opções para html2canvas
        const options = {
            scale: 2, // Aumentar a escala para melhor qualidade
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        };
        
        // Capturar o relatório como uma imagem
        html2canvas(reportElement, options).then(canvas => {
            // Criar um novo documento PDF
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Obter as dimensões do canvas e do PDF
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // Adicionar a primeira página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Adicionar páginas adicionais se necessário
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Salvar o PDF
            pdf.save('laudo-spt.pdf');
            
            // Esconder o indicador de carregamento
            this.hideLoading();
        }).catch(error => {
            console.error('Erro ao gerar PDF:', error);
            this.hideLoading();
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        });
    }
    
    showLoading() {
        // Create loading indicator if it doesn't exist
        let loadingIndicator = document.getElementById('loading-indicator');
        
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Gerando PDF...</p>
            `;
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '0';
            loadingIndicator.style.left = '0';
            loadingIndicator.style.width = '100%';
            loadingIndicator.style.height = '100%';
            loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.flexDirection = 'column';
            loadingIndicator.style.alignItems = 'center';
            loadingIndicator.style.justifyContent = 'center';
            loadingIndicator.style.color = 'white';
            loadingIndicator.style.zIndex = '9999';
            
            // Add spinner style
            const style = document.createElement('style');
            style.textContent = `
                .loading-spinner {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3f51b5;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 2s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(loadingIndicator);
        } else {
            loadingIndicator.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}
