class Warehouse {
    constructor() {
        this.maxCapacity = {
            proviziya: 100,
            toplivo: 100,
            instrumenty: 100,
            wood: 200,
            metal: 200,
            cloth: 200
        };
        
        this.upgrades = {
            proviziya: 1,
            toplivo: 1,
            instrumenty: 1,
            wood: 1,
            metal: 1,
            cloth: 1
        };
        
        this._listeners = [];
    }
    
    subscribe(listener) {
        this._listeners.push(listener);
    }
    
    notify() {
        this._listeners.forEach(listener => listener(this));
    }
    
    getMaxForType(type) {
        return this.maxCapacity[type] * this.upgrades[type];
    }
    
    getCurrentForType(type) {
        if (window.GameState.resources[type] !== undefined) {
            return window.GameState.resources[type];
        }
        if (window.GameState.materials[type] !== undefined) {
            return window.GameState.materials[type];
        }
        return 0;
    }
    
    getPercentage(type) {
        const current = this.getCurrentForType(type);
        const max = this.getMaxForType(type);
        return Math.min(100, (current / max) * 100);
    }
    
    canAdd(type, amount) {
        const current = this.getCurrentForType(type);
        const max = this.getMaxForType(type);
        return current + amount <= max;
    }
    
    upgrade(type) {
        this.upgrades[type] = Math.min(5, this.upgrades[type] + 1);
        this.notify();
        this.save();
    }
    
    renderWarehouseStats() {
        const resourceTypes = ['proviziya', 'toplivo', 'instrumenty'];
        const materialTypes = ['wood', 'metal', 'cloth'];
        
        const resourceHtml = resourceTypes.map(type => `
            <div class="warehouse-item">
                <div class="warehouse-icon">${this.getIcon(type)}</div>
                <div class="warehouse-name">${this.getName(type)}</div>
                <div class="warehouse-bar">
                    <div class="warehouse-fill" style="width: ${this.getPercentage(type)}%"></div>
                </div>
                <div class="warehouse-value">
                    ${this.getCurrentForType(type)} / ${this.getMaxForType(type)}
                </div>
                <div class="warehouse-upgrade">
                    Ур. ${this.upgrades[type]}
                </div>
            </div>
        `).join('');
        
        const materialHtml = materialTypes.map(type => `
            <div class="warehouse-item">
                <div class="warehouse-icon">${this.getIcon(type)}</div>
                <div class="warehouse-name">${this.getName(type)}</div>
                <div class="warehouse-bar">
                    <div class="warehouse-fill" style="width: ${this.getPercentage(type)}%"></div>
                </div>
                <div class="warehouse-value">
                    ${this.getCurrentForType(type)} / ${this.getMaxForType(type)}
                </div>
                <div class="warehouse-upgrade">
                    Ур. ${this.upgrades[type]}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="warehouse-stats">
                <h3>📦 Ресурсы</h3>
                <div class="warehouse-grid">
                    ${resourceHtml}
                </div>
                <h3>🔨 Материалы</h3>
                <div class="warehouse-grid">
                    ${materialHtml}
                </div>
            </div>
        `;
    }
    
    getIcon(type) {
        const icons = {
            'proviziya': '🍞',
            'toplivo': '⛽',
            'instrumenty': '🔧',
            'wood': '🪵',
            'metal': '⚙️',
            'cloth': '🧵'
        };
        return icons[type] || '📦';
    }
    
    getName(type) {
        const names = {
            'proviziya': 'Провизия',
            'toplivo': 'Топливо',
            'instrumenty': 'Инструменты',
            'wood': 'Древесина',
            'metal': 'Металл',
            'cloth': 'Ткань'
        };
        return names[type] || type;
    }
    
    save() {
        localStorage.setItem('warehouse', JSON.stringify({
            upgrades: this.upgrades
        }));
    }
    
    load() {
        const saved = localStorage.getItem('warehouse');
        if (saved) {
            const data = JSON.parse(saved);
            this.upgrades = data.upgrades || this.upgrades;
        }
    }
}

window.Warehouse = Warehouse;