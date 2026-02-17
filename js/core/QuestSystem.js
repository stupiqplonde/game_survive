class QuestSystem {
    constructor(achievementsSystem) {
        this.achievements = achievementsSystem;
        this.dailyQuests = [];
        this.completedQuests = [];
        this.lastReset = new Date().toDateString();
        this.generateDailyQuests();
        
        this._listeners = [];
        this.load();
    }
    
    subscribe(listener) {
        this._listeners.push(listener);
    }
    
    notify() {
        this._listeners.forEach(listener => listener(this));
        this.save();
    }
    
    generateDailyQuests() {
        const today = new Date().toDateString();
        if (this.lastReset !== today) {
            this.dailyQuests = [];
            this.completedQuests = [];
            this.lastReset = today;
            
            // Генерируем 3 ежедневных задания
            const possibleQuests = [
                {
                    id: 'daily_forest',
                    name: 'Лесной охотник',
                    description: 'Проведи 3 матча в лесу',
                    condition: (stats) => stats.forestMatches >= 3,
                    progress: 0,
                    target: 3,
                    reward: { resources: { proviziya: 10 } }
                },
                {
                    id: 'daily_fuel',
                    name: 'Топливный кризис',
                    description: 'Потрать 5 топлива',
                    condition: (stats) => stats.fuelSpent >= 5,
                    progress: 0,
                    target: 5,
                    reward: { materials: { metal: 15 } }
                },
                {
                    id: 'daily_combat',
                    name: 'Боевой дух',
                    description: 'Проведи 5 матчей',
                    condition: (stats) => stats.matchesPlayed >= 5,
                    progress: 0,
                    target: 5,
                    reward: { resources: { instrumenty: 8 } }
                },
                {
                    id: 'daily_craft',
                    name: 'Ремесленник',
                    description: 'Создай 2 предмета',
                    condition: (stats) => stats.itemsCrafted >= 2,
                    progress: 0,
                    target: 2,
                    reward: { materials: { wood: 20, cloth: 10 } }
                },
                {
                    id: 'daily_collect',
                    name: 'Коллекционер ресурсов',
                    description: 'Собери 50 ресурсов',
                    condition: (stats) => stats.resourcesCollected >= 50,
                    progress: 0,
                    target: 50,
                    reward: { resources: { toplivo: 5, proviziya: 5 } }
                }
            ];
            
            // Выбираем 3 случайных задания
            const shuffled = possibleQuests.sort(() => 0.5 - Math.random());
            this.dailyQuests = shuffled.slice(0, 3).map(quest => ({
                ...quest,
                id: quest.id + '_' + Date.now(),
                progress: 0
            }));
        }
    }
    
    trackEvent(eventType, data) {
        this.generateDailyQuests(); // Проверяем, не пора ли обновить задания
        
        let updated = false;
        
        this.dailyQuests.forEach(quest => {
            if (this.completedQuests.includes(quest.id)) return;
            
            switch (quest.id.split('_')[0]) {
                case 'daily':
                    if (eventType === 'match_played') {
                        if (data.location === 'forest' && quest.id.includes('forest')) {
                            quest.progress++;
                        }
                        if (quest.id.includes('combat')) {
                            quest.progress++;
                        }
                    }
                    if (eventType === 'fuel_spent' && quest.id.includes('fuel')) {
                        quest.progress += data.amount || 1;
                    }
                    if (eventType === 'item_crafted' && quest.id.includes('craft')) {
                        quest.progress++;
                    }
                    if (eventType === 'resource_collected' && quest.id.includes('collect')) {
                        quest.progress += data.amount || 1;
                    }
                    break;
            }
            
            // Проверяем выполнение
            if (quest.progress >= quest.target) {
                this.completeQuest(quest.id);
                updated = true;
            }
        });
        
        if (updated) {
            this.notify();
        }
    }
    
    completeQuest(questId) {
        if (!this.completedQuests.includes(questId)) {
            this.completedQuests.push(questId);
            const quest = this.dailyQuests.find(q => q.id === questId);
            if (quest && quest.reward) {
                this.giveReward(quest.reward);
                this.showNotification(quest);
            }
        }
    }
    
    giveReward(reward) {
        if (reward.resources) {
            Object.entries(reward.resources).forEach(([type, amount]) => {
                window.GameState.updateResource(type, amount);
            });
        }
        
        if (reward.materials) {
            Object.entries(reward.materials).forEach(([type, amount]) => {
                window.GameState.updateMaterial(type, amount);
            });
        }
    }
    
    showNotification(quest) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        notification.innerHTML = `
            <div class="quest-icon">📋</div>
            <div class="quest-info">
                <div class="quest-name">✅ Задание выполнено: ${quest.name}</div>
                <div class="quest-reward">Получена награда!</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    save() {
        localStorage.setItem('quests', JSON.stringify({
            dailyQuests: this.dailyQuests,
            completedQuests: this.completedQuests,
            lastReset: this.lastReset
        }));
    }
    
    load() {
        const saved = localStorage.getItem('quests');
        if (saved) {
            const data = JSON.parse(saved);
            this.dailyQuests = data.dailyQuests || [];
            this.completedQuests = data.completedQuests || [];
            this.lastReset = data.lastReset || new Date().toDateString();
            this.generateDailyQuests(); // Проверяем актуальность
        }
    }
    
    renderQuests() {
        return `
            <div class="quests-panel">
                <h3>📋 Ежедневные задания</h3>
                ${this.dailyQuests.map(quest => `
                    <div class="quest-item ${this.completedQuests.includes(quest.id) ? 'completed' : ''}">
                        <div class="quest-name">${quest.name}</div>
                        <div class="quest-desc">${quest.description}</div>
                        <div class="quest-progress">
                            <div class="progress-bar" style="width: ${(quest.progress / quest.target) * 100}%"></div>
                            <span>${quest.progress}/${quest.target}</span>
                        </div>
                        ${this.completedQuests.includes(quest.id) ? 
                            '<div class="quest-completed">✅ Выполнено</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.QuestSystem = QuestSystem;