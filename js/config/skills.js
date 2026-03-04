// js/config/skills.js
// Конфигурация навыков

const SkillConfig = {
    // Универсальные навыки (доступны всем)
    universal: [
        {
            id: 'skill_hp_1',
            name: 'Крепкое здоровье',
            description: 'Увеличивает максимальное здоровье на 20',
            type: 'passive',
            heroClasses: ['warrior', 'archer', 'mage', 'rogue'],
            levelRequirement: 3,
            effects: { hp: 20 },
            icon: '❤️'
        },
        {
            id: 'skill_hp_2',
            name: 'Железное здоровье',
            description: 'Увеличивает максимальное здоровье на 50',
            type: 'passive',
            heroClasses: ['warrior', 'archer', 'mage', 'rogue'],
            levelRequirement: 9,
            effects: { hp: 50 },
            icon: '💪'
        },
        {
            id: 'skill_attack_1',
            name: 'Острые клинки',
            description: 'Увеличивает атаку на 5',
            type: 'passive',
            heroClasses: ['warrior', 'archer', 'rogue'],
            levelRequirement: 3,
            effects: { attack: 5 },
            icon: '⚔️'
        }
    ],
    
    // Навыки воина
    warrior: [
        {
            id: 'skill_warrior_berserk',
            name: 'Берсерк',
            description: 'Увеличивает урон на 10%, но снижает защиту на 2',
            type: 'passive',
            heroClasses: ['warrior'],
            levelRequirement: 6,
            effects: { attack: 5, defense: -2 },
            icon: '🔥'
        },
        {
            id: 'skill_warrior_shield',
            name: 'Стена щитов',
            description: 'Увеличивает защиту на 8, шанс заблокировать атаку 15%',
            type: 'passive',
            heroClasses: ['warrior'],
            levelRequirement: 6,
            effects: { defense: 8, special: { type: 'block', chance: 0.15 } },
            icon: '🛡️'
        }
    ],
    
    // Навыки лучника
    archer: [
        {
            id: 'skill_archer_precision',
            name: 'Точность',
            description: 'Увеличивает шанс попадания на 15%',
            type: 'passive',
            heroClasses: ['archer'],
            levelRequirement: 6,
            effects: { special: { type: 'accuracy', bonus: 0.15 } },
            icon: '🎯'
        },
        {
            id: 'skill_archer_critical',
            name: 'Меткий глаз',
            description: 'Увеличивает шанс критического удара на 10%',
            type: 'passive',
            heroClasses: ['archer'],
            levelRequirement: 9,
            effects: { critChance: 0.1 },
            icon: '⭐'
        }
    ],
    
    // Навыки мага
    mage: [
        {
            id: 'skill_mage_intelligence',
            name: 'Интеллект',
            description: 'Увеличивает урон магии на 15%',
            type: 'passive',
            heroClasses: ['mage'],
            levelRequirement: 6,
            effects: { attack: 8 },
            icon: '🔮'
        },
        {
            id: 'skill_mage_frost',
            name: 'Ледяная стрела',
            description: 'Замедляет врагов при попадании на 30%',
            type: 'passive',
            heroClasses: ['mage'],
            levelRequirement: 12,
            effects: { special: { type: 'slow', percent: 0.3 } },
            icon: '❄️'
        }
    ],
    
    // Навыки разбойника
    rogue: [
        {
            id: 'skill_rogue_poison',
            name: 'Отравленные клинки',
            description: 'Отравляет врагов, нанося 5 урона в секунду в течение 3 секунд',
            type: 'passive',
            heroClasses: ['rogue'],
            levelRequirement: 6,
            effects: { special: { type: 'poison', damage: 5, duration: 3 } },
            icon: '☠️'
        }
    ]
};

window.SkillConfig = SkillConfig;