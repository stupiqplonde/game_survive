// js/game.js - точка входа в игру

// Ждём, пока загрузится DOM, потом выполняем код
// async означает, что функция будет работать асинхронно
document.addEventListener('DOMContentLoaded', async () => {
    // Показываем шапку игры
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.style.display = 'flex';
        gameHeader.style.visibility = 'visible';
    }
    
    // Показываем индикатор загрузки
    showLoadingIndicator('Загрузка спрайтов из папки images...');
    
    try {
        // Создаём менеджер спрайтов и сохраняем его в глобальной переменной
        window.spriteManager = new SpriteManager();
        
        // Загружаем спрайты и ждём, пока они загрузятся (await)
        await window.spriteManager.loadSprites();
        
        // Инициализируем игру
        initializeGame();
        
        // Прячем индикатор загрузки
        hideLoadingIndicator();
        
        // Показываем уведомление об успехе
        showNotification('✅ Спрайты загружены!', 2000);
        
    } catch (error) {
        // Если произошла ошибка при загрузке спрайтов
        console.error('Ошибка загрузки:', error);
        hideLoadingIndicator();
        
        // Всё равно запускаем игру (будут использоваться заглушки)
        initializeGame();
        showNotification('⚠️ Используются заглушки вместо спрайтов', 3000);
    }
});

// Функция для показа индикатора загрузки
function showLoadingIndicator(text) {
    // Удаляем старый индикатор, если он есть
    const existing = document.getElementById('loadingIndicator');
    if (existing) existing.remove();
    
    // Создаём новый
    const loader = document.createElement('div');
    loader.id = 'loadingIndicator';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #16213e;
        color: #e94560;
        padding: 20px 40px;
        border-radius: 10px;
        z-index: 9999;
        border: 2px solid #e94560;
        font-size: 18px;
        box-shadow: 0 0 30px rgba(233,69,96,0.3);
    `;
    loader.textContent = text || 'Загрузка...';
    document.body.appendChild(loader);
}

// Функция для скрытия индикатора загрузки
function hideLoadingIndicator() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

// Функция для показа уведомлений
function showNotification(text, duration) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e94560;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: fadeInOut ${duration}ms;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    // Удаляем уведомление через указанное время
    setTimeout(() => notif.remove(), duration);
}

// Функция инициализации игры
function initializeGame() {
    console.log('🎮 Инициализация игры...');
    
    // СОЗДАЁМ ГЕРОЕВ
    const warrior = new window.Hero('1', 'Воин', { hp: 120, attack: 18, defense: 12, speed: 8 }, 'warrior');
    const archer = new window.Hero('2', 'Лучник', { hp: 80, attack: 22, defense: 6, speed: 15 }, 'archer');
    const mage = new window.Hero('3', 'Маг', { hp: 70, attack: 25, defense: 4, speed: 12 }, 'mage');
    const rogue = new window.Hero('4', 'Разбойник', { hp: 90, attack: 16, defense: 8, speed: 18 }, 'rogue');
    
    // Добавляем героев в общее состояние игры
    window.GameState.heroes.push(warrior, archer, mage, rogue);
    window.GameState.selectHero('1'); // Выбираем первого героя (Воина)
    
    
    // ИНИЦИАЛИЗИРУЕМ СИСТЕМЫ
    window.GameState.initShop();      // Магазин
    window.GameState.initRecipes();   // Крафт
    window.GameState.initSkills();    // Навыки
    
    // ЗАПУСКАЕМ UI
    window.ui = new window.UIManager();
    
    // СОЗДАЁМ КОНТРОЛЛЕР АРЕНЫ
    window.arenaController = new window.ArenaController();
    
    console.log('✅ Игра готова!');
}

// ОБРАБОТЧИКИ КНОПОК ЛОКАЦИЙ
document.querySelectorAll('.start-match-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Получаем данные о локации из атрибутов data-
        const location = e.target.closest('.location-card').dataset.location;
        const costType = e.target.dataset.costType;
        
        // Получаем текущего выбранного героя
        const hero = window.GameState.getCurrentHero();
        
        // Проверки
        if (!hero) {
            showNotification('❌ Сначала выберите героя!', 2000);
            return;
        }
        
        if (window.GameState.resources[costType] < 1) {
            showNotification(`❌ Не хватает ${costType}!`, 2000);
            return;
        }
        
        // Тратим ресурс
        window.GameState.updateResource(costType, -1);
        
        // Запускаем экспедицию
        const started = window.arenaController.startExpedition(location, hero);
        
        // Если не удалось запустить, возвращаем ресурс
        if (!started) {
            window.GameState.updateResource(costType, 1);
        }
    });
});

// Добавляем CSS-анимацию для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);