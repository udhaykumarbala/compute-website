/* =====================================================
   0G Compute - Real-Time Metrics & Sparkline Charts
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initComputeMetrics();
});

/* ==================== Configuration ==================== */
const METRICS_CONFIG = {
    updateInterval: 2500,
    chartPoints: 20,
    animationDuration: 400
};

/* ==================== Metrics State ==================== */
const metricsState = {
    providers: {
        current: 0,
        history: [],
        min: 150,
        max: 200,
        unit: 'providers',
        decimals: 0
    },
    savings: {
        current: 0,
        history: [],
        min: 85,
        max: 92,
        unit: '%',
        decimals: 0
    }
};

/* ==================== Chart Instances ==================== */
let charts = {};

/* ==================== Initialize Metrics ==================== */
function initComputeMetrics() {
    // Initialize with random starting values
    Object.keys(metricsState).forEach(key => {
        const metric = metricsState[key];
        metric.current = randomInRange(metric.min, metric.max);

        if (metric.history !== undefined) {
            for (let i = 0; i < METRICS_CONFIG.chartPoints; i++) {
                metric.history.push(randomInRange(metric.min, metric.max));
            }
        }
    });

    // Create sparkline charts
    createSparklineCharts();

    // Update display
    updateMetricsDisplay();

    // Start real-time updates
    setInterval(updateMetrics, METRICS_CONFIG.updateInterval);
}

/* ==================== Create Sparkline Charts ==================== */
function createSparklineCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 },
                line: {
                    borderWidth: 2,
                    tension: 0.4
                }
            },
            animation: {
                duration: METRICS_CONFIG.animationDuration,
                easing: 'easeOutQuart'
            }
        }
    };

    // Providers Chart
    const providersCtx = document.getElementById('providersChart');
    if (providersCtx) {
        charts.providers = new Chart(providersCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.providers.history,
                    borderColor: '#9200E1',
                    backgroundColor: createGradient(providersCtx, '#9200E1'),
                    fill: true
                }]
            }
        });
    }

    // Savings Chart
    const savingsCtx = document.getElementById('savingsChart');
    if (savingsCtx) {
        charts.savings = new Chart(savingsCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.savings.history,
                    borderColor: '#22C55E',
                    backgroundColor: createGradient(savingsCtx, '#22C55E'),
                    fill: true
                }]
            }
        });
    }
}

/* ==================== Create Gradient ==================== */
function createGradient(canvas, color) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 48);
    gradient.addColorStop(0, hexToRgba(color, 0.3));
    gradient.addColorStop(1, hexToRgba(color, 0.02));
    return gradient;
}

/* ==================== Update Metrics ==================== */
function updateMetrics() {
    Object.keys(metricsState).forEach(key => {
        const metric = metricsState[key];
        const oldValue = metric.current;

        // Generate new value with small variation
        const variation = (metric.max - metric.min) * 0.1;
        let newValue = metric.current + randomInRange(-variation, variation);

        // Clamp to min/max
        newValue = Math.max(metric.min, Math.min(metric.max, newValue));
        metric.current = newValue;

        // Update history if exists
        if (metric.history !== undefined) {
            metric.history.shift();
            metric.history.push(newValue);
        }

        // Calculate percentage change
        metric.change = ((newValue - oldValue) / oldValue) * 100;
    });

    // Update charts
    updateCharts();

    // Update display
    updateMetricsDisplay();
}

/* ==================== Update Charts ==================== */
function updateCharts() {
    if (charts.providers) {
        charts.providers.data.datasets[0].data = metricsState.providers.history;
        charts.providers.update('none');
    }

    if (charts.savings) {
        charts.savings.data.datasets[0].data = metricsState.savings.history;
        charts.savings.update('none');
    }
}

/* ==================== Update Display ==================== */
function updateMetricsDisplay() {
    // Providers
    const providersEl = document.getElementById('gpuProviders');
    if (providersEl) {
        animateValue(providersEl, metricsState.providers.current, metricsState.providers.decimals);
    }

    const providersChangeEl = document.getElementById('providersChange');
    if (providersChangeEl) {
        updateChangeIndicator(providersChangeEl, metricsState.providers.change || Math.random() * 5);
    }

    // Savings
    const savingsEl = document.getElementById('costSavings');
    if (savingsEl) {
        animateValue(savingsEl, metricsState.savings.current, metricsState.savings.decimals);
    }
}

/* ==================== Animate Value ==================== */
function animateValue(element, targetValue, decimals) {
    const currentValue = parseFloat(element.textContent.replace(/,/g, '')) || 0;
    const difference = targetValue - currentValue;
    const duration = METRICS_CONFIG.animationDuration;
    const startTime = performance.now();

    element.classList.add('updating');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = currentValue + (difference * easeOutQuart);

        if (decimals === 0) {
            element.textContent = Math.round(value).toLocaleString();
        } else {
            element.textContent = value.toFixed(decimals);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('updating');
        }
    }

    requestAnimationFrame(update);
}

/* ==================== Update Change Indicator ==================== */
function updateChangeIndicator(element, change) {
    const isPositive = change >= 0;
    const absChange = Math.abs(change).toFixed(1);

    element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    element.innerHTML = `
        <i class="fa-solid fa-arrow-${isPositive ? 'up' : 'down'}"></i>
        <span>${isPositive ? '+' : '-'}${absChange}%</span>
    `;
}

/* ==================== Utility Functions ==================== */
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Export for external use
window.computeMetrics = {
    getState: () => metricsState,
    refresh: updateMetrics
};
