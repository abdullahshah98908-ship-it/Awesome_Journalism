// ============= AI MOOD JOURNAL - FRONTEND =============
/**
 * Main application class for AI Mood Journal
 * Handles all frontend logic, API calls, and UI interactions
 */
class MoodJournal {
    constructor() {
        this.entries = [];
        this.currentFilter = 'all';
        this.moodChart = null;
        this.trendChart = null;
        this.init();
    }
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadTheme();
        this.loadEntries();
        this.loadStats();
        this.loadTrends();
    }

    cacheDOM() {
        this.journalInput = document.getElementById('journalInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.charCount = document.getElementById('charCount');
        this.entriesList = document.getElementById('entriesList');
        this.themeToggle = document.getElementById('themeToggle');
        this.toast = document.getElementById('toast');

        // Stats elements
        this.positiveCount = document.getElementById('positiveCount');
        this.neutralCount = document.getElementById('neutralCount');
        this.negativeCount = document.getElementById('negativeCount');
        this.totalCount = document.getElementById('totalCount');

        // Filter buttons
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Textarea input
        this.journalInput.addEventListener('input', () => this.updateCharCount());

        // Submit button
        this.submitBtn.addEventListener('click', () => this.submitEntry());

        // Ctrl+Enter shortcut
        this.journalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitEntry();
            }
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.filterEntries(btn));
        });
    }

    // ============= THEME MANAGEMENT =============

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        // Redraw charts with new theme
        this.loadStats();
        this.loadTrends();
    }

    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // ============= CHARACTER COUNT =============

    updateCharCount() {
        const length = this.journalInput.value.length;
        this.charCount.textContent = `${length} / 1000`;
        this.charCount.style.color = length > 900 ? 'var(--negative)' : 'var(--text-muted)';
    }

    // ============= API CALLS =============

    async fetchEntries() {
        const response = await fetch('/api/entries');
        if (!response.ok) throw new Error('Failed to fetch entries');
        return response.json();
    }

    async createEntry(text) {
        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create entry');
        }
        return data;
    }

    async deleteEntryAPI(id) {
        const response = await fetch(`/api/entries/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete entry');
        }
        return data;
    }

    async fetchStats() {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    }

    async fetchTrends() {
        const response = await fetch('/api/trends');
        if (!response.ok) throw new Error('Failed to fetch trends');
        return response.json();
    }

    // ============= DATA LOADING =============

    async loadEntries() {
        try {
            const data = await this.fetchEntries();
            this.entries = data.entries || [];
            this.renderEntries();
        } catch (error) {
            console.error('Failed to load entries:', error);
            this.showToast('Failed to load entries', 'error');
        }
    }

    async loadStats() {
        try {
            const stats = await this.fetchStats();
            this.updateStatsUI(stats);
            this.createMoodChart(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async loadTrends() {
        try {
            const data = await this.fetchTrends();
            this.createTrendChart(data.trends || {});
        } catch (error) {
            console.error('Failed to load trends:', error);
        }
    }

    // ============= ENTRY SUBMISSION =============

    async submitEntry() {
        const text = this.journalInput.value.trim();

        if (!text) {
            this.showToast('Please write something first', 'error');
            return;
        }

        // Show loading state
        this.submitBtn.disabled = true;
        const originalHTML = this.submitBtn.innerHTML;
        this.submitBtn.innerHTML = '<span>Analyzing...</span>';

        try {
            const data = await this.createEntry(text);

            if (data.success && data.entry) {
                // Add to top of list
                this.entries.unshift(data.entry);
                this.renderEntries();

                // Clear input
                this.journalInput.value = '';
                this.updateCharCount();

                // Refresh stats and charts
                await this.loadStats();
                await this.loadTrends();

                this.showToast(`Entry saved! Mood: ${data.entry.mood} 😊`, 'success');
            } else {
                this.showToast(data.error || 'Failed to save entry', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showToast(error.message || 'Failed to save entry', 'error');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = originalHTML;
        }
    }

    // ============= ENTRY DELETION =============

    async deleteEntry(id) {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        try {
            const data = await this.deleteEntryAPI(id);
            if (data.success) {
                this.entries = this.entries.filter(e => e.id !== id);
                this.renderEntries();
                await this.loadStats();
                await this.loadTrends();
                this.showToast('Entry deleted', 'success');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete entry', 'error');
        }
    }
    // ============= FILTERING =============

    filterEntries(btn) {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderEntries();
    }
    renderEntries() {
        const filtered = this.currentFilter === 'all'
            ? this.entries
            : this.entries.filter(e => e.mood === this.currentFilter);

        if (filtered.length === 0) {
            this.entriesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No entries yet</h3>
                    <p>Start writing your first journal entry above</p>
                </div>
            `;
            return;
        }

        this.entriesList.innerHTML = filtered.map((entry, index) => `
            <div class="entry-card" data-mood="${entry.mood}" style="animation-delay: ${index * 0.05}s">
                <div class="entry-header">
                    <div class="entry-meta">
                        <span class="mood-badge ${entry.mood}">
                            ${this.getMoodIcon(entry.mood)} ${entry.mood}
                        </span>
                        <span class="entry-date">${entry.created_at}</span>
                    </div>
                </div>
                <p class="entry-text">${this.escapeHtml(entry.text)}</p>
                <div class="entry-footer">
                    <div class="entry-score">
                        <span title="Polarity: -1 (negative) to +1 (positive)">
                            📊 ${entry.polarity > 0 ? '+' : ''}${entry.polarity}
                        </span>
                        <span title="Subjectivity: 0 (objective) to 1 (subjective)">
                            🎯 ${entry.subjectivity}
                        </span>
                    </div>
                    <button class="delete-btn" onclick="app.deleteEntry(${entry.id})" title="Delete entry">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getMoodIcon(mood) {
        const icons = { positive: '😊', negative: '😔', neutral: '😐' };
        return icons[mood] || '😐';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============= STATS UPDATE =============

    updateStatsUI(stats) {
        this.animateNumber(this.positiveCount, stats.positive || 0);
        this.animateNumber(this.neutralCount, stats.neutral || 0);
        this.animateNumber(this.negativeCount, stats.negative || 0);
        this.animateNumber(this.totalCount, stats.total || 0);
    }

    animateNumber(element, target) {
        const start = parseInt(element.textContent) || 0;
        if (start === target) return;

        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeProgress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // ============= CHARTS =============

    createMoodChart(stats) {
        const ctx = document.getElementById('moodChart');
        if (!ctx) return;

        if (this.moodChart) {
            this.moodChart.destroy();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#a0a0b8' : '#64748b';

        this.moodChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [stats.positive || 0, stats.neutral || 0, stats.negative || 0],
                    backgroundColor: [
                        'rgba(74, 222, 128, 0.8)',
                        'rgba(148, 163, 184, 0.8)',
                        'rgba(248, 113, 113, 0.8)'
                    ],
                    borderColor: [
                        'rgba(74, 222, 128, 1)',
                        'rgba(148, 163, 184, 1)',
                        'rgba(248, 113, 113, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 16,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    createTrendChart(trends) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        if (this.trendChart) {
            this.trendChart.destroy();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#a0a0b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

        const dates = Object.keys(trends).sort();

        if (dates.length === 0) {
            // Show empty chart
            this.trendChart = new Chart(ctx, {
                type: 'line',
                data: { labels: [], datasets: [] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
            return;
        }

        const positiveData = dates.map(d => trends[d].positive || 0);
        const neutralData = dates.map(d => trends[d].neutral || 0);
        const negativeData = dates.map(d => trends[d].negative || 0);

        const labels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Positive',
                        data: positiveData,
                        borderColor: 'rgba(74, 222, 128, 1)',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Neutral',
                        data: neutralData,
                        borderColor: 'rgba(148, 163, 184, 1)',
                        backgroundColor: 'rgba(148, 163, 184, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Negative',
                        data: negativeData,
                        borderColor: 'rgba(248, 113, 113, 1)',
                        backgroundColor: 'rgba(248, 113, 113, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 12,
                            font: { size: 11 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { size: 11 } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { size: 11 } },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // ============= TOAST NOTIFICATIONS =============

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// ============= INITIALIZATION =============
const app = new MoodJournal();
