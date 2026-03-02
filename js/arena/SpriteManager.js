class SpriteManager {
    constructor() {
        // Здесь будут храниться загруженные спрайты
        // Map - это как объект, но лучше для хранения изображений
        this.sprites = new Map();
        
        // Флаг, что все спрайты загружены
        this.loaded = false;
        
        // Пути к картинкам - ВАЖНО: названия должны совпадать с файлами в папке images
        this.spritePaths = {
            // Герои
            warrior: 'images/heroes/warrior.png',
            archer: 'images/heroes/archer.png',
            mage: 'images/heroes/elementalist.png',    // Обратите внимание: elementalist.png
            rogue: 'images/heroes/assasin.png',        // Обратите внимание: assasin.png
            
            // Враги с вариациями (для разнообразия)
            goblin: 'images/enemies/peasant.png',      // Основной гоблин
            goblin_1: 'images/enemies/peasant.png',    // Вариант 1
            goblin_2: 'images/enemies/peasant.png',    // Вариант 2
            skeleton: 'images/enemies/ronin.png',
            skeleton_1: 'images/enemies/ronin.png',
            ghost: 'images/enemies/bandit.png',
            orc: 'images/enemies/raider.png',
            
            // Предметы
            expGem: 'images/items/gem_yellow.png',
            potion: 'images/items/potion_red.png',
            
        };
    }

    // Асинхронная загрузка всех спрайтов
    async loadSprites() {
        console.log('🎨 Загрузка спрайтов из локальной папки /images...');
        
        // Создаём массив промисов (обещаний) для загрузки каждой картинки
        const loadPromises = [];

        // Перебираем все пути из spritePaths
        for (const [key, path] of Object.entries(this.spritePaths)) {
            // Для каждого ключа (например 'warrior') загружаем картинку
            // .catch - если ошибка, просто пишем предупреждение, но не останавливаем загрузку
            loadPromises.push(this.loadImage(key, path).catch(err => {
                console.warn(`⚠️ Не удалось загрузить ${key} из ${path}, создаю fallback`);
            }));
        }

        // Ждём, пока ВСЕ картинки загрузятся (или упадут с ошибкой)
        await Promise.allSettled(loadPromises);
        
        this.loaded = true;
        console.log(`✅ Загружено спрайтов: ${this.sprites.size}`);
    }

    // Загрузка одной картинки
    loadImage(key, path) {
        return new Promise((resolve, reject) => {
            // Создаём HTML-элемент Image
            const img = new Image();
            
            // Когда картинка загрузится
            img.onload = () => {
                // Создаём canvas, чтобы обработать изображение
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                
                // Включаем сглаживание, чтобы картинка была чёткой
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Вырезаем квадрат по центру изображения (чтобы не было искажений)
                const size = Math.min(img.width, img.height);
                const sourceX = (img.width - size) / 2;
                const sourceY = (img.height - size) / 2;
                
                // Рисуем изображение на canvas (с отступами 2 пикселя)
                ctx.drawImage(img, sourceX, sourceY, size, size, 2, 2, 60, 60);
                
                // Добавляем красивую обводку
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(32, 32, 30, 0, Math.PI * 2);
                ctx.stroke();
                
                // Сохраняем canvas в хранилище
                this.sprites.set(key, canvas);
                console.log(`✅ Загружен: ${key}`);
                resolve();
            };
            
            // Если ошибка загрузки
            img.onerror = (err) => {
                console.error(`❌ Ошибка загрузки ${key} из ${path}:`, err);
                reject(err);
            };
            
            // Добавляем timestamp, чтобы браузер не кэшировал картинки при разработке
            img.src = path + '?t=' + Date.now();
        });
    }

    // Получить спрайт по ключу
    getSprite(key) {
        // Для врагов с вариациями - выбираем случайный вариант
        if (key === 'goblin' || key === 'skeleton') {
            // Создаём массив возможных вариантов: [goblin, goblin_1, goblin_2]
            const variants = [`${key}`, `${key}_1`, `${key}_2`].filter(v => this.sprites.has(v));
            
            // Если есть хоть один вариант, возвращаем случайный
            if (variants.length > 0) {
                return this.sprites.get(variants[Math.floor(Math.random() * variants.length)]);
            }
        }
        
        // Если спрайт не найден, возвращаем заглушку
        return this.sprites.get(key) || this.sprites.get('default_hero') || this.createFallbackOnDemand(key);
    }

    // Создать заглушку на лету (если картинка не загрузилась)
    createFallbackOnDemand(key) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Красный круг
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Вопросительный знак
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('?', 32, 36);
        
        return canvas;
    }

    // Для аватарок в HTML-тегах <img> (в меню героев)
    getAvatarUrl(type, seed = null) {
        // Возвращаем путь к PNG
        const path = this.spritePaths[type] || this.spritePaths.default_hero || 'images/default_hero.png';
        return path + '?t=' + Date.now();
    }
}

// Делаем класс доступным глобально
window.SpriteManager = SpriteManager;