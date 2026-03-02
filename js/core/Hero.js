// Класс героя в игре.
class Hero {
    constructor(id, name, baseStats, type) {
        this.id = id;
        this.name = name;
        this.type = type; // 'warrior', 'archer', 'mage', 'rogue'
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 100;
        this.isUnlocked = true;
        
        // Базовые характеристики
        this.baseStats = {
            hp: baseStats.hp || 100,
            attack: baseStats.attack || 10,
            defense: baseStats.defense || 5,
            speed: baseStats.speed || 10
        };
        
        // Максимальное здоровье (для удобства)
        this.maxHp = this.baseStats.hp;
        
        // Текущие характеристики (с учетом снаряжения и навыков)
        this.currentStats = { ...this.baseStats };
        
        // Инвентарь общий для всех героев (хранится в GameState)
        // Каждый герой имеет только ссылки на ID предметов
        
        // Снаряжение (зависит от класса)
        this.equipment = this.initEquipmentSlots();
        
        // Навыки
        this.learnedSkills = [];
        this.skillPoints = 0; // Очки навыков (получаются каждые 3 уровня)
        this.pendingSkillLevel = 0; // Уровень, на котором нужно выбрать навык
        
        // Боевые характеристики
        this.critChance = 0;
        this.critDamage = 1.5;
        this.lifesteal = 0;
        this.specialEffects = [];
    }
    
    initEquipmentSlots() {
        // Создаем слоты в зависимости от класса
        switch(this.type) {
            case 'warrior':
                return {
                    weapon1: null,  // Оружие 1
                    weapon2: null,  // Оружие 2 или щит
                    armor: null,    // Броня
                    accessory: null // Аксессуар
                };
            case 'archer':
                return {
                    weapon1: null,  // Лук
                    armor: null,    // Броня
                    accessory1: null, // Аксессуар 1
                    accessory2: null  // Аксессуар 2
                };
            case 'mage':
                return {
                    weapon1: null,  // Посох
                    accessory1: null, // Аксессуар 1
                    accessory2: null, // Аксессуар 2
                    accessory3: null  // Аксессуар 3
                };
            case 'rogue':
                return {
                    weapon1: null,  // Кинжал 1
                    weapon2: null,  // Кинжал 2
                    accessory1: null, // Аксессуар 1
                    accessory2: null  // Аксессуар 2
                };
            default:
                return {
                    weapon1: null,
                    armor: null,
                    accessory: null
                };
        }
    }
    
    // Добавить опыт
    // В классе ArenaHero замените метод addExp на этот:
    addExp(amount) {
        this.exp += amount;
        console.log(`Получено опыта: ${amount}, всего: ${this.exp}`);
        
        // Проверяем, достаточно ли опыта для повышения уровня
        while (this.exp >= 100) {
            this.levelUp();
        }
    }
    
    // Повышение уровня
    levelUp() {
        this.level++;
        this.exp -= 100;
        
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.attack += 2;
        
        // Обновляем данные героя
        this.heroData.level = this.level;
        this.heroData.exp = this.exp;
        this.heroData.baseStats.hp = this.maxHp;
        this.heroData.baseStats.attack = this.attack;
        
        // Проверяем, нужно ли дать навык (каждые 3 уровня)
        if (this.level % 3 === 0) {
            console.log(`🏆 Достигнут уровень ${this.level}! Можно выбрать навык.`);
            this.heroData.pendingSkillLevel = this.level;
        }
        
        console.log(`Уровень повышен до ${this.level}!`);
    }
    
    // Проверить, нужно ли выбрать навык
    hasPendingSkill() {
        const hasPending = this.pendingSkillLevel > 0;
        if (hasPending) {
            console.log(`hasPendingSkill() = true (pendingLevel: ${this.pendingSkillLevel})`);
        }
        return hasPending;
    }
    
    // Обновить текущие статы с учетом снаряжения и навыков
    updateCurrentStats() {
        this.currentStats = { ...this.baseStats };
        
        // Добавляем бонусы от снаряжения
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
            
            // Особые эффекты предметов
            if (item.special) {
                if (item.special.critChance) this.critChance += item.special.critChance;
                if (item.special.critDamage) this.critDamage += item.special.critDamage;
                if (item.special.lifesteal) this.lifesteal += item.special.lifesteal;
            }
        });
        
        // Убеждаемся, что текущее HP не превышает максимум
        if (this.currentStats.hp > this.maxHp) {
            this.currentStats.hp = this.maxHp;
        }
    }
    
    // Экипировать предмет
    equip(item, slot) {
        // Проверяем, подходит ли предмет для этого слота
        const validSlots = this.getValidSlotsForItem(item);
        
        if (!validSlots.includes(slot)) {
            console.log('Предмет нельзя экипировать в этот слот');
            return false;
        }
        
        // Если в слоте уже есть предмет, возвращаем его в инвентарь
        if (this.equipment[slot]) {
            window.GameState.addToInventory(this.equipment[slot]);
        }
        
        // Экипируем новый предмет
        this.equipment[slot] = item;
        
        // Удаляем предмет из инвентаря (по instanceId)
        window.GameState.removeFromInventory(item.instanceId || item.id);
        
        this.updateCurrentStats();
        return true;
    }
    
    // Снять предмет
    unequip(slot) {
        const item = this.equipment[slot];
        if (!item) return false;
        
        // Добавляем в инвентарь
        window.GameState.addToInventory(item);
        
        // Очищаем слот
        this.equipment[slot] = null;
        
        this.updateCurrentStats();
        return true;
    }
    
    // Получить допустимые слоты для предмета
    getValidSlotsForItem(item) {
        const slots = [];
        
        switch(item.type) {
            case 'weapon':
                if (this.type === 'warrior') {
                    slots.push('weapon1', 'weapon2');
                } else if (this.type === 'rogue') {
                    slots.push('weapon1', 'weapon2');
                } else {
                    slots.push('weapon1');
                }
                break;
            case 'shield':
                if (this.type === 'warrior') {
                    slots.push('weapon2'); // Щит можно поставить во второй слот оружия
                }
                break;
            case 'armor':
                if (['warrior', 'archer'].includes(this.type)) {
                    slots.push('armor');
                }
                break;
            case 'accessory':
                if (this.type === 'warrior') {
                    slots.push('accessory');
                } else if (this.type === 'archer') {
                    slots.push('accessory1', 'accessory2');
                } else if (this.type === 'mage') {
                    slots.push('accessory1', 'accessory2', 'accessory3');
                } else if (this.type === 'rogue') {
                    slots.push('accessory1', 'accessory2');
                }
                break;
        }
        
        return slots;
    }
    
    // Получить все экипированные предметы
    getEquippedItems() {
        return Object.values(this.equipment).filter(item => item !== null);
    }
    
    // Применить урон с учетом критов и эффектов
    calculateDamage(baseDamage) {
        let damage = baseDamage;
        
        // Критический удар
        if (Math.random() < this.critChance) {
            damage *= this.critDamage;
        }
        
        return Math.floor(damage);
    }
    
    // Восстановление здоровья (для вампиризма)
    heal(amount) {
        this.currentStats.hp = Math.min(this.currentStats.hp + amount, this.maxHp);
    }
}

// Делаем глобальным
window.Hero = Hero;