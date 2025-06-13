let charts = {};

const defaultOptions = {

    responsive: true,

    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#1e3a8a',
                font: {
                    size: 12,
                    weight: '600'
                }
            }
        }
    }
};

function initializeCharts() {

    try {
     
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            return;
        }

        const typeCtx = document.getElementById('typeChart');

        if (typeCtx) {
            charts.typeChart = new Chart(typeCtx, {
                type: 'pie',
                data: typeDistribution,
                options: {
                    ...defaultOptions,
                    plugins: {
                        ...defaultOptions.plugins,
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#1e3a8a',
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
        }

        const monthlyCtx = document.getElementById('monthlyChart');

        if (monthlyCtx) {
            charts.monthlyChart = new Chart(monthlyCtx, {
                type: 'bar',
                data: monthlyData,
                options: {
                    ...defaultOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#64748b',
                                callback: function(value) {
                                    return value.toLocaleString() + ' RWF';
                                }
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#64748b'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        const trendsCtx = document.getElementById('trendsChart');

        if (trendsCtx) {

            charts.trendsChart = new Chart(trendsCtx, {

                type: 'line',
                data: dailyTrends,
                options: {
                    ...defaultOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#64748b',
                                callback: function(value) {
                                    return (value / 1000) + 'K RWF';
                                }
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#64748b'
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    }
                }
            });
        }

        const distributionCtx = document.getElementById('distributionChart');
        if (distributionCtx) {
            charts.distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Incoming', 'Outgoing'],
                    datasets: [{
                        data: [420000, 268000],
                        backgroundColor: ['#1e3a8a', '#fbbf24'],
                        borderWidth: 0
                    }]
                },
                options: {
                    ...defaultOptions,
                    cutout: '60%',
                    plugins: {
                        ...defaultOptions.plugins,
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#1e3a8a',
                                padding: 20,
                                font: {
                                    size: 14,
                                    weight: '600'
                                }
                            }
                        }
                    }
                }
            });
        }

        const agentCtx = document.getElementById('agentChart');
        if (agentCtx) {
            charts.agentChart = new Chart(agentCtx, {
                type: 'bar',
                data: agentPerformance,
                options: {
                    ...defaultOptions,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                color: '#64748b',
                                callback: function(value) {
                                    return (value / 1000) + 'K';
                                }
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#64748b'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        console.log('All charts initialized successfully');
        
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function updateChartData(chartName, newData) {
    if (charts[chartName]) {
        charts[chartName].data = newData;
        charts[chartName].update();
    }
}


function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    charts = {};
}


window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});