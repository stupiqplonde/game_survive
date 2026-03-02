// Класс навыков для героев
class Skill {
    constructor(id, name, description, type, heroClasses, levelRequirement, effects, icon = '✨') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type; // 'passive', 'active', 'ultimate'
        this.heroClasses = heroClasses; // Массив классов, которые могут взять навык ['warrior', 'archer']
        this.levelRequirement = levelRequirement; // Уровень, на котором доступен
        this.effects = effects; // Объект с эффектами
        this.icon = icon;
        this.isUnlocked = false;
    }
    
    // Применить эффекты навыка к герою
    apply(hero) {
        console.log(`Применяем навык ${this.name} к герою ${hero.name}`);
        
        if (this.effects.attack) {
            hero.baseStats.attack += this.effects.attack;
            console.log(`+${this.effects.attack} к атаке`);
        }
        if (this.effects.defense) {
            hero.baseStats.defense += this.effects.defense;
            console.log(`+${this.effects.defense} к защите`);
        }
        if (this.effects.hp) {
            hero.baseStats.hp += this.effects.hp;
            hero.maxHp += this.effects.hp;
            hero.currentStats.hp += this.effects.hp;
            console.log(`+${this.effects.hp} к здоровью`);
        }
        if (this.effects.speed) {
            hero.baseStats.speed += this.effects.speed;
            console.log(`+${this.effects.speed} к скорости`);
        }
        if (this.effects.critChance) {
            hero.critChance = (hero.critChance || 0) + this.effects.critChance;
            console.log(`+${Math.round(this.effects.critChance * 100)}% к крит. шансу`);
        }
        if (this.effects.critDamage) {
            hero.critDamage = (hero.critDamage || 1.5) + this.effects.critDamage;
            console.log(`+${Math.round(this.effects.critDamage * 100)}% к крит. урону`);
        }
        if (this.effects.lifesteal) {
            hero.lifesteal = (hero.lifesteal || 0) + this.effects.lifesteal;
            console.log(`+${Math.round(this.effects.lifesteal * 100)}% к вампиризму`);
        }
        if (this.effects.special) {
            // Специальные эффекты (например, двойной удар, отравление и т.д.)
            hero.specialEffects = hero.specialEffects || [];
            hero.specialEffects.push(this.effects.special);
            console.log(`Добавлен специальный эффект: ${this.effects.special.type}`);
        }
        
        hero.updateCurrentStats();
        console.log('Новые статы:', hero.currentStats);
    }
}

// Менеджер навыков
class SkillManager {
    constructor() {
        this.skills = [];
        this.initSkills();
    }
    
    initSkills() {
        // Универсальные навыки (доступны всем)
        this.skills.push(
            new Skill(
                'skill_hp_1',
                'Крепкое здоровье',
                'Увеличивает максимальное здоровье на 20',
                'passive',
                ['warrior', 'archer', 'mage', 'rogue'],
                3,
                { hp: 20 },
                '❤️'
            ),
            new Skill(
                'skill_hp_2',
                'Железное здоровье',
                'Увеличивает максимальное здоровье на 50',
                'passive',
                ['warrior', 'archer', 'mage', 'rogue'],
                9,
                { hp: 50 },
                '💪'
            ),
            new Skill(
                'skill_attack_1',
                'Острые клинки',
                'Увеличивает атаку на 5',
                'passive',
                ['warrior', 'archer', 'rogue'],
                3,
                { attack: 5 },
                '⚔️'
            ),
            new Skill(
                'skill_attack_2',
                'Мастерство оружия',
                'Увеличивает атаку на 12',
                'passive',
                ['warrior', 'archer', 'rogue'],
                9,
                { attack: 12 },
                '🗡️'
            ),
            new Skill(
                'skill_defense_1',
                'Крепкая броня',
                'Увеличивает защиту на 3',
                'passive',
                ['warrior', 'archer', 'mage'],
                3,
                { defense: 3 },
                '🛡️'
            ),
            new Skill(
                'skill_speed_1',
                'Быстрые ноги',
                'Увеличивает скорость на 5',
                'passive',
                ['warrior', 'archer', 'rogue'],
                3,
                { speed: 5 },
                '👟'
            )
        );
        
        // Навыки воина
        this.skills.push(
            new Skill(
                'skill_warrior_berserk',
                'Берсерк',
                'Увеличивает урон на 10%, но снижает защиту на 2',
                'passive',
                ['warrior'],
                6,
                { attack: 5, defense: -2 },
                '🔥'
            ),
            new Skill(
                'skill_warrior_shield',
                'Стена щитов',
                'Увеличивает защиту на 8, шанс заблокировать атаку 15%',
                'passive',
                ['warrior'],
                6,
                { defense: 8, special: { type: 'block', chance: 0.15 } },
                '🛡️'
            ),
            new Skill(
                'skill_warrior_dual',
                'Двойной удар',
                '10% шанс нанести двойной урон',
                'passive',
                ['warrior'],
                12,
                { special: { type: 'doubleStrike', chance: 0.1 } },
                '⚡'
            ),
            new Skill(
                'skill_warrior_charge',
                'Заряд',
                'Увеличивает скорость на 10 и урон на 8 при движении вперед',
                'passive',
                ['warrior'],
                15,
                { speed: 10, attack: 8 },
                '🏃'
            )
        );
        
        // Навыки лучника
        this.skills.push(
            new Skill(
                'skill_archer_precision',
                'Точность',
                'Увеличивает шанс попадания на 15%',
                'passive',
                ['archer'],
                6,
                { special: { type: 'accuracy', bonus: 0.15 } },
                '🎯'
            ),
            new Skill(
                'skill_archer_critical',
                'Меткий глаз',
                'Увеличивает шанс критического удара на 10%',
                'passive',
                ['archer'],
                9,
                { critChance: 0.1 },
                '⭐'
            ),
            new Skill(
                'skill_archer_piercing',
                'Пробивающая стрела',
                'Игнорирует 20% защиты врага',
                'passive',
                ['archer'],
                12,
                { special: { type: 'armorPierce', percent: 0.2 } },
                '🏹'
            ),
            new Skill(
                'skill_archer_rapid',
                'Быстрая стрельба',
                'Увеличивает скорость атаки на 25%',
                'passive',
                ['archer'],
                15,
                { special: { type: 'attackSpeed', bonus: 0.25 } },
                '⚡'
            )
        );
        
        // Навыки мага
        this.skills.push(
            new Skill(
                'skill_mage_intelligence',
                'Интеллект',
                'Увеличивает урон магии на 15%',
                'passive',
                ['mage'],
                6,
                { attack: 8 },
                '🔮'
            ),
            new Skill(
                'skill_mage_mana',
                'Магический резерв',
                'Увеличивает длительность магии на 1 секунду',
                'passive',
                ['mage'],
                9,
                { special: { type: 'magicDuration', bonus: 1.0 } },
                '💙'
            ),
            new Skill(
                'skill_mage_frost',
                'Ледяная стрела',
                'Замедляет врагов при попадании на 30%',
                'passive',
                ['mage'],
                12,
                { special: { type: 'slow', percent: 0.3 } },
                '❄️'
            ),
            new Skill(
                'skill_mage_chain',
                'Цепная молния',
                'Магия может поразить до 3 дополнительных врагов',
                'passive',
                ['mage'],
                15,
                { special: { type: 'chain', targets: 3 } },
                '⚡'
            )
        );
        
        // Навыки разбойника
        this.skills.push(
            new Skill(
                'skill_rogue_poison',
                'Отравленные клинки',
                'Отравляет врагов, нанося 5 урона в секунду в течение 3 секунд',
                'passive',
                ['rogue'],
                6,
                { special: { type: 'poison', damage: 5, duration: 3 } },
                '☠️'
            ),
            new Skill(
                'skill_rogue_stealth',
                'Незаметность',
                'Враги реже атакуют разбойника',
                'passive',
                ['rogue'],
                9,
                { special: { type: 'threat', reduction: 0.3 } },
                '👤'
            ),
            new Skill(
                'skill_rogue_backstab',
                'Удар в спину',
                'Атака со спины наносит на 50% больше урона',
                'passive',
                ['rogue'],
                12,
                { special: { type: 'backstab', bonus: 0.5 } },
                '🗡️'
            ),
            new Skill(
                'skill_rogue_trapmaster',
                'Мастер ловушек',
                'Ловушки действуют на 50% дольше и наносят на 50% больше урона',
                'passive',
                ['rogue'],
                15,
                { special: { type: 'trapMastery', damageBonus: 0.5, durationBonus: 0.5 } },
                '🔒'
            )
        );
        
        console.log('Навыки инициализированы:', this.skills.length);
    }
    
    // Получить доступные навыки для героя на определенном уровне
    getAvailableSkills(hero, level) {
        return this.skills.filter(skill => 
            skill.heroClasses.includes(hero.type) && 
            skill.levelRequirement <= level &&
            !hero.learnedSkills.includes(skill.id)
        );
    }
    
    // Получить 3 случайных навыка для выбора
    getRandomSkillsForHero(hero, level) {
        const available = this.getAvailableSkills(hero, level);
        console.log(`Доступно навыков для героя ${hero.name} на уровень ${level}:`, available.length);
        
        if (available.length === 0) {
            // Если нет доступных навыков, герой пропускает выбор
            hero.pendingSkillLevel = 0;
            return [];
        }
        
        // Перемешиваем и берем до 3 навыков
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(3, shuffled.length));
    }
    
    // Изучить навык
    learnSkill(hero, skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) {
            console.error('Навык не найден:', skillId);
            return false;
        }
        
        if (!hero.learnedSkills) {
            hero.learnedSkills = [];
        }
        
        if (hero.learnedSkills.includes(skillId)) {
            console.log('Навык уже изучен');
            return false;
        }
        
        hero.learnedSkills.push(skillId);
        skill.apply(hero);
        
        console.log(`Герой ${hero.name} изучил навык: ${skill.name}`);
        return true;
    }
}

window.Skill = Skill;
window.SkillManager = SkillManager;