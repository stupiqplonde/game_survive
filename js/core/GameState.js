// Хранилище состояния игры (глобальная переменная)
const GameState = {
    resources: {
        proviziya: 10,
        toplivo: 5,
        instrumenty: 3
    },
    materials: {
        wood: 0,
        metal: 0,
        cloth: 0
    },
    heroes: [],
    currentHeroId: null,
    unlockedLocations: ['forest'],
    unlockedRecipes: [],
    settings: { sound: true, music: true },
    
    _listeners: [],
    lastPassiveUpdate: Date.now(),
    
    subscribe(listener) {
        this._listeners.push(listener);
    },
    
    notify() {
        this._listeners.forEach(listener => {
            try {
                listener(this);
            } catch (e) {
                console.error('Ошибка в слушателе:', e);
            }
        });
    },
    
    updateResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] = Math.max(0, this.resources[type] + amount);
            this.notify();
        }
    },
    
    updateMaterial(type, amount) {
        if (this.materials[type] !== undefined) {
            this.materials[type] = Math.max(0, this.materials[type] + amount);
            this.notify();
        }
    },
    
    // Пассивное обновление ресурсов
    passiveUpdate() {
        const now = Date.now();
        const diffSeconds = Math.floor((now - this.lastPassiveUpdate) / 1000);
        
        if (diffSeconds >= 1) {
            let resourcesGained = { proviziya: 0, toplivo: 0, instrumenty: 0 };
            
            // Каждый открытый герой генерирует ресурсы в зависимости от типа
            if (this.heroes && this.heroes.length > 0) {
                this.heroes.forEach(hero => {
                    if (hero && hero.isUnlocked) {
                        const generation = hero.getPassiveGeneration ? hero.getPassiveGeneration() : { proviziya: 0.1 };
                        Object.entries(generation).forEach(([resource, rate]) => {
                            resourcesGained[resource] = (resourcesGained[resource] || 0) + rate * diffSeconds;
                        });
                    }
                });
            }
            
            // Применяем накопленное (с округлением до целых)
            let changed = false;
            Object.entries(resourcesGained).forEach(([resource, amount]) => {
                if (amount >= 1 && this.resources[resource] !== undefined) {
                    const intPart = Math.floor(amount);
                    this.resources[resource] += intPart;
                    changed = true;
                }
            });
            
            this.lastPassiveUpdate = now;
            if (changed) {
                this.notify();
            }
        }
    },
    
    getCurrentHero() {
        return this.heroes.find(h => h && h.id === this.currentHeroId);
    },
    
    selectHero(heroId) {
        this.currentHeroId = heroId;
        this.notify();
        
        // Обновляем отображение в шапке
        const heroNameSpan = document.getElementById('currentHeroName');
        if (heroNameSpan) {
            const hero = this.getCurrentHero();
            heroNameSpan.textContent = `Герой: ${hero && hero.name ? hero.name : 'Не выбран'}`;
        }
    },
    
    save() {
        try {
            const saveData = {
                resources: { ...this.resources },
                materials: { ...this.materials },
                currentHeroId: this.currentHeroId,
                unlockedLocations: [...this.unlockedLocations],
                unlockedRecipes: [...this.unlockedRecipes],
                settings: { ...this.settings },
                heroes: this.heroes.map(hero => ({
                    id: hero.id,
                    name: hero.name,
                    type: hero.type,
                    level: hero.level,
                    exp: hero.exp,
                    expToNextLevel: hero.expToNextLevel,
                    baseStats: { ...hero.baseStats },
                    currentStats: { ...hero.currentStats },
                    inventory: hero.inventory ? hero.inventory.map(item => item ? { ...item } : null) : [],
                    equipment: {
                        weapon: hero.equipment?.weapon ? { ...hero.equipment.weapon } : null,
                        armor: hero.equipment?.armor ? { ...hero.equipment.armor } : null,
                        accessory: hero.equipment?.accessory ? { ...hero.equipment.accessory } : null
                    },
                    skills: [...(hero.skills || [])],
                    skillPoints: hero.skillPoints || 0,
                    isUnlocked: hero.isUnlocked !== undefined ? hero.isUnlocked : true
                }))
            };
            
            localStorage.setItem('gameState', JSON.stringify(saveData));
            console.log('Игра сохранена');
        } catch (e) {
            console.error('Ошибка сохранения:', e);
        }
    },
    
    load() {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Загружаем простые данные
                if (data.resources) Object.assign(this.resources, data.resources);
                if (data.materials) Object.assign(this.materials, data.materials);
                this.currentHeroId = data.currentHeroId || null;
                this.unlockedLocations = data.unlockedLocations || ['forest'];
                this.unlockedRecipes = data.unlockedRecipes || [];
                if (data.settings) Object.assign(this.settings, data.settings);
                
                // Загружаем героев (создаём экземпляры Hero)
                if (data.heroes && Array.isArray(data.heroes) && data.heroes.length > 0) {
                    this.heroes = data.heroes.map(heroData => {
                        try {
                            // Проверяем, что данные валидны
                            if (!heroData || !heroData.id || !heroData.name || !heroData.type) {
                                return null;
                            }
                            
                            // Создаем базовые статы, если их нет
                            const baseStats = heroData.baseStats || { hp: 100, attack: 10, defense: 5 };
                            
                            const hero = new Hero(
                                heroData.id,
                                heroData.name,
                                baseStats,
                                heroData.type
                            );
                            
                            // Восстанавливаем остальные свойства
                            hero.level = heroData.level || 1;
                            hero.exp = heroData.exp || 0;
                            hero.expToNextLevel = heroData.expToNextLevel || 100;
                            
                            // Восстанавливаем статы
                            if (heroData.currentStats) {
                                hero.currentStats = { ...heroData.currentStats };
                            } else {
                                hero.currentStats = { ...baseStats };
                            }
                            
                            // Восстанавливаем инвентарь
                            if (heroData.inventory && Array.isArray(heroData.inventory)) {
                                hero.inventory = heroData.inventory.map(itemData => {
                                    if (itemData) {
                                        // Восстанавливаем предмет как простой объект (без методов)
                                        return {
                                            id: itemData.id,
                                            name: itemData.name,
                                            type: itemData.type,
                                            rarity: itemData.rarity || 'common',
                                            price: itemData.price || 0,
                                            statsBonus: itemData.statsBonus || {},
                                            effect: itemData.effect || null,
                                            icon: itemData.icon || '📦'
                                        };
                                    }
                                    return null;
                                });
                            } else {
                                hero.inventory = new Array(9).fill(null);
                            }
                            
                            // Восстанавливаем экипировку
                            hero.equipment = {
                                weapon: heroData.equipment?.weapon || null,
                                armor: heroData.equipment?.armor || null,
                                accessory: heroData.equipment?.accessory || null
                            };
                            
                            hero.skills = heroData.skills || [];
                            hero.skillPoints = heroData.skillPoints || 0;
                            hero.isUnlocked = heroData.isUnlocked !== undefined ? heroData.isUnlocked : true;
                            
                            return hero;
                        } catch (e) {
                            console.error('Ошибка загрузки героя:', e, heroData);
                            return null;
                        }
                    }).filter(hero => hero !== null); // Удаляем некорректных героев
                }
                
                console.log('Игра загружена, героев:', this.heroes.length);
                this.notify();
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e);
            }
        } else {
            console.log('Нет сохранений, используем начальные данные');
        }
    }
};

// Запускаем цикл пассивного обновления
setInterval(() => {
    if (window.GameState) {
        window.GameState.passiveUpdate();
    }
}, 1000); // Каждую секунду проверяем, сколько прошло времени

// Делаем глобальной
window.GameState = GameState;