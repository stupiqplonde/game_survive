// js/config/locations.js
// Конфигурация локаций

const LocationConfig = {
    forest: {
        name: 'Лес',
        description: 'Таинственный лес, полный гоблинов',
        costType: 'proviziya',
        costAmount: 1,
        enemyTypes: ['goblin', 'skeleton'],
        difficulty: 1,
        backgroundColor: '#1a4a1a',
        decorations: ['tree', 'bush', 'rock']
    },
    
    desert: {
        name: 'Пустыня',
        description: 'Жаркая пустыня, обиталище скелетов',
        costType: 'toplivo',
        costAmount: 1,
        enemyTypes: ['skeleton', 'ghost'],
        difficulty: 1.2,
        backgroundColor: '#8B7355',
        decorations: ['cactus', 'rock', 'sand']
    },
    
    factory: {
        name: 'Завод',
        description: 'Заброшенный завод, полный опасностей',
        costType: 'instrumenty',
        costAmount: 1,
        enemyTypes: ['ghost', 'orc'],
        difficulty: 1.5,
        backgroundColor: '#4a4a4a',
        decorations: ['machine', 'barrel', 'pipe']
    },
    
    dungeon: {
        name: 'Подземелье',
        description: 'Темное подземелье, где обитают боссы',
        costType: 'instrumenty',
        costAmount: 3,
        enemyTypes: ['orc', 'boss'],
        difficulty: 2.0,
        backgroundColor: '#2a2a2a',
        decorations: ['torch', 'skull', 'chest'],
        isLocked: true,
        unlockRequirement: { level: 10 }
    }
};

window.LocationConfig = LocationConfig;