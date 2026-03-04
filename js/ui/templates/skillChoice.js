// js/ui/templates/skillChoice.js
// Шаблон окна выбора навыка

const SkillChoiceTemplate = {
    /**
     * Создает HTML для выбора навыка
     * @param {string} heroName - имя героя
     * @param {number} level - уровень
     * @param {Array} skills - доступные навыки
     * @returns {string} HTML
     */
    render(heroName, level, skills) {
        const skillsHtml = skills.map(skill => {
            const effectsHtml = Object.entries(skill.effects).map(([key, value]) => {
                if (key === 'special') {
                    if (value.type === 'block') return `🛡️ Блок: ${Math.round(value.chance * 100)}%`;
                    if (value.type === 'doubleStrike') return `⚡ Двойной удар: ${Math.round(value.chance * 100)}%`;
                    if (value.type === 'accuracy') return `🎯 Точность: +${Math.round(value.bonus * 100)}%`;
                    if (value.type === 'armorPierce') return `🏹 Игнор брони: ${Math.round(value.percent * 100)}%`;
                    if (value.type === 'attackSpeed') return `⚡ Скорость атаки: +${Math.round(value.bonus * 100)}%`;
                    if (value.type === 'poison') return `☠️ Яд: ${value.damage} урона/${value.duration}с`;
                    if (value.type === 'slow') return `❄️ Замедление: ${Math.round(value.percent * 100)}%`;
                    return '';
                }
                if (key === 'attack') return `⚔️ Атака +${value}`;
                if (key === 'defense') return `🛡️ Защита +${value}`;
                if (key === 'hp') return `❤️ Здоровье +${value}`;
                if (key === 'speed') return `👟 Скорость +${value}`;
                if (key === 'critChance') return `⭐ Крит. шанс +${Math.round(value * 100)}%`;
                if (key === 'critDamage') return `💥 Крит. урон +${Math.round((value - 1.5) * 100)}%`;
                if (key === 'lifesteal') return `💉 Вампиризм +${Math.round(value * 100)}%`;
                return '';
            }).filter(Boolean).join('<br>');

            return `
                <div class="skill-choice-card" data-skill-id="${skill.id}" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #0f3460; transition: all 0.3s;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">${skill.icon}</div>
                    <h3 style="color: #e94560; margin: 10px 0; font-size: 1.1rem;">${skill.name}</h3>
                    <p style="font-size: 0.9rem; margin-bottom: 10px; color: #aaa;">${skill.description}</p>
                    <div style="background: #0f0f1f; padding: 8px; border-radius: 5px; font-size: 0.8rem; color: #4aff4a;">
                        ${effectsHtml}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <h2 style="color: #e94560; text-align: center; margin-bottom: 20px;">Выберите навык для ${heroName} (Уровень ${level})</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                ${skillsHtml}
            </div>
            <p style="text-align: center; margin-top: 20px; color: #888; font-size: 0.9rem;">Нажмите на навык, чтобы изучить его</p>
        `;
    }
};

window.SkillChoiceTemplate = SkillChoiceTemplate;