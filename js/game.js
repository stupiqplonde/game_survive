// Функция для создания тестовых героев
function createTestHeroes() {
    return [
        new Hero('hero1', 'Торгар', { hp: 120, attack: 18, defense: 12 }, 'warrior'),
        new Hero('hero2', 'Эльвира', { hp: 80, attack: 22, defense: 6, speed: 15 }, 'archer'),
        new Hero('hero3', 'Мерлин', { hp: 70, attack: 25, defense: 4 }, 'mage'),
        new Hero('hero4', 'Шэдоу', { hp: 85, attack: 20, defense: 5, speed: 18 }, 'rogue')
    ];
}

// Создаем тестовые предметы
function createTestItems() {
    return [
        {
            id: 'item1',
            name: 'Малое зелье здоровья',
            type: 'consumable',
            rarity: 'common',
            price: 10,
            statsBonus: {},
            effect: { type: 'heal', value: 30 },
            icon: '🧪'
        },
        {
            id: 'item2',
            name: 'Стальной меч',
            type: 'weapon',
            rarity: 'rare',
            price: 50,
            statsBonus: { attack: 8 },
            effect: null,
            icon: '⚔️'
        },
        {
            id: 'item3',
            name: 'Кожаная броня',
            type: 'armor',
            rarity: 'common',
            price: 30,
            statsBonus: { defense: 5 },
            effect: null,
            icon: '🛡️'
        },
        {
            id: 'item4',
            name: 'Кольцо силы',
            type: 'accessory',
            rarity: 'rare',
            price: 40,
            statsBonus: { attack: 3, defense: 2 },
            effect: null,
            icon: '📿'
        },
        {
            id: 'item5',
            name: 'Большое зелье здоровья',
            type: 'consumable',
            rarity: 'rare',
            price: 25,
            statsBonus: {},
            effect: { type: 'heal', value: 75 },
            icon: '🧪'
        },
        {
            id: 'item6',
            name: 'Том опыта',
            type: 'consumable',
            rarity: 'epic',
            price: 100,
            statsBonus: {},
            effect: { type: 'exp', value: 50 },
            icon: '📚'
        },
        {
           id: 'item7',
            name: 'Щит',
            type: 'Shield',
            rarity: 'common',
            price: 80,
            statsBonus: {},
            effect: { defense: 10 },
            icon: '🛡️' 
        }
    ];
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация игры...');
    
    // Проверяем, есть ли сохраненные герои
    if (!window.GameState.heroes || window.GameState.heroes.length === 0) {
        console.log('Создаем тестовых героев');
        window.GameState.heroes = createTestHeroes();
        
        // Добавляем предметы первому герою для теста
        const testItems = createTestItems();
        if (window.GameState.heroes[0]) {
            window.GameState.heroes[0].addToInventory(testItems[0]);
            window.GameState.heroes[0].addToInventory(testItems[1]);
            window.GameState.heroes[0].addToInventory(testItems[2]);
        }
        
        // Добавляем предметы второму герою
        if (window.GameState.heroes[1]) {
            window.GameState.heroes[1].addToInventory(testItems[3]);
            window.GameState.heroes[1].addToInventory(testItems[4]);
        }
        
        // Выбираем первого героя по умолчанию
        window.GameState.selectHero('hero1');
    } else {
        console.log('Загружены сохраненные герои:', window.GameState.heroes.length);
    }
    
    // Инициализация UI
    window.uiManager = new UIManager();
    
    // Устанавливаем активный экран по умолчанию
    const lobbyScreen = document.getElementById('screenLobby');
    if (lobbyScreen) {
        lobbyScreen.classList.add('active');
    }
    
    // Загрузка сохранения
    window.GameState.load();
    
    // Обновляем обработчики кнопок локаций
    document.querySelectorAll('.start-match-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const costType = e.target.dataset.costType;
            const locationCard = e.target.closest('.location-card');
            const location = locationCard ? locationCard.dataset.location : 'unknown';
            
            const currentHero = window.GameState.getCurrentHero();
            if (!currentHero) {
                alert('Сначала выберите героя!');
                return;
            }
            
            if (window.GameState.resources[costType] >= 1) {
                window.GameState.updateResource(costType, -1);
                
                // Добавляем опыт герою за матч
                if (currentHero.addExp) {
                    currentHero.addExp(100);
                }
                
                alert(`Матч начат в локации ${location}! 
Герой ${currentHero.name || 'Неизвестный'} получил 10 опыта.
Потрачен 1 ${costType}. 
Ресурсов осталось: ${Math.floor(window.GameState.resources[costType] || 0)}`);
            } else {
                alert(`Недостаточно ${costType}!`);
            }
        });
    });
    
    // Добавляем информацию о пассивной генерации
    const lobbyElement = document.querySelector('#screenLobby');
    if (lobbyElement) {
        const passiveInfo = document.createElement('div');
        passiveInfo.className = 'passive-info';
        passiveInfo.innerHTML = `
            <p>⏱️ Ресурсы накапливаются автоматически (1/сек)</p>
        `;
        lobbyElement.appendChild(passiveInfo);
    }
    
    console.log('Игра запущена! Герои и инвентарь готовы!');
});

// Сохранение перед закрытием
window.addEventListener('beforeunload', () => {
    if (window.GameState) {
        window.GameState.save();
    }
});