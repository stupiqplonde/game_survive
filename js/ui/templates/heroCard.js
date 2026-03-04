// js/ui/templates/heroCard.js
// Шаблон карточки героя

const HeroCardTemplate = {
    /**
     * Создает HTML карточки героя
     * @param {Object} hero - объект героя
     * @param {boolean} isSelected - выбран ли герой
     * @param {string} avatarUrl - URL аватара
     * @returns {string} HTML
     */
    render(hero, isSelected, avatarUrl) {
        const learnedSkillsHtml = hero.learnedSkills.map(skillId => {
            const skill = window.GameState.skillManager?.skills.find(s => s.id === skillId);
            return skill ? `<span title="${skill.name}" style="font-size: 1.5rem;">${skill.icon}</span>` : '';
        }).join('');

        return `
            <div class="hero-avatar" style="position: relative;">
                <img src="${avatarUrl}" 
                     alt="${hero.name}" 
                     style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #e94560; background: #16213e; object-fit: cover;"
                     onerror="this.onerror=null; this.src='images/default_hero.png';">
            </div>
            <h3>${hero.name} (Ур. ${hero.level})</h3>
            <div class="hero-stats">
                <p>❤️ HP: ${hero.currentStats.hp}</p>
                <p>⚔️ Атака: ${hero.currentStats.attack}</p>
                <p>🛡️ Защита: ${hero.currentStats.defense}</p>
            </div>
            <div class="hero-exp">
                <progress value="${hero.exp}" max="${hero.expToNextLevel}"></progress>
                <p>${hero.exp}/${hero.expToNextLevel} опыта</p>
            </div>
            <div class="hero-skills">
                <p>🎯 Уровень: ${hero.level}</p>
                <div class="learned-skills" style="display: flex; gap: 5px; margin-top: 5px; justify-content: center;">
                    ${learnedSkillsHtml}
                </div>
            </div>
            <button class="select-hero-btn" data-hero-id="${hero.id}">Выбрать для боя</button>
            <button class="inventory-hero-btn" data-hero-id="${hero.id}">Инвентарь</button>
        `;
    }
};

window.HeroCardTemplate = HeroCardTemplate;