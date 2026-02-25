class UIManager {
    constructor() {
        this.screens = {
            lobby: document.getElementById('screenLobby'),
            heroes: document.getElementById('screenHeroes'),
            shop: document.getElementById('screenShop'),
            craft: document.getElementById('screenCraft')
        };
        
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.resourceElements = {
            proviziya: document.querySelector('#proviziya span'),
            toplivo: document.querySelector('#toplivo span'),
            instrumenty: document.querySelector('#instrumenty span')
        };
        
        this.modal = document.getElementById('heroModal');
        this.modalBody = document.getElementById('modalBody');
        
        this.initEventListeners();
        this.subscribeToState();
        this.updateResourcesUI();
        this.renderHeroes();
        
        // Небольшая задержка для рендера героев, чтобы GameState успел загрузиться
        setTimeout(() => this.renderHeroes(), 100);
    }
    
    initEventListeners() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenId = e.target.dataset.screen;
                this.showScreen(screenId);
                this.setActiveNavButton(e.target);
            });
        });
        
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }
    
    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
            
            // Обновляем контент при переключении на экран героев
            if (screenId === 'heroes') {
                this.renderHeroes();
            }
        }
    }
    
    setActiveNavButton(activeBtn) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
    
    subscribeToState() {
        window.GameState.subscribe(() => {
            this.updateResourcesUI();
            // Проверяем, активен ли экран героев перед обновлением
            if (this.screens.heroes && this.screens.heroes.classList.contains('active')) {
                this.renderHeroes();
            }
        });
    }
    
    updateResourcesUI() {
        if (this.resourceElements.proviziya) {
            this.resourceElements.proviziya.textContent = Math.floor(window.GameState.resources.proviziya || 0);
        }
        if (this.resourceElements.toplivo) {
            this.resourceElements.toplivo.textContent = Math.floor(window.GameState.resources.toplivo || 0);
        }
        if (this.resourceElements.instrumenty) {
            this.resourceElements.instrumenty.textContent = Math.floor(window.GameState.resources.instrumenty || 0);
        }
    }
    
    renderHeroes() {
        const container = document.getElementById('heroesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const heroes = window.GameState.heroes || [];
        if (heroes.length === 0) {
            container.innerHTML = '<div class="empty-state">Нет доступных героев</div>';
            return;
        }
        
        heroes.forEach(hero => {
            if (!hero) return; // Пропускаем некорректных героев
            
            try {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                
                // Подсвечиваем выбранного героя
                if (hero.id === window.GameState.currentHeroId) {
                    heroCard.classList.add('selected');
                }
                
                // Проверяем наличие статов
                const currentStats = hero.currentStats || hero.baseStats || { hp: 100, attack: 10, defense: 5 };
                
                // Прогресс опыта в процентах
                const expPercent = hero.expToNextLevel ? (hero.exp / hero.expToNextLevel) * 100 : 0;
                
                heroCard.innerHTML = `
                    <div class="hero-type">${this.getHeroTypeIcon(hero.type)} ${this.getHeroTypeName(hero.type)}</div>
                    <h3>${hero.name || 'Без имени'} <span class="hero-level">Ур. ${hero.level || 1}</span></h3>
                    <div class="hero-stats">
                        <div class="stat-item">❤️ ${currentStats.hp || 0}</div>
                        <div class="stat-item">⚔️ ${currentStats.attack || 0}</div>
                        <div class="stat-item">🛡️ ${currentStats.defense || 0}</div>
                        ${currentStats.speed ? `<div class="stat-item">⚡ ${currentStats.speed}</div>` : ''}
                    </div>
                    <div class="hero-exp">
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expPercent}%"></div>
                        </div>
                        <div class="exp-text">${hero.exp || 0}/${hero.expToNextLevel || 100} опыта</div>
                    </div>
                    <div class="hero-skills">
                        <div class="skill-points">🎯 Очки навыков: ${hero.skillPoints || 0}</div>
                    </div>
                    <div class="hero-actions">
                        <button class="select-hero-btn" data-hero-id="${hero.id}">Выбрать для боя</button>
                        <button class="inventory-hero-btn" data-hero-id="${hero.id}">Инвентарь</button>
                    </div>
                `;
                
                container.appendChild(heroCard);
            } catch (e) {
                console.error('Ошибка при создании карточки героя:', e, hero);
            }
        });
        
        // Добавляем обработчики
        this.attachHeroButtonListeners();
    }
    
    getHeroTypeIcon(type) {
        const icons = {
            'warrior': '⚔️',
            'archer': '🏹',
            'mage': '🔮',
            'rogue': '🗡️'
        };
        return icons[type] || '👤';
    }
    
    getHeroTypeName(type) {
        const names = {
            'warrior': 'Воин',
            'archer': 'Лучник',
            'mage': 'Маг',
            'rogue': 'Разбойник'
        };
        return names[type] || type;
    }
    
    attachHeroButtonListeners() {
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = btn.dataset.heroId;
                window.GameState.selectHero(heroId);
            });
        });
        
        document.querySelectorAll('.inventory-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = btn.dataset.heroId;
                this.showHeroInventory(heroId);
            });
        });
    }
    
    showHeroInventory(heroId) {
        const hero = window.GameState.heroes.find(h => h && h.id === heroId);
        if (!hero) {
            alert('Герой не найден');
            return;
        }
        
        try {
            // Создаем сетку инвентаря 3x3
            const inventoryGrid = [];
            for (let i = 0; i < 3; i++) {
                let row = '<div class="inventory-row">';
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    const item = hero.inventory && hero.inventory[index] ? hero.inventory[index] : null;
                    if (item) {
                        row += `
                            <div class="inventory-slot filled" data-slot="${index}" data-item-id="${item.id}">
                                <div class="item-icon">${item.icon || '📦'}</div>
                                <div class="item-name">${item.name || 'Предмет'}</div>
                                <div class="item-type">${item.type || 'unknown'}</div>
                            </div>
                        `;
                    } else {
                        row += `<div class="inventory-slot empty" data-slot="${index}">Пусто</div>`;
                    }
                }
                row += '</div>';
                inventoryGrid.push(row);
            }
            
            const equipment = hero.equipment || { weapon: null, armor: null, accessory: null };
            
            this.modalBody.innerHTML = `
                <h2>Инвентарь ${hero.name || 'Героя'}</h2>
                <div class="inventory-container">
                    ${inventoryGrid.join('')}
                </div>
                <h3>Экипировка</h3>
                <div class="equipment-container">
                    <div class="equipment-slot ${equipment.weapon ? 'filled' : 'empty'}">
                        <div class="slot-label">⚔️ Оружие</div>
                        <div class="slot-content">
                            ${equipment.weapon ? 
                                `<span class="item-name">${equipment.weapon.name || 'Оружие'}</span>
                                 <button class="unequip-btn" data-slot="weapon">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                    <div class="equipment-slot ${equipment.armor ? 'filled' : 'empty'}">
                        <div class="slot-label">🛡️ Броня</div>
                        <div class="slot-content">
                            ${equipment.armor ? 
                                `<span class="item-name">${equipment.armor.name || 'Броня'}</span>
                                 <button class="unequip-btn" data-slot="armor">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                    <div class="equipment-slot ${equipment.accessory ? 'filled' : 'empty'}">
                        <div class="slot-label">📿 Аксессуар</div>
                        <div class="slot-content">
                            ${equipment.accessory ? 
                                `<span class="item-name">${equipment.accessory.name || 'Аксессуар'}</span>
                                 <button class="unequip-btn" data-slot="accessory">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                </div>
                <div class="hero-actions">
                    <button class="close-inventory-btn">Закрыть</button>
                </div>
            `;
            
            // Добавляем обработчики для предметов в инвентаре
            this.modalBody.querySelectorAll('.inventory-slot.filled').forEach(slot => {
                slot.addEventListener('click', (e) => {
                    const slotIndex = parseInt(slot.dataset.slot);
                    const item = hero.inventory[slotIndex];
                    
                    if (item && item.type === 'consumable') {
                        if (confirm(`Использовать ${item.name}?`)) {
                            if (hero.useConsumable) {
                                hero.useConsumable(slotIndex);
                            }
                            this.modal.style.display = 'none';
                            this.showHeroInventory(heroId);
                        }
                    } else if (item) {
                        // Для экипировки - предлагаем надеть
                        const slotType = prompt('В какой слот надеть? (weapon/armor/accessory)');
                        if (slotType && ['weapon', 'armor', 'accessory'].includes(slotType)) {
                            if (hero.equip) {
                                hero.equip(item, slotType);
                            }
                            this.modal.style.display = 'none';
                            this.showHeroInventory(heroId);
                        }
                    }
                });
            });
            
            // Обработчики для снятия экипировки
            this.modalBody.querySelectorAll('.unequip-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slot = btn.dataset.slot;
                    if (hero.unequip) {
                        hero.unequip(slot);
                    }
                    this.modal.style.display = 'none';
                    this.showHeroInventory(heroId);
                });
            });
            
            // Закрытие
            const closeBtn = this.modalBody.querySelector('.close-inventory-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.modal.style.display = 'none';
                });
            }
            
            this.modal.style.display = 'block';
        } catch (e) {
            console.error('Ошибка при показе инвентаря:', e);
            alert('Ошибка при открытии инвентаря');
        }
    }
    
    showModal(content) {
        this.modalBody.innerHTML = content;
        this.modal.style.display = 'block';
    }
}

// Делаем глобальной
window.UIManager = UIManager;