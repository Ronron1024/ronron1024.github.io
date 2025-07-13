// PDF Export Functionality
let isExporting = false;
let html2canvas; // Declare html2canvas variable

async function exportToPDF() {
    if (isExporting) return;
    
    isExporting = true;
    const exportBtn = document.getElementById('export-btn');
    const exportText = document.getElementById('export-text');
    const cvContent = document.getElementById('cv-content');
    
    // Update button state
    exportBtn.disabled = true;
    exportBtn.classList.add('loading');
    exportText.textContent = 'Generating PDF...';
    
    // Hide export button during capture
    exportBtn.style.display = 'none';
    
    try {
        // Wait for libraries to load if not already loaded
        if (typeof html2canvas === 'undefined' || typeof window.jsPDF === 'undefined') {
            throw new Error('Required libraries not loaded');
        }
        
        // Capture the CV content
        const canvas = await html2canvas(cvContent, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cvContent.scrollWidth,
            height: cvContent.scrollHeight,
            onclone: function(clonedDoc) {
                // Ensure the cloned document has the same styles
                const clonedExportBtn = clonedDoc.getElementById('export-btn');
                if (clonedExportBtn) {
                    clonedExportBtn.style.display = 'none';
                }
            }
        });
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jsPDF;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        // Handle multiple pages if content is long
        const totalPages = Math.ceil((imgHeight * ratio) / pdfHeight);
        
        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            
            const yOffset = -(pdfHeight * i);
            pdf.addImage(imgData, 'PNG', imgX, imgY + yOffset, imgWidth * ratio, imgHeight * ratio);
        }
        
        // Download the PDF
        pdf.save('John_Doe_CV.pdf');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        // Reset button state
        exportBtn.style.display = 'flex';
        exportBtn.disabled = false;
        exportBtn.classList.remove('loading');
        exportText.textContent = 'Export PDF';
        isExporting = false;
    }
}

// Add loading animation CSS for the spinning icon
const style = document.createElement('style');
style.textContent = `
    .loading .icon {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Add any responsive behavior if needed
});

// Print functionality (bonus feature)
function printCV() {
    window.print();
}

// Add keyboard shortcut for PDF export (Ctrl+P or Cmd+P)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportToPDF();
    }
});

// Ensure libraries are loaded before allowing export
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('export-btn');
    
    // Check if libraries are loaded
    function checkLibraries() {
        if (typeof html2canvas !== 'undefined' && typeof window.jsPDF !== 'undefined') {
            exportBtn.disabled = false;
            return true;
        }
        return false;
    }
    
    // Initial check
    if (!checkLibraries()) {
        exportBtn.disabled = true;
        exportBtn.querySelector('#export-text').textContent = 'Loading...';
        
        // Keep checking until libraries are loaded
        const checkInterval = setInterval(() => {
            if (checkLibraries()) {
                exportBtn.querySelector('#export-text').textContent = 'Export PDF';
                clearInterval(checkInterval);
            }
        }, 100);
    }
});