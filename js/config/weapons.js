// js/config/weapons.js
// Конфигурация оружия

const WeaponConfig = {
    // Базовое оружие по классам
    baseWeapons: {
        warrior: {
            name: 'Меч',
            damage: 8,
            range: 70,
            cooldown: 1.4,
            type: 'melee',
            icon: '⚔️'
        },
        archer: {
            name: 'Лук',
            damage: 12,
            range: 300,
            cooldown: 1.7,
            type: 'ranged',
            accuracy: 0.8,
            icon: '🏹'
        },
        mage: {
            name: 'Посох',
            damage: 5,
            range: 200,
            cooldown: 2.8,
            type: 'magic',
            icon: '🔮'
        },
        rogue: {
            name: 'Кинжалы',
            damage: 6,
            range: 50,
            cooldown: 0.75,
            type: 'melee',
            icon: '🗡️'
        },
        default: {
            name: 'Кулаки',
            damage: 5,
            range: 60,
            cooldown: 1.0,
            type: 'melee',
            icon: '👊'
        }
    },
    
    // Игровое оружие (для магазина и крафта)
    weapons: [
        {
            id: 'weapon_sword_1',
            name: 'Деревянный меч',
            type: 'weapon',
            rarity: 'common',
            basePrice: 10,
            stats: { damage: 5, range: 1 },
            icon: '⚔️',
            description: 'Простой меч из дерева',
            weaponType: 'melee'
        },
        {
            id: 'weapon_sword_2',
            name: 'Железный меч',
            type: 'weapon',
            rarity: 'rare',
            basePrice: 50,
            stats: { damage: 12, range: 1 },
            icon: '⚔️',
            description: 'Тяжелый железный меч',
            weaponType: 'melee'
        }
    ]
};

window.WeaponConfig = WeaponConfig;