// PDF Generator - Generates PDF from the report
export class PdfGenerator {
    constructor() {
        this.pdf = null;
    }
    
    async generatePdf() {
        try {
            // Get report container
            const reportContainer = document.getElementById('report-preview');
            
            if (!reportContainer) {
                alert('Erro: Container do relatório não encontrado.');
                return;
            }
            
            // Show loading indicator
            this.showLoading();
            
            // Create a temporary container for PDF generation to ensure proper styling
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = reportContainer.innerHTML;
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '790px'; // A4 width in pixels at 96 DPI
            document.body.appendChild(tempContainer);
            
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            this.pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // Use html2canvas to render the report
            const canvas = await html2canvas(tempContainer, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                windowWidth: 790
            });
            
            // Remove temporary container
            document.body.removeChild(tempContainer);
            
            // Add the canvas image to the PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = this.pdf.internal.pageSize.getWidth();
            const pdfHeight = this.pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;
            
            this.pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // If the report is longer than one page, create additional pages
            if (imgHeight * ratio > pdfHeight) {
                let remainingHeight = imgHeight * ratio;
                let currentPage = 1;
                
                while (remainingHeight > pdfHeight) {
                    remainingHeight -= pdfHeight;
                    currentPage++;
                    this.pdf.addPage();
                    
                    // Draw the next part of the image on the new page
                    this.pdf.addImage(
                        imgData, 
                        'JPEG', 
                        imgX, 
                        -(pdfHeight * (currentPage - 1)), 
                        imgWidth * ratio, 
                        imgHeight * ratio
                    );
                }
            }
            
            // Get filename from laudo number or default
            const laudoNumero = document.getElementById('laudo-numero').value || 'laudo-spt';
            const fileName = `${laudoNumero.replace(/\//g, '-')}.pdf`;
            
            // Save the PDF
            this.pdf.save(fileName);
            
            // Hide loading indicator
            this.hideLoading();
            
            // Show success message
            alert('PDF gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
            this.hideLoading();
        }
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
