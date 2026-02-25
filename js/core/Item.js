class Item {
    constructor(id, name, type, rarity, price = 0, statsBonus = {}, effect = null) {
        this.id = id;
        this.name = name;
        this.type = type; // 'weapon', 'armor', 'accessory', 'consumable'
        this.rarity = rarity; // 'common', 'rare', 'epic'
        this.price = price; // цена в магазине
        this.statsBonus = statsBonus || {}; // { attack: +5, hp: +10 }
        this.effect = effect; // для расходников: { type: 'heal', value: 30 }
        this.icon = this.getIcon();
    }
    
    getIcon() {
        const icons = {
            'weapon': '⚔️',
            'armor': '🛡️',
            'accessory': '📿',
            'consumable': '🧪'
        };
        return icons[this.type] || '📦';
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

class Shield extends Item {
    constructor(id, name, rarity, basePrice, stats, icon = '🛡️') {
        super(id, name, 'shield', rarity, basePrice, icon);
        this.blockdamage = stats.damage || 0;
        this.blockSpeed = stats.blockSpeed || 0;
        this.bonusStats = stats.bonusStats || {};
        this.description = `Блокирует: ${this.blockdamage}, Периодичность: ${this.blockSpeed}`;
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
window.Shield = Shield;
window.Armor = Armor;
window.Consumable = Consumable;
window.Material = Material;

window.Item = Item;