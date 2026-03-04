class Skill {
    constructor(id, name, description, type, heroClasses, levelRequirement, effects, icon = '✨') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.heroClasses = heroClasses;
        this.levelRequirement = levelRequirement;
        this.effects = effects;
        this.icon = icon;
        this.isUnlocked = false;
    }
    
    // Применить эффекты навыка к герою
    apply(hero) {
        if (this.effects.attack) hero.baseStats.attack += this.effects.attack;
        if (this.effects.defense) hero.baseStats.defense += this.effects.defense;
        if (this.effects.hp) {
            hero.baseStats.hp += this.effects.hp;
            hero.maxHp += this.effects.hp;
            hero.currentStats.hp += this.effects.hp;
        }
        if (this.effects.speed) hero.baseStats.speed += this.effects.speed;
        if (this.effects.critChance) hero.critChance = (hero.critChance || 0) + this.effects.critChance;
        if (this.effects.critDamage) hero.critDamage = (hero.critDamage || 1.5) + this.effects.critDamage;
        if (this.effects.lifesteal) hero.lifesteal = (hero.lifesteal || 0) + this.effects.lifesteal;
        if (this.effects.special) {
            hero.specialEffects = hero.specialEffects || [];
            hero.specialEffects.push(this.effects.special);
        }
        
        hero.updateCurrentStats();
    }
}

// Менеджер навыков
class SkillManager {
    constructor() {
        this.skills = [];
        this.initSkills();
    }
    
    initSkills() {
        const config = window.SkillConfig;
        
        // Загружаем все навыки из конфигурации
        Object.values(config).forEach(category => {
            category.forEach(skillData => {
                this.skills.push(new Skill(
                    skillData.id,
                    skillData.name,
                    skillData.description,
                    skillData.type,
                    skillData.heroClasses,
                    skillData.levelRequirement,
                    skillData.effects,
                    skillData.icon
                ));
            });
        });
        
        console.log('Навыки инициализированы:', this.skills.length);
    }
    
    // Получить доступные навыки для героя
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
        
        if (available.length === 0) {
            hero.pendingSkillLevel = 0;
            return [];
        }
        
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(3, shuffled.length));
    }
    
    // Изучить навык
    learnSkill(hero, skillId) {
        const skill = this.skills.find(s => s.id === skillId);
        if (!skill) return false;
        
        if (!hero.learnedSkills) hero.learnedSkills = [];
        if (hero.learnedSkills.includes(skillId)) return false;
        
        hero.learnedSkills.push(skillId);
        skill.apply(hero);
        
        return true;
    }
}

window.Skill = Skill;
window.SkillManager = SkillManager;