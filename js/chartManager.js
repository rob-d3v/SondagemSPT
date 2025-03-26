// Chart Manager - Handles chart generation for SPT data
export class ChartManager {
    constructor() {
        this.chart = null;
    }
    
    generateSptChart(sptData, container) {
        // Limpar o container antes de gerar um novo gráfico
        container.innerHTML = '';
        
        // Criar um canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'spt-resistance-chart';
        container.appendChild(canvas);
        
        // Preparar os dados para o gráfico
        const depths = sptData.map(data => data.depth);
        const golpesIniciais = sptData.map(data => data.golpesInicial);
        const golpesFinais = sptData.map(data => data.golpesFinal);
        
        // Encontrar o valor máximo para definir a escala
        const maxValue = Math.max(
            ...golpesIniciais.filter(v => v !== null && !isNaN(v)),
            ...golpesFinais.filter(v => v !== null && !isNaN(v)),
            40 // Valor mínimo para garantir que o gráfico tenha uma escala razoável
        );
        
        // Configurar o gráfico
        const ctx = canvas.getContext('2d');
        
        // Destruir o gráfico anterior se existir
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Criar um novo gráfico
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: depths,
                datasets: [
                    {
                        label: 'Golpes Iniciais',
                        data: golpesIniciais,
                        borderColor: 'rgba(255, 0, 0, 1)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: 'rgba(255, 0, 0, 1)',
                        tension: 0.1
                    },
                    {
                        label: 'Golpes Finais',
                        data: golpesFinais,
                        borderColor: 'rgba(0, 0, 255, 1)',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: 'rgba(0, 0, 255, 1)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'top',
                        min: 0,
                        max: maxValue + 5,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true
                        },
                        ticks: {
                            stepSize: 5,
                            callback: function(value) {
                                return value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Número de Golpes'
                        }
                    },
                    y: {
                        reverse: true,
                        min: 0,
                        max: Math.max(...depths) + 1,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true
                        },
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value + 'm';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Profundidade (m)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Profundidade: ' + tooltipItems[0].label + 'm';
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    }
                }
            }
        });
        
        // Adicionar linhas de grade verticais para melhor visualização
        this.addGridLines(container, maxValue);
    }
    
    addGridLines(container, maxValue) {
        // Criar um elemento para as linhas de grade
        const gridLines = document.createElement('div');
        gridLines.className = 'spt-chart-grid-lines';
        
        // Adicionar linhas verticais a cada 5 unidades
        for (let i = 0; i <= maxValue; i += 5) {
            const line = document.createElement('div');
            line.className = 'grid-line';
            line.style.left = `${(i / maxValue) * 100}%`;
            gridLines.appendChild(line);
        }
        
        // Inserir as linhas de grade antes do canvas
        container.insertBefore(gridLines, container.firstChild);
    }
}
