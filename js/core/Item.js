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

window.Item = Item;