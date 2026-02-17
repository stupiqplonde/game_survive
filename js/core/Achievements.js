class AchievementsSystem {
    constructor() {
        this.achievements = [
            {
                id: 'first_match',
                name: 'Первый шаг',
                description: 'Проведи свой первый матч',
                condition: (stats) => stats.matchesPlayed >= 1,
                reward: { resources: { proviziya: 5 } }
            },
            {
                id: 'resource_hoarder',
                name: 'Накопитель',
                description: 'Накопи 100 единиц любых ресурсов',
                condition: (stats) => {
                    const total = stats.totalResourcesCollected;
                    return total >= 100;
                },
                reward: { materials: { wood: 10, metal: 5 } }
            },
            {
                id: 'veteran',
                name: 'Ветеран',
                description: 'Проведи 10 матчей',
                condition: (stats) => stats.matchesPlayed >= 10,
                reward: { resources: { toplivo: 10, instrumenty: 10 } }
            },
            {
                id: 'collector',
                name: 'Коллекционер',
                description: 'Собери 5 разных предметов',
                condition: (stats) => stats.itemsCollected >= 5,
                reward: { materials: { metal: 15, cloth: 10 } }
            },
            {
                id: 'crafter',
                name: 'Мастер крафта',
                description: 'Создай свой первый предмет',
                condition: (stats) => stats.itemsCrafted >= 1,
                reward: { resources: { instrumenty: 5 } }
            },
            {
                id: 'explorer',
                name: 'Исследователь',
                description: 'Посети все локации',
                condition: (stats) => stats.visitedLocations.length >= 3,
                reward: { resources: { proviziya: 10, toplivo: 10 } }
            }
        ];
        
        this.completedAchievements = [];
        this.stats = {
            matchesPlayed: 0,
            totalResourcesCollected: 0,
            itemsCollected: 0,
            itemsCrafted: 0,
            visitedLocations: []
        };
        
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
    
    // Отслеживание событий
    trackMatchPlayed(location) {
        this.stats.matchesPlayed++;
        if (!this.stats.visitedLocations.includes(location)) {
            this.stats.visitedLocations.push(location);
        }
        this.checkAchievements();
    }
    
    trackResourceCollected(amount) {
        this.stats.totalResourcesCollected += amount;
        this.checkAchievements();
    }
    
    trackItemCollected() {
        this.stats.itemsCollected++;
        this.checkAchievements();
    }
    
    trackItemCrafted() {
        this.stats.itemsCrafted++;
        this.checkAchievements();
    }
    
    checkAchievements() {
        let newAchievements = false;
        
        this.achievements.forEach(achievement => {
            if (!this.completedAchievements.includes(achievement.id)) {
                if (achievement.condition(this.stats)) {
                    this.completedAchievements.push(achievement.id);
                    this.giveReward(achievement.reward);
                    this.showNotification(achievement);
                    newAchievements = true;
                }
            }
        });
        
        if (newAchievements) {
            this.notify();
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
    
    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
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
        localStorage.setItem('achievements', JSON.stringify({
            completedAchievements: this.completedAchievements,
            stats: this.stats
        }));
    }
    
    load() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const data = JSON.parse(saved);
            this.completedAchievements = data.completedAchievements || [];
            this.stats = data.stats || this.stats;
        }
    }
    
    getProgress() {
        return {
            total: this.achievements.length,
            completed: this.completedAchievements.length
        };
    }
}

window.AchievementsSystem = AchievementsSystem;