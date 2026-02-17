class HeroScreen {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.container = document.getElementById('heroesList');
        this.currentHero = null;
        this.sortType = 'none'; // 'type', 'rarity'
        this.init();
    }
    
    init() {
        window.GameState.subscribe(() => this.render());
        this.render();
    }
    
    render() {
        const heroes = window.GameState.heroes;
        if (!this.container) return;
        
        if (heroes.length === 0) {
            this.container.innerHTML = '<div class="empty-state">Нет доступных героев</div>';
            return;
        }
        
        this.container.innerHTML = heroes.map(hero => `
            <div class="hero-card" data-hero-id="${hero.id}">
                <h3>${hero.name}</h3>
                <p>Уровень: ${hero.level}</p>
                <p>❤️ ${hero.stats.hp} | ⚔️ ${hero.stats.attack} | 🛡️ ${hero.stats.defense}</p>
                <button class="select-hero-btn">Выбрать</button>
                <button class="inventory-btn">Инвентарь</button>
            </div>
        `).join('');
        
        this.attachEvents();
    }
    
    attachEvents() {
        this.container.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroCard = e.target.closest('.hero-card');
                const heroId = heroCard.dataset.heroId;
                window.GameState.currentHeroId = heroId;
                this.currentHero = window.GameState.heroes.find(h => h.id === heroId);
                document.getElementById('currentHeroName').textContent = 
                    `Герой: ${this.currentHero.name}`;
                alert(`Выбран герой ${this.currentHero.name}`);
            });
        });
        
        this.container.querySelectorAll('.inventory-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroCard = e.target.closest('.hero-card');
                const heroId = heroCard.dataset.heroId;
                const hero = window.GameState.heroes.find(h => h.id === heroId);
                this.showInventory(hero);
            });
        });
    }
    
    showInventory(hero) {
        this.currentHero = hero;
        this.renderInventory();
    }
    
    renderInventory() {
        const hero = this.currentHero;
        if (!hero) return;
        
        let inventoryItems = [...hero.inventory];
        
        // Сортировка
        if (this.sortType === 'type') {
            inventoryItems.sort((a, b) => {
                if (!a) return 1;
                if (!b) return -1;
                return (a.type || '').localeCompare(b.type || '');
            });
        } else if (this.sortType === 'rarity') {
            const rarityOrder = { 'epic': 0, 'rare': 1, 'common': 2 };
            inventoryItems.sort((a, b) => {
                if (!a) return 1;
                if (!b) return -1;
                return (rarityOrder[a.rarity] || 999) - (rarityOrder[b.rarity] || 999);
            });
        }
        
        const inventoryHtml = `
            <h2>Инвентарь ${hero.name}</h2>
            <div class="inventory-controls">
                <button class="sort-type-btn">Сортировать по типу</button>
                <button class="sort-rarity-btn">Сортировать по редкости</button>
                <button class="sort-clear-btn">Сбросить</button>
            </div>
            <div class="inventory-grid">
                ${inventoryItems.map((item, index) => `
                    <div class="inventory-slot" data-slot="${index}">
                        ${item ? `
                            <div class="item rarity-${item.rarity || 'common'}" 
                                 data-item-id="${item.id}">
                                <div class="item-name">${item.name}</div>
                                <div class="item-type">${this.getItemTypeIcon(item.type)}</div>
                                <div class="item-rarity">${item.rarity || 'common'}</div>
                            </div>
                        ` : '<div class="empty-slot">Пусто</div>'}
                    </div>
                `).join('')}
            </div>
        `;
        
        this.uiManager.showModal(inventoryHtml);
        
        // Добавляем обработчики сортировки
        document.querySelector('.sort-type-btn')?.addEventListener('click', () => {
            this.sortType = 'type';
            this.renderInventory();
        });
        
        document.querySelector('.sort-rarity-btn')?.addEventListener('click', () => {
            this.sortType = 'rarity';
            this.renderInventory();
        });
        
        document.querySelector('.sort-clear-btn')?.addEventListener('click', () => {
            this.sortType = 'none';
            this.renderInventory();
        });
        
        // Добавляем обработчики для предметов
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', (e) => {
                const itemId = item.dataset.itemId;
                const heroItem = hero.inventory.find(i => i && i.id === itemId);
                if (heroItem) {
                    this.showItemDetails(heroItem, hero);
                }
            });
        });
    }
    
    getItemTypeIcon(type) {
        const icons = {
            'weapon_melee': '⚔️',
            'weapon_ranged': '🏹',
            'armor': '🛡️',
            'consumable': '🧪'
        };
        return icons[type] || '📦';
    }
    
    showItemDetails(item, hero) {
        const itemHtml = `
            <h2>${item.name}</h2>
            <p>Тип: ${this.getItemTypeName(item.type)}</p>
            <p>Редкость: ${item.rarity}</p>
            <h3>Бонусы:</h3>
            <ul>
                ${Object.entries(item.statsBonus || {}).map(([stat, value]) => 
                    `<li>${this.getStatName(stat)}: +${value}</li>`
                ).join('')}
            </ul>
            <button class="unequip-item-btn">Снять предмет</button>
            <button class="close-modal-btn">Закрыть</button>
        `;
        
        this.uiManager.showModal(itemHtml);
        
        document.querySelector('.unequip-item-btn')?.addEventListener('click', () => {
            const slotIndex = hero.inventory.findIndex(i => i && i.id === item.id);
            if (slotIndex !== -1) {
                hero.unequipItem(slotIndex);
                this.renderInventory();
            }
        });
        
        document.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.getElementById('heroModal').style.display = 'none';
        });
    }
    
    getItemTypeName(type) {
        const types = {
            'weapon_melee': 'Ближнее оружие',
            'weapon_ranged': 'Дальнее оружие',
            'armor': 'Броня',
            'consumable': 'Расходник'
        };
        return types[type] || type;
    }
    
    getStatName(stat) {
        const names = {
            'hp': 'Здоровье',
            'attack': 'Атака',
            'defense': 'Защита'
        };
        return names[stat] || stat;
    }
}

window.HeroScreen = HeroScreen;