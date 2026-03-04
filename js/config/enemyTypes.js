// js/config/enemyTypes.js
// Конфигурация типов врагов

const EnemyTypeConfig = {
    goblin: {
        name: 'Гоблин',
        baseHp: 30,
        baseAttack: 5,
        speed: 2,
        expValue: 10,
        color: '#2d5a27',
        spriteKey: 'goblin',
        variants: ['goblin', 'goblin_1', 'goblin_2'],
        bobSpeed: 9,
        attackInterval: 1.0,
        radius: 20
    },
    
    skeleton: {
        name: 'Скелет',
        baseHp: 40,
        baseAttack: 8,
        speed: 1.5,
        expValue: 15,
        color: '#aaaaaa',
        spriteKey: 'skeleton',
        variants: ['skeleton', 'skeleton_1'],
        bobSpeed: 6,
        attackInterval: 1.2,
        radius: 20
    },
    
    ghost: {
        name: 'Призрак',
        baseHp: 25,
        baseAttack: 6,
        speed: 3,
        expValue: 12,
        color: '#aa4aff',
        spriteKey: 'ghost',
        variants: ['ghost'],
        bobSpeed: 4,
        attackInterval: 0.8,
        radius: 18,
        effects: ['phase']
    },
    
    orc: {
        name: 'Орк',
        baseHp: 60,
        baseAttack: 12,
        speed: 1.2,
        expValue: 25,
        color: '#8B4513',
        spriteKey: 'orc',
        variants: ['orc'],
        bobSpeed: 5,
        attackInterval: 1.5,
        radius: 25
    },
    
    boss: {
        name: 'Босс',
        baseHp: 200,
        baseAttack: 25,
        speed: 1.0,
        expValue: 100,
        color: '#e94560',
        spriteKey: 'boss',
        variants: ['boss'],
        bobSpeed: 3,
        attackInterval: 2.0,
        radius: 35,
        isBoss: true,
        abilities: ['summon', 'rage']
    }
};

window.EnemyTypeConfig = EnemyTypeConfig;