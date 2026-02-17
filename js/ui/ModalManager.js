class ModalManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }
    
    showHeroDetails(hero) {
        const content = `
            <h2>${hero.name}</h2>
            <p>Уровень: ${hero.level}</p>
            <p>Опыт: ${hero.exp}/${hero.level * 100}</p>
            <h3>Характеристики:</h3>
            <ul>
                <li>❤️ Здоровье: ${hero.stats.hp}</li>
                <li>⚔️ Атака: ${hero.stats.attack}</li>
                <li>🛡️ Защита: ${hero.stats.defense}</li>
            </ul>
            <h3>Навыки:</h3>
            <ul>
                ${hero.selectedSkills.map(skill => `<li>${skill}</li>`).join('') || '<li>Нет навыков</li>'}
            </ul>
            <button class="close-modal-btn">Закрыть</button>
        `;
        
        this.uiManager.showModal(content);
        
        document.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.getElementById('heroModal').style.display = 'none';
        });
    }
    
    showItemDetails(item) {
        const content = `
            <h2>${item.name}</h2>
            <p>Тип: ${this.getItemTypeName(item.type)}</p>
            <p>Редкость: ${item.rarity}</p>
            <h3>Бонусы:</h3>
            <ul>
                ${Object.entries(item.statsBonus).map(([stat, value]) => 
                    `<li>${this.getStatName(stat)}: +${value}</li>`
                ).join('')}
            </ul>
            <button class="close-modal-btn">Закрыть</button>
        `;
        
        this.uiManager.showModal(content);
        
        document.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.getElementById('heroModal').style.display = 'none';
        });
    }
    
    getItemTypeName(type) {
        const types = {
            'weapon_melee': 'Ближнее оружие',
            'weapon_ranged': 'Дальнее оружие',
            'armor': 'Броня',
            'consumable': 'Расходник'
        };
        return types[type] || type;
    }
    
    getStatName(stat) {
        const names = {
            'hp': 'Здоровье',
            'attack': 'Атака',
            'defense': 'Защита'
        };
        return names[stat] || stat;
    }
}

window.ModalManager = ModalManager;