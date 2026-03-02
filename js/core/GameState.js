const GameState = {
    resources: {
        proviziya: 10,
        toplivo: 5,
        instrumenty: 3
    },
    
    heroes: [],

    currentHeroId: null,

    lastPassiveUpdate: Date.now(),
    
    inventory: {            
        material_wood: 5,
        material_iron: 2,
        material_cloth: 3
    },

    shop: null,

    recipeManager: null,

    skillManager: null,

    _listeners: [],

    subscribe(callback) {
        this._listeners.push(callback);
    },

    notify() {
        this._listeners.forEach(cb => cb(this));
    },

    updateResource(type, amount) {
        if (this.resources[type] !== undefined) {
            // Убеждаемся, что ресурс не уходит в минус.
            this.resources[type] = Math.max(0, this.resources[type] + amount);
            // Оповещаем UI, что данные изменились.
            this.notify();
        }
    },

    updateMaterial(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] = Math.max(0, this.materials[type] + amount);
            this.notify();
        }
    },

    getMaterials() {
        return {
            wood: this.inventory.material_wood || 0,
            iron: this.inventory.material_iron || 0,
            cloth: this.inventory.material_cloth || 0
        };
    },

    renderHeroes() {
        const container = document.getElementById('heroesList');
        container.innerHTML = ''; // Очищаем контейнер
        
        window.GameState.heroes.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card';
            
            // Если герой выбран - выделяем его красной рамкой
            if (hero.id === window.GameState.currentHeroId) {
                heroCard.style.border = '2px solid #e94560';
            }
            
            heroCard.innerHTML = `
                <h3>${hero.name} (Ур. ${hero.level})</h3>
                <div class="hero-stats">
                    <p>❤️ HP: ${hero.currentStats.hp}</p>
                    <p>⚔️ Атака: ${hero.currentStats.attack}</p>
                    <p>🛡️ Защита: ${hero.currentStats.defense}</p>
                </div>
                <div class="hero-exp">
                    <progress value="${hero.exp}" max="${hero.expToNextLevel}"></progress>
                    <p>${hero.exp}/${hero.expToNextLevel} опыта</p>
                </div>
                <button class="select-hero-btn" data-hero-id="${hero.id}">Выбрать для боя</button>
                <button class="inventory-hero-btn" data-hero-id="${hero.id}">Инвентарь</button>
            `;
            
            container.appendChild(heroCard);
        });
        
        // Добавляем обработчики для кнопок выбора героя
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                window.GameState.selectHero(heroId);
                this.renderHeroes(); // Перерисовываем для обновления рамки
            });
        });
        
        // Добавляем обработчики для кнопок инвентаря
        document.querySelectorAll('.inventory-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                this.showHeroInventory(heroId);
            });
        });
    },

    save() {
        const stateToSave = {
            resources: this.resources,
            heroes: this.heroes,
            currentHeroId: this.currentHeroId,
            materials: this.materials
        };
        localStorage.setItem('arenaSurvivorsSave', JSON.stringify(stateToSave));
        console.log('Игра сохранена!');
    },

    load() {
        const saved = localStorage.getItem('arenaSurvivorsSave');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.resources = parsed.resources;
            this.heroes = parsed.heroes;
            this.currentHeroId = parsed.currentHeroId;
            this.materials = parsed.materials;
            this.notify();
            console.log('Игра загружена!');
        }
    },

    selectHero(heroId) {
        this.currentHeroId = heroId;
        
        // Обновляем отображение в шапке
        const heroNameSpan = document.getElementById('currentHeroName');
        const hero = this.heroes.find(h => h.id === heroId);
        if (hero) {
            heroNameSpan.textContent = `Герой: ${hero.name}`;
        } else {
            heroNameSpan.textContent = 'Герой: Не выбран';
        }
        
        this.notify();
    },

    getCurrentHero() {
        return this.heroes.find(h => h.id === this.currentHeroId);
    },

    initShop() {
        this.shop = new window.Shop();
        this.notify();
    },

    initRecipes() {
        this.recipeManager = new window.RecipeManager();
        this.notify();
    },

    initSkills() {
        this.skillManager = new window.SkillManager();
        this.notify();
    },

    craftItem(recipeId, heroId) {
        if (!this.recipeManager) {
            return { success: false, message: 'Система крафта не инициализирована' };
        }
        
        const hero = this.heroes.find(h => h.id === heroId);
        if (!hero) {
            return { success: false, message: 'Герой не найден' };
        }
        
        // Крафтим предмет
        const result = this.recipeManager.craft(recipeId, hero, this.inventory);
        
        if (result.success) {
            this.notify(); // Обновляем UI
        }
        
        return result;
    },

    addBattleRewards() {
        // Случайные материалы
        const materials = [
            { type: 'material_wood', amount: Math.floor(Math.random() * 3) + 1 },
            { type: 'material_iron', amount: Math.floor(Math.random() * 2) },
            { type: 'material_cloth', amount: Math.floor(Math.random() * 2) }
        ];
        
        materials.forEach(m => {
            if (m.amount > 0) {
                this.updateMaterial(m.type, m.amount);
            }
        });
        
        // Шанс открыть новый рецепт (30%)
        if (this.recipeManager && Math.random() < 0.3) {
            const newRecipe = this.recipeManager.tryUnlockRandomRecipe();
            if (newRecipe) {
                return {
                    materials: materials,
                    newRecipe: newRecipe
                };
            }
        }
        
        return { materials: materials };
    },

    passiveUpdate() {
        const now = Date.now();
        const diffSeconds = Math.floor((now - this.lastPassiveUpdate) / 1000);
        
        if (diffSeconds >= 1) {
            const resourcesGained = {
                proviziya: 0,
                toplivo: 0,
                instrumenty: 0
            };
            
            this.heroes.forEach(hero => {
                if (hero.isUnlocked) {
                    resourcesGained.proviziya += 0.05 * diffSeconds;
                    resourcesGained.toplivo += 0.03 * diffSeconds;
                    resourcesGained.instrumenty += 0.02 * diffSeconds;
                }
            });
            
            this.resources.proviziya = Math.round((this.resources.proviziya + resourcesGained.proviziya) * 10) / 10;
            this.resources.toplivo = Math.round((this.resources.toplivo + resourcesGained.toplivo) * 10) / 10;
            this.resources.instrumenty = Math.round((this.resources.instrumenty + resourcesGained.instrumenty) * 10) / 10;
            
            this.lastPassiveUpdate = now;
            
            if (this.shop) {
                const refreshed = this.shop.checkAndRefresh();
                if (refreshed) {
                    console.log('Ассортимент магазина обновлен!');
                }
            }
            
            this.notify();
        }
    }
};

window.GameState = GameState;

// Запускаем цикл пассивного обновления (каждую секунду)
setInterval(() => {
    window.GameState.passiveUpdate();
}, 1000);