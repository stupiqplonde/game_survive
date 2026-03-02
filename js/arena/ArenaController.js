class ArenaController {
    constructor() {
        // Создаём менеджер спрайтов
        if (!window.spriteManager) {
            window.spriteManager = new SpriteManager();
        }
        this.arena = null;
        this.initEventListeners();
    }
    
    initEventListeners() {
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const exitBtn = document.getElementById('exitArenaBtn');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.arena) {
                    this.arena.togglePause();
                }
            });
        }
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                if (this.arena) {
                    this.arena.togglePause();
                }
            });
        }
        
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                if (this.arena) {
                    this.arena.exitArena();
                }
            });
        }
    }
    
    startExpedition(location, hero) {
        if (!hero) {
            alert('Сначала выберите героя в меню "Герои"!');
            return false;
        }
        
        console.log('Starting expedition with hero:', hero);
        
        // Сохраняем текущее состояние героя
        hero.currentStats.hp = hero.baseStats.hp;
        
        // Создаём арену
        this.arena = new SurvivorsArena('gameCanvas');
        this.arena.init(hero);
        
        // Переключаем экран
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screenArena').classList.add('active');
        
        // Скрываем навигацию
        document.querySelector('.game-nav').style.display = 'none';
        
        // Принудительно скрываем основной хедер
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.style.display = 'none';
            gameHeader.style.visibility = 'hidden';
        }
        
        // Даем время на перерисовку DOM
        setTimeout(() => {
            // Запускаем арену
            this.arena.start();
        }, 100);
        
        return true;
    }
}

window.ArenaController = ArenaController;