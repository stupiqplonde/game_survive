class Hero {
    constructor(id, name, baseStats, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.isUnlocked = true;
        
        // Получаем конфигурацию класса
        const classConfig = window.HeroClassConfig[type] || window.HeroClassConfig.warrior;
        
        // Базовые характеристики
        this.baseStats = {
            hp: baseStats.hp || classConfig.baseStats.hp,
            attack: baseStats.attack || classConfig.baseStats.attack,
            defense: baseStats.defense || classConfig.baseStats.defense,
            speed: baseStats.speed || classConfig.baseStats.speed
        };
        
        // Максимальное здоровье
        this.maxHp = this.baseStats.hp;
        
        // Текущие характеристики
        this.currentStats = { ...this.baseStats };
        
        // Снаряжение на основе конфигурации
        this.equipment = this.initEquipmentSlots(classConfig.equipmentSlots);
        
        // Навыки
        this.learnedSkills = [];
        this.skillPoints = 0;
        this.pendingSkillLevel = 0;
        
        // Боевые характеристики
        this.critChance = 0;
        this.critDamage = 1.5;
        this.lifesteal = 0;
        this.specialEffects = [];
        
        // Конфигурация класса
        this.classConfig = classConfig;
    }
    
    initEquipmentSlots(slotConfig) {
        const slots = {};
        for (const slotName of Object.keys(slotConfig)) {
            slots[slotName] = null;
        }
        return slots;
    }
    
    // Добавить опыт
    addExp(amount) {
        this.exp += amount;
        
        let leveledUp = false;
        while (this.exp >= this.expToNextLevel) {
            this.levelUp();
            leveledUp = true;
        }
        return leveledUp;
    }
    
    // Повышение уровня
    levelUp() {
        this.level++;
        this.exp -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
        
        this.baseStats.hp += 10;
        this.maxHp = this.baseStats.hp;
        this.baseStats.attack += 2;
        this.baseStats.defense += 1;
        
        if (this.level % 3 === 0) {
            this.pendingSkillLevel = this.level;
            this.skillPoints = (this.skillPoints || 0) + 1;
        }
        
        this.updateCurrentStats();
    }
    
    // Проверить, нужно ли выбрать навык
    hasPendingSkill() {
        return this.pendingSkillLevel > 0;
    }
    
    // Обновить текущие статы
    updateCurrentStats() {
        this.currentStats = { ...this.baseStats };
        
        const allEquipment = Object.values(this.equipment).filter(item => item !== null);
        
        allEquipment.forEach(item => {
            if (item.stats) {
                if (item.stats.attack) this.currentStats.attack += item.stats.attack;
                if (item.stats.defense) this.currentStats.defense += item.stats.defense;
                if (item.stats.hp) {
                    this.currentStats.hp += item.stats.hp;
                    this.maxHp += item.stats.hp;
                }
                if (item.stats.speed) this.currentStats.speed += item.stats.speed;
            }
            
            if (item.special) {
                if (item.special.critChance) this.critChance += item.special.critChance;
                if (item.special.critDamage) this.critDamage += item.special.critDamage;
                if (item.special.lifesteal) this.lifesteal += item.special.lifesteal;
            }
        });
        
        if (this.currentStats.hp > this.maxHp) {
            this.currentStats.hp = this.maxHp;
        }
    }
    
    // Экипировать предмет
    equip(item, slot) {
        const validSlots = this.getValidSlotsForItem(item);
        
        if (!validSlots.includes(slot)) return false;
        
        if (this.equipment[slot]) {
            window.GameState.addToInventory(this.equipment[slot]);
        }
        
        this.equipment[slot] = item;
        window.GameState.removeFromInventory(item.instanceId || item.id);
        this.updateCurrentStats();
        return true;
    }
    
    // Снять предмет
    unequip(slot) {
        const item = this.equipment[slot];
        if (!item) return false;
        
        window.GameState.addToInventory(item);
        this.equipment[slot] = null;
        this.updateCurrentStats();
        return true;
    }
    
    // Получить допустимые слоты для предмета
    getValidSlotsForItem(item) {
        const slots = [];
        
        switch(item.type) {
            case 'weapon':
                if (this.type === 'warrior' || this.type === 'rogue') {
                    slots.push('weapon1', 'weapon2');
                } else {
                    slots.push('weapon1');
                }
                break;
            case 'shield':
                if (this.type === 'warrior') slots.push('weapon2');
                break;
            case 'armor':
                if (['warrior', 'archer'].includes(this.type)) slots.push('armor');
                break;
            case 'accessory':
                if (this.type === 'warrior') slots.push('accessory');
                if (this.type === 'archer') slots.push('accessory1', 'accessory2');
                if (this.type === 'mage') slots.push('accessory1', 'accessory2', 'accessory3');
                if (this.type === 'rogue') slots.push('accessory1', 'accessory2');
                break;
        }
        return slots;
    }
    
    // Получить все экипированные предметы
    getEquippedItems() {
        return Object.values(this.equipment).filter(item => item !== null);
    }
    
    // Применить урон с учетом критов
    calculateDamage(baseDamage) {
        let damage = baseDamage;
        if (Math.random() < this.critChance) {
            damage *= this.critDamage;
        }
        return Math.floor(damage);
    }
    
    // Восстановление здоровья
    heal(amount) {
        this.currentStats.hp = Math.min(this.currentStats.hp + amount, this.maxHp);
    }
}

window.Hero = Hero;