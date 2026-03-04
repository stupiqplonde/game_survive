// js/config/heroClasses.js
// Конфигурация классов героев

const HeroClassConfig = {
    warrior: {
        name: 'Воин',
        baseStats: { hp: 120, attack: 18, defense: 12, speed: 8 },
        description: 'Мастер ближнего боя, может носить тяжелую броню',
        equipmentSlots: {
            weapon1: { type: 'weapon', required: false },
            weapon2: { type: ['weapon', 'shield'], required: false },
            armor: { type: 'armor', required: true },
            accessory: { type: 'accessory', required: false }
        },
        startingWeapon: {
            name: 'Меч',
            damage: 8,
            range: 70,
            cooldown: 1.4,
            type: 'melee',
            icon: '⚔️'
        },
        color: '#4aff4a',
        icon: '⚔️'
    },
    
    archer: {
        name: 'Лучник',
        baseStats: { hp: 80, attack: 22, defense: 6, speed: 15 },
        description: 'Мастер дальнего боя, наносит критический урон',
        equipmentSlots: {
            weapon1: { type: 'weapon', required: true },
            armor: { type: 'armor', required: true },
            accessory1: { type: 'accessory', required: false },
            accessory2: { type: 'accessory', required: false }
        },
        startingWeapon: {
            name: 'Лук',
            damage: 12,
            range: 300,
            cooldown: 1.7,
            type: 'ranged',
            accuracy: 0.8,
            icon: '🏹'
        },
        color: '#ffaa00',
        icon: '🏹'
    },
    
    mage: {
        name: 'Маг',
        baseStats: { hp: 70, attack: 25, defense: 4, speed: 12 },
        description: 'Владеет магией, может замедлять врагов',
        equipmentSlots: {
            weapon1: { type: 'weapon', required: true },
            accessory1: { type: 'accessory', required: false },
            accessory2: { type: 'accessory', required: false },
            accessory3: { type: 'accessory', required: false }
        },
        startingWeapon: {
            name: 'Посох',
            damage: 5,
            range: 200,
            cooldown: 2.8,
            type: 'magic',
            icon: '🔮'
        },
        color: '#aa4aff',
        icon: '🔮'
    },
    
    rogue: {
        name: 'Разбойник',
        baseStats: { hp: 90, attack: 16, defense: 8, speed: 18 },
        description: 'Быстрый и смертоносный, ставит ловушки',
        equipmentSlots: {
            weapon1: { type: 'weapon', required: true },
            weapon2: { type: 'weapon', required: false },
            accessory1: { type: 'accessory', required: false },
            accessory2: { type: 'accessory', required: false }
        },
        startingWeapon: {
            name: 'Кинжалы',
            damage: 6,
            range: 50,
            cooldown: 0.75,
            type: 'melee',
            icon: '🗡️'
        },
        color: '#ff4a4a',
        icon: '🗡️'
    }
};

window.HeroClassConfig = HeroClassConfig;