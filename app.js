        // DOM Elements
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const changeImageBtn = document.getElementById('changeImageBtn');
        const analysisSection = document.getElementById('analysisSection');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const resultsCard = document.getElementById('resultsCard');
        const exportCSVBtn = document.getElementById('exportCSVBtn');
        const exportPDFBtn = document.getElementById('exportPDFBtn');
        const saveSessionBtn = document.getElementById('saveSessionBtn');
        
        // Advanced options elements
        const intensitySlider = document.getElementById('intensitySlider');
        const intensityValue = document.getElementById('intensityValue');
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const sensitivityValue = document.getElementById('sensitivityValue');
        const depthSlider = document.getElementById('depthSlider');
        const depthValue = document.getElementById('depthValue');
        
        // Results elements
        const totalParticles = document.getElementById('totalParticles');
        const avgSize = document.getElementById('avgSize');
        const sizeRange = document.getElementById('sizeRange');
        const dominantShape = document.getElementById('dominantShape');
        const dominantColor = document.getElementById('dominantColor');
        const confidenceScore = document.getElementById('confidenceScore');
        const fiberCount = document.getElementById('fiberCount');
        const fiberPercentage = document.getElementById('fiberPercentage');
        const fragmentCount = document.getElementById('fragmentCount');
        const fragmentPercentage = document.getElementById('fragmentPercentage');
        const pelletCount = document.getElementById('pelletCount');
        const pelletPercentage = document.getElementById('pelletPercentage');
        const filmCount = document.getElementById('filmCount');
        const filmPercentage = document.getElementById('filmPercentage');
        const foamCount = document.getElementById('foamCount');
        const foamPercentage = document.getElementById('foamPercentage');
        const particleTable = document.getElementById('particleTable');
        
        // Scan step elements
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        const step4 = document.getElementById('step4');
        const step5 = document.getElementById('step5');
        const step6 = document.getElementById('step6');
        const step7 = document.getElementById('step7');
        
        // Global variable to store analysis data
        let currentAnalysisData = null;
        let progressInterval = null;
        
        // Event Listeners
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent)';
            uploadArea.style.backgroundColor = 'rgba(26, 188, 156, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--secondary)';
            uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--secondary)';
            uploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
            
            if (e.dataTransfer.files.length) {
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImageUpload(e.target.files[0]);
            }
        });
        
        analyzeBtn.addEventListener('click', startAnalysis);
        changeImageBtn.addEventListener('click', resetUpload);
        
        // Advanced options event listeners
        intensitySlider.addEventListener('input', () => {
            intensityValue.textContent = intensitySlider.value;
        });
        
        sensitivitySlider.addEventListener('input', () => {
            sensitivityValue.textContent = sensitivitySlider.value;
        });
        
        depthSlider.addEventListener('input', () => {
            depthValue.textContent = depthSlider.value;
        });
        
        // Export functionality
        exportCSVBtn.addEventListener('click', exportToCSV);
        exportPDFBtn.addEventListener('click', generatePDFReport);
        saveSessionBtn.addEventListener('click', saveAnalysisSession);
        
        // Functions
        function handleImageUpload(file) {
            if (!file.type.match('image.*')) {
                alert('Please upload an image file (JPG, PNG, TIFF, BMP)');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
                uploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
        
        function resetUpload() {
            // Clear any running intervals
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            
            imagePreviewContainer.style.display = 'none';
            uploadArea.style.display = 'block';
            fileInput.value = '';
            analysisSection.style.display = 'none';
            resultsCard.style.display = 'none';
            
            // Reset progress bar
            progressBar.style.width = '0%';
        }
        
        function startAnalysis() {
            // Clear any previous intervals
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            
            analysisSection.style.display = 'block';
            loadingIndicator.style.display = 'block';
            resultsCard.style.display = 'none';
            
            // Reset scan steps
            resetScanSteps();
            
            // Get analysis parameters
            const intensity = parseInt(intensitySlider.value);
            const sensitivity = parseInt(sensitivitySlider.value);
            const depth = parseInt(depthSlider.value);
            
            // Calculate total time based on parameters (longer for more intensive analysis)
            const baseTime = 15000; // 15 seconds base
            const intensityMultiplier = 1 + (intensity / 10);
            const sensitivityMultiplier = 1 + (sensitivity / 15);
            const depthMultiplier = 1 + (depth / 5);
            
            const totalTime = baseTime * intensityMultiplier * sensitivityMultiplier * depthMultiplier;
            const stepTime = totalTime / 7;
            
            let progress = 0;
            let currentStep = 0;
            
            // Fixed progress increments for each step
            const stepProgress = [15, 30, 45, 60, 75, 90, 100];
            
            progressInterval = setInterval(() => {
                // Calculate smooth progress - always forward moving
                const timeElapsed = (currentStep * stepTime) + (performance.now() - startTime);
                progress = Math.min((timeElapsed / totalTime) * 100, 100);
                
                // Update progress bar
                progressBar.style.width = `${progress}%`;
                
                // Check if we should move to the next step
                if (currentStep < 7 && progress >= stepProgress[currentStep]) {
                    updateScanStep(currentStep);
                    currentStep++;
                }
                
                // Update progress text
                updateProgressText(currentStep, progress);
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    updateScanStep(6); // Ensure last step is marked complete
                    setTimeout(completeAnalysis, 500);
                }
            }, 100);
            
            const startTime = performance.now();
        }
        
        function resetScanSteps() {
            const steps = [step1, step2, step3, step4, step5, step6, step7];
            steps.forEach(step => {
                const icon = step.querySelector('.step-icon');
                const text = step.querySelector('span:last-child');
                icon.textContent = "⏳";
                icon.classList.remove('completed');
                text.textContent = text.textContent.replace("✅ Completed", "").trim();
            });
        }
        
        function updateScanStep(stepIndex) {
            const steps = [step1, step2, step3, step4, step5, step6, step7];
            if (stepIndex < 0 || stepIndex >= steps.length) return;
            
            const step = steps[stepIndex];
            const icon = step.querySelector('.step-icon');
            const text = step.querySelector('span:last-child');
            
            icon.textContent = "✅";
            icon.classList.add('completed');
            text.textContent = text.textContent + " ✅ Completed";
        }
        
        function updateProgressText(step, progress) {
            const stepTexts = [
                "Initializing analysis...",
                "Preprocessing image...",
                "Reducing noise and subtracting background...",
                "Detecting and segmenting particles...",
                "Measuring size and shape properties...",
                "Analyzing colors and classifying...",
                "Identifying microplastic types...",
                "Finalizing analysis..."
            ];
            
            // Add progress percentage to the text
            progressText.textContent = `${stepTexts[step] || "Analysis complete!"} (${Math.round(progress)}%)`;
        }
        
        function completeAnalysis() {
            loadingIndicator.style.display = 'none';
            resultsCard.style.display = 'block';
            progressText.textContent = "Deep scan analysis complete! (100%)";
            
            // Generate mock data for demonstration
            generateMockResults();
        }
        
        function generateMockResults() {
            // Get analysis parameters for more realistic data
            const intensity = parseInt(intensitySlider.value);
            const sensitivity = parseInt(sensitivitySlider.value);
            const depth = parseInt(depthSlider.value);
            
            // Generate random but realistic data for demonstration
            const baseParticles = 20 + (intensity * 3) + (sensitivity * 2);
            const variance = Math.floor(baseParticles * 0.4);
            const particleCount = baseParticles + Math.floor(Math.random() * variance);
            
            totalParticles.textContent = particleCount;
            
            // Generate particle data
            const shapes = ['Irregular', 'Spherical', 'Fibrous', 'Angular', 'Elongated'];
            const colors = ['Transparent', 'White', 'Blue', 'Red', 'Green', 'Black', 'Yellow', 'Orange', 'Purple'];
            const types = ['Fiber', 'Fragment', 'Pellet', 'Film', 'Foam'];
            
            // Calculate counts for each type
            const typeCounts = {
                'Fiber': 0,
                'Fragment': 0,
                'Pellet': 0,
                'Film': 0,
                'Foam': 0
            };
            
            // Generate table data
            let tableHTML = '';
            let totalSize = 0;
            let minSize = 1000;
            let maxSize = 0;
            
            for (let i = 1; i <= particleCount; i++) {
                const size = (Math.random() * 490 + 10).toFixed(2); // 10-500 μm
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const type = types[Math.floor(Math.random() * types.length)];
                const confidence = (80 + Math.random() * 20).toFixed(1); // 80-100% confidence
                
                totalSize += parseFloat(size);
                if (parseFloat(size) < minSize) minSize = parseFloat(size);
                if (parseFloat(size) > maxSize) maxSize = parseFloat(size);
                
                typeCounts[type]++;
                
                tableHTML += `
                    <tr>
                        <td class="particle-id">MP-${i.toString().padStart(3, '0')}</td>
                        <td>${size}</td>
                        <td>${shape}</td>
                        <td>${color}</td>
                        <td>${type}</td>
                        <td>${confidence}%</td>
                    </tr>
                `;
            }
            
            particleTable.innerHTML = tableHTML;
            
            // Update summary statistics
            avgSize.textContent = (totalSize / particleCount).toFixed(2);
            sizeRange.textContent = `${minSize.toFixed(2)}-${maxSize.toFixed(2)}`;
            
            // Find dominant shape and color (would require actual analysis in real implementation)
            dominantShape.textContent = 'Irregular';
            dominantColor.textContent = 'Transparent';
            
            // Calculate confidence score based on parameters
            const confidence = 85 + (intensity * 1.2) + (sensitivity * 0.8) + (depth * 1.5);
            confidenceScore.textContent = Math.min(confidence, 99.5).toFixed(1) + '%';
            
            // Update type counts and percentages
            fiberCount.textContent = typeCounts['Fiber'];
            fiberPercentage.textContent = ((typeCounts['Fiber'] / particleCount) * 100).toFixed(1) + '%';
            
            fragmentCount.textContent = typeCounts['Fragment'];
            fragmentPercentage.textContent = ((typeCounts['Fragment'] / particleCount) * 100).toFixed(1) + '%';
            
            pelletCount.textContent = typeCounts['Pellet'];
            pelletPercentage.textContent = ((typeCounts['Pellet'] / particleCount) * 100).toFixed(1) + '%';
            
            filmCount.textContent = typeCounts['Film'];
            filmPercentage.textContent = ((typeCounts['Film'] / particleCount) * 100).toFixed(1) + '%';
            
            foamCount.textContent = typeCounts['Foam'];
            foamPercentage.textContent = ((typeCounts['Foam'] / particleCount) * 100).toFixed(1) + '%';
            
            // Store current analysis data
            currentAnalysisData = {
                totalParticles: particleCount,
                avgSize: (totalSize / particleCount).toFixed(2),
                sizeRange: `${minSize.toFixed(2)}-${maxSize.toFixed(2)}`,
                dominantShape: 'Irregular',
                dominantColor: 'Transparent',
                confidenceScore: Math.min(confidence, 99.5).toFixed(1) + '%',
                typeCounts: typeCounts,
                particles: Array.from({length: particleCount}, (_, i) => ({
                    id: `MP-${(i+1).toString().padStart(3, '0')}`,
                    size: (Math.random() * 490 + 10).toFixed(2),
                    shape: shapes[Math.floor(Math.random() * shapes.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    type: types[Math.floor(Math.random() * types.length)],
                    confidence: (80 + Math.random() * 20).toFixed(1) + '%'
                }))
            };
        }
        
        function exportToCSV() {
            if (!currentAnalysisData) {
                alert('No analysis data to export');
                return;
            }
            
            let csvContent = "Microplastic Analysis Data\n\n";
            
            // Add summary section
            csvContent += "SUMMARY\n";
            csvContent += `Total Particles,${currentAnalysisData.totalParticles}\n`;
            csvContent += `Average Size (μm),${currentAnalysisData.avgSize}\n`;
            csvContent += `Size Range (μm),${currentAnalysisData.sizeRange}\n`;
            csvContent += `Dominant Shape,${currentAnalysisData.dominantShape}\n`;
            csvContent += `Dominant Color,${currentAnalysisData.dominantColor}\n`;
            csvContent += `Confidence Score,${currentAnalysisData.confidenceScore}\n\n`;
            
            // Add classification section
            csvContent += "CLASSIFICATION\n";
            csvContent += `Fibers,${currentAnalysisData.typeCounts.Fiber} (${((currentAnalysisData.typeCounts.Fiber / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)\n`;
            csvContent += `Fragments,${currentAnalysisData.typeCounts.Fragment} (${((currentAnalysisData.typeCounts.Fragment / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)\n`;
            csvContent += `Pellets,${currentAnalysisData.typeCounts.Pellet} (${((currentAnalysisData.typeCounts.Pellet / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)\n`;
            csvContent += `Films,${currentAnalysisData.typeCounts.Film} (${((currentAnalysisData.typeCounts.Film / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)\n`;
            csvContent += `Foams,${currentAnalysisData.typeCounts.Foam} (${((currentAnalysisData.typeCounts.Foam / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)\n\n`;
            
            // Add detailed data
            csvContent += "DETAILED PARTICLE DATA\n";
            csvContent += "Particle ID,Size (μm),Shape,Color,Type,Confidence\n";
            
            currentAnalysisData.particles.forEach(particle => {
                csvContent += `${particle.id},${particle.size},${particle.shape},${particle.color},${particle.type},${particle.confidence}\n`;
            });
            
            // Create and download the CSV file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `microplastic_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('CSV file exported successfully!');
        }
        
        function generatePDFReport() {
            if (!currentAnalysisData) {
                alert('No analysis data to generate report');
                return;
            }
            
            // Create new PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('Microplastic Analysis Report', 20, 30);
            
            // Add date
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
            
            // Add summary section
            doc.setFontSize(16);
            doc.text('Summary', 20, 60);
            
            doc.setFontSize(12);
            let yPosition = 70;
            doc.text(`Total Particles: ${currentAnalysisData.totalParticles}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Average Size: ${currentAnalysisData.avgSize} μm`, 20, yPosition);
            yPosition += 10;
            doc.text(`Size Range: ${currentAnalysisData.sizeRange} μm`, 20, yPosition);
            yPosition += 10;
            doc.text(`Dominant Shape: ${currentAnalysisData.dominantShape}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Dominant Color: ${currentAnalysisData.dominantColor}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Confidence Score: ${currentAnalysisData.confidenceScore}`, 20, yPosition);
            
            // Add classification section
            yPosition += 20;
            doc.setFontSize(16);
            doc.text('Classification', 20, yPosition);
            
            yPosition += 10;
            doc.setFontSize(12);
            doc.text(`Fibers: ${currentAnalysisData.typeCounts.Fiber} (${((currentAnalysisData.typeCounts.Fiber / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)`, 20, yPosition);
            yPosition += 10;
            doc.text(`Fragments: ${currentAnalysisData.typeCounts.Fragment} (${((currentAnalysisData.typeCounts.Fragment / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)`, 20, yPosition);
            yPosition += 10;
            doc.text(`Pellets: ${currentAnalysisData.typeCounts.Pellet} (${((currentAnalysisData.typeCounts.Pellet / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)`, 20, yPosition);
            yPosition += 10;
            doc.text(`Films: ${currentAnalysisData.typeCounts.Film} (${((currentAnalysisData.typeCounts.Film / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)`, 20, yPosition);
            yPosition += 10;
            doc.text(`Foams: ${currentAnalysisData.typeCounts.Foam} (${((currentAnalysisData.typeCounts.Foam / currentAnalysisData.totalParticles) * 100).toFixed(1)}%)`, 20, yPosition);
            
            // Add detailed data table (first page only shows first few entries)
            yPosition += 20;
            doc.setFontSize(16);
            doc.text('Detailed Particle Data (Sample)', 20, yPosition);
            
            // Prepare table data
            const tableData = currentAnalysisData.particles.slice(0, 15).map(particle => [
                particle.id,
                particle.size,
                particle.shape,
                particle.color,
                particle.type,
                particle.confidence
            ]);
            
            // Add table
            doc.autoTable({
                startY: yPosition + 10,
                head: [['Particle ID', 'Size (μm)', 'Shape', 'Color', 'Type', 'Confidence']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [44, 62, 80] },
                styles: { fontSize: 10 }
            });
            
            // Save the PDF
            doc.save(`microplastic_analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
            
            alert('PDF report generated successfully!');
        }
        
        function saveAnalysisSession() {
            if (!currentAnalysisData) {
                alert('No analysis data to save');
                return;
            }
            
            // Create session data
            const sessionData = {
                ...currentAnalysisData,
                timestamp: new Date().toISOString(),
                settings: {
                    intensity: parseInt(intensitySlider.value),
                    sensitivity: parseInt(sensitivitySlider.value),
                    depth: parseInt(depthSlider.value)
                }
            };
            
            // Generate unique session ID
            const sessionId = 'session_' + new Date().getTime();
            
            // Save to localStorage
            localStorage.setItem(sessionId, JSON.stringify(sessionData));
            
            // Also save session ID to list of sessions
            const sessions = JSON.parse(localStorage.getItem('microplasticSessions') || '[]');
            sessions.push({
                id: sessionId,
                timestamp: sessionData.timestamp,
                totalParticles: sessionData.totalParticles
            });
            localStorage.setItem('microplasticSessions', JSON.stringify(sessions));
            
            alert('Analysis session saved successfully!');
        }