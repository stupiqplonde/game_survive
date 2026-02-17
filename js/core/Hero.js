class Hero {
    constructor(id, name, baseStats, type) {
        this.id = id;
        this.name = name;
        this.type = type; // 'warrior', 'archer', 'mage', 'rogue'
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100; // опыт до следующего уровня
        
        // Базовые характеристики (растут с уровнем)
        this.baseStats = baseStats || { hp: 100, attack: 10, defense: 5 };
        
        // Текущие характеристики (с учётом экипировки)
        this.currentStats = { ...this.baseStats };
        
        // Инвентарь (9 слотов)
        this.inventory = new Array(9).fill(null);
        
        // Экипировка (оружие, броня, аксессуар)
        this.equipment = { weapon: null, armor: null, accessory: null };
        
        // Навыки и очки навыков (каждые 3 уровня)
        this.skills = [];
        this.skillPoints = 0;
        
        this.isUnlocked = true; // По умолчанию все герои открыты для теста
    }
    
    addExp(amount) {
        if (!amount || amount <= 0) return;
        
        this.exp += amount;
        while (this.exp >= this.expToNextLevel) {
            this.levelUp();
        }
        this.updateCurrentStats();
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5); // Растёт требование
        
        // Улучшаем характеристики в зависимости от типа героя
        const statGrowth = {
            'warrior': { hp: 15, attack: 3, defense: 2 },
            'archer': { hp: 8, attack: 5, defense: 1, speed: 2 },
            'mage': { hp: 5, attack: 7, defense: 1 },
            'rogue': { hp: 7, attack: 6, defense: 1, speed: 3 }
        };
        
        const growth = statGrowth[this.type] || { hp: 10, attack: 2, defense: 1 };
        
        this.baseStats.hp = (this.baseStats.hp || 100) + (growth.hp || 10);
        this.baseStats.attack = (this.baseStats.attack || 10) + (growth.attack || 2);
        this.baseStats.defense = (this.baseStats.defense || 5) + (growth.defense || 1);
        if (growth.speed) {
            this.baseStats.speed = (this.baseStats.speed || 0) + growth.speed;
        }
        
        // Каждые 3 уровня — очко навыка
        if (this.level % 3 === 0) {
            this.skillPoints++;
        }
        
        this.updateCurrentStats(); // Пересчёт с учётом шмота
    }
    
    updateCurrentStats() {
        // Начинаем с базовых статов
        this.currentStats = { ...this.baseStats };
        
        // Добавляем бонусы от экипировки
        if (this.equipment) {
            Object.values(this.equipment).forEach(item => {
                if (item && item.statsBonus) {
                    Object.entries(item.statsBonus).forEach(([stat, value]) => {
                        if (this.currentStats[stat] !== undefined) {
                            this.currentStats[stat] += value;
                        } else {
                            this.currentStats[stat] = value;
                        }
                    });
                }
            });
        }
    }
    
    addToInventory(item) {
        if (!item) return false;
        
        // Ищем первый пустой слот
        const emptySlot = this.inventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            this.inventory[emptySlot] = item;
            return true;
        }
        return false; // Инвентарь полон
    }
    
    equip(item, slot) {
        if (!item || !this.equipment || this.equipment[slot] === undefined) return false;
        
        // Если в слоте уже есть предмет, кладём его в инвентарь
        const oldItem = this.equipment[slot];
        if (oldItem) {
            this.addToInventory(oldItem);
        }
        
        // Экипируем новый предмет
        this.equipment[slot] = item;
        
        // Удаляем предмет из инвентаря
        const itemIndex = this.inventory.findIndex(i => i && i.id === item.id);
        if (itemIndex !== -1) {
            this.inventory[itemIndex] = null;
        }
        
        this.updateCurrentStats();
        return true;
    }
    
    unequip(slot) {
        if (!this.equipment || this.equipment[slot] === undefined) return false;
        
        const item = this.equipment[slot];
        if (item) {
            // Пробуем положить в инвентарь
            if (this.addToInventory(item)) {
                this.equipment[slot] = null;
                this.updateCurrentStats();
                return true;
            }
        }
        return false;
    }
    
    useConsumable(slotIndex) {
        if (!this.inventory || slotIndex < 0 || slotIndex >= this.inventory.length) return false;
        
        const item = this.inventory[slotIndex];
        if (item && item.type === 'consumable') {
            // Применяем эффект
            if (item.effect) {
                if (item.effect.type === 'heal') {
                    const maxHp = (this.baseStats.hp || 100) * 2;
                    this.currentStats.hp = Math.min(
                        (this.currentStats.hp || 0) + (item.effect.value || 0),
                        maxHp
                    );
                } else if (item.effect.type === 'exp') {
                    this.addExp(item.effect.value || 0);
                } else if (item.effect.type === 'resource' && window.GameState) {
                    // Добавляем ресурсы в GameState
                    window.GameState.updateResource(item.effect.resourceType, item.effect.value || 0);
                }
            }
            
            this.inventory[slotIndex] = null; // Предмет использован
            this.updateCurrentStats();
            return true;
        }
        return false;
    }
    
    // Для пассивной генерации ресурсов - каждый тип героя дает разные ресурсы
    getPassiveGeneration() {
        const generation = {
            'warrior': { proviziya: 0.2 },
            'archer': { toplivo: 0.2 },
            'mage': { instrumenty: 0.2 },
            'rogue': { instrumenty: 1, proviziya: 1, toplivo: 1 }
        };
        
        return generation[this.type] || { proviziya: 0.1 };
    }
}

window.Hero = Hero;