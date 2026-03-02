// Базовый класс предмета
class Item {
    constructor(id, name, type, rarity, basePrice, icon = '📦') {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.basePrice = basePrice;
        this.icon = icon;
        this.description = ''; // Будет заполняться в дочерних классах
    }
    
    getPrice() {
        return this.basePrice;
    }
}

// Класс оружия
class Weapon extends Item {
    constructor(id, name, rarity, basePrice, stats, icon = '⚔️') {
        super(id, name, 'weapon', rarity, basePrice, icon);
        this.damage = stats.damage || 0;
        this.range = stats.range || 1; // 1 - ближний бой, 2+ - дальний
        this.attackSpeed = stats.attackSpeed || 1.0;
        this.description = `Урон: ${this.damage}, Дальность: ${this.range}`;
    }
}

// Класс брони
class Armor extends Item {
    constructor(id, name, rarity, basePrice, stats, icon = '🛡️') {
        super(id, name, 'armor', rarity, basePrice, icon);
        this.defense = stats.defense || 0;
        this.bonusHp = stats.bonusHp || 0;
        this.description = `Защита: ${this.defense}, HP: +${this.bonusHp}`;
    }
}

// Класс расходника
class Consumable extends Item {
    constructor(id, name, rarity, basePrice, effect, value, icon = '💗') {
        super(id, name, 'consumable', rarity, basePrice, icon);
        this.effect = effect;
        this.value = value;
        this.usableInBattle = true;
        this.description = `${effect === 'heal' ? 'Восстанавливает' : 'Дает'} ${value}`;
    }
}

// Класс материала для крафта
class Material extends Item {
    constructor(id, name, rarity, basePrice, icon = '🔨') {
        super(id, name, 'material', rarity, basePrice, icon);
        this.description = 'Используется для крафта';
    }
}

// Делаем все классы глобальными
window.Weapon = Weapon;
window.Armor = Armor;
window.Consumable = Consumable;
window.Material = Material;
window.Item = Item;