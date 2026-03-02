// Базовый класс для всех сущностей на арене
class ArenaEntity {
    constructor(worldX, worldY, radius, color = '#ffffff') {
        this.worldX = worldX;          // Координаты в мире
        this.worldY = worldY;
        this.radius = radius || 20;     // Радиус для коллизий
        this.vx = 0;                    // Скорость по X
        this.vy = 0;                    // Скорость по Y
        this.speed = 0;                  // Базовая скорость
        this.color = color;
        this.isActive = true;
        
        // Для анимации
        this.animationTimer = 0;
        this.animationFrame = 0;
        this.hitEffect = 0;              // Эффект получения урона (0-1)
        this.bobOffset = 0;               // Смещение для подпрыгивания
        this.bobSpeed = 8;                 // Скорость подпрыгивания
        
        // Спрайт менеджер
        this.spriteManager = window.spriteManager;
    }
    
    // Получить X на экране с учётом камеры
    getScreenX(cameraX) {
        return this.worldX - cameraX;
    }
    
    // Получить Y на экране с учётом камеры
    getScreenY(cameraY) {
        return this.worldY - cameraY;
    }
    
    // Обновление позиции и анимации
    update(deltaTime, worldWidth, worldHeight) {
        // Двигаем сущность
        this.worldX += this.vx * this.speed * deltaTime * 60;
        this.worldY += this.vy * this.speed * deltaTime * 60;
        
        // Не даём выйти за границы мира
        this.worldX = Math.max(this.radius, Math.min(worldWidth - this.radius, this.worldX));
        this.worldY = Math.max(this.radius, Math.min(worldHeight - this.radius, this.worldY));
        
        // Анимация подпрыгивания при движении
        if (this.vx !== 0 || this.vy !== 0) {
            this.animationTimer += deltaTime * this.bobSpeed;
            this.bobOffset = Math.sin(this.animationTimer) * 3; // Подпрыгивание на 3 пикселя
        } else {
            this.bobOffset = 0;
        }
        
        // Уменьшаем эффект получения урона
        if (this.hitEffect > 0) {
            this.hitEffect -= deltaTime;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        // Будет переопределено в наследниках
    }
}

// ==============================
// Класс героя на арене
// ==============================
class ArenaHero extends ArenaEntity {
    constructor(worldX, worldY, heroData) {
        super(worldX, worldY, 24, '#4aff4a');
        
        this.heroData = heroData;
        this.hp = heroData.currentStats.hp;
        this.maxHp = heroData.maxHp || heroData.currentStats.hp;
        this.level = heroData.level;
        this.exp = heroData.exp;
        this.speed = heroData.currentStats.speed || 5;
        
        this.attack = heroData.currentStats.attack || 10;
        this.defense = heroData.currentStats.defense || 5;
        
        this.expMagnet = 150;                 // Радиус притягивания опыта
        this.weapons = [];
        this.skillEffects = [];
        
        // Тип героя
        this.heroType = heroData.type;
        
        // Ключ спрайта для героя (warrior, archer, mage, rogue)
        this.spriteKey = this.heroType;

        // Загружаем оружие
        this.loadWeapons();

        // Для анимации
        this.animationFrame = 0;
        this.lastAttackTime = 0;
        this.bobSpeed = 10; // Герой подпрыгивает быстрее

        // Специальные способности для разных классов
        this.traps = [];                     // Ловушки для разбойника
        this.trapCooldown = 0;
        this.trapInterval = 5;                // Ловушка каждые 5 секунд

        this.magicBeam = null;                // Магический луч для мага
        this.magicCooldown = 0;
        this.magicInterval = 8;                // Магия каждые 8 секунд

        // Расходники в бою (зелья)
        this.battleConsumables = [];
        this.loadConsumables();

        // Убеждаемся, что у heroData есть массив для навыков
        if (!this.heroData.learnedSkills) {
            this.heroData.learnedSkills = [];
        }
    }
    
    loadWeapons() {
        if (this.heroData.equipment && this.heroData.equipment.weapon) {
            this.weapons.push(new ArenaWeapon(this, this.heroData.equipment.weapon));
        } else {
            this.weapons.push(new ArenaWeapon(this, {
                name: 'Кулаки',
                damage: 5,
                range: 60,
                cooldown: 0.5,
                type: 'melee',
                icon: '👊'
            }));
        }
    }

    loadConsumables() {
        // Загружаем расходники из инвентаря (первые 3)
        if (this.heroData.inventory) {
            const consumables = this.heroData.inventory.filter(item => item && item.type === 'consumable');
            this.battleConsumables = consumables.slice(0, 3).map(item => ({ ...item }));
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        
        // Визуальная обратная связь
        this.color = '#ff0000';
        setTimeout(() => this.color = '#4aff4a', 100);
        
        return this.hp <= 0;
    }
    
    update(deltaTime, worldWidth, worldHeight) {
        super.update(deltaTime, worldWidth, worldHeight);
        
        // Обновляем оружие
        this.weapons.forEach(w => w.update(deltaTime));
        
        // Анимация
        this.animationFrame += deltaTime * 10;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.getScreenX(cameraX);
        const screenY = this.getScreenY(cameraY) + this.bobOffset; // Добавляем подпрыгивание
        
        // Не рисуем, если сущность за пределами экрана
        if (screenX + this.radius < 0 || screenX - this.radius > ctx.canvas.width ||
            screenY + this.radius < 0 || screenY - this.radius > ctx.canvas.height) {
            return;
        }
        
        ctx.save();
        
        // Эффект получения урона (красная вспышка)
        if (this.hitEffect > 0) {
            ctx.globalAlpha = 0.7;
            ctx.filter = 'brightness(1.5)';
        }
        
        // Получаем спрайт героя
        let sprite = this.spriteManager ? this.spriteManager.getSprite(this.spriteKey) : null;
        
        if (sprite) {
            // Небольшой наклон при движении для эффекта бега
            if (this.vx !== 0 || this.vy !== 0) {
                ctx.translate(screenX, screenY);
                ctx.rotate(Math.sin(this.animationTimer * 2) * 0.03);
                ctx.translate(-screenX, -screenY);
            }
            
            // Рисуем спрайт
            ctx.drawImage(sprite, screenX - 24, screenY - 24, 48, 48);
        } else {
            // Если спрайта нет, рисуем цветной круг
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Иконка класса
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let icon = '⚔️';
            if (this.heroType === 'archer') icon = '🏹';
            if (this.heroType === 'mage') icon = '🔮';
            if (this.heroType === 'rogue') icon = '🗡️';
            
            ctx.fillText(icon, screenX, screenY);
        }
        
        ctx.restore();
        
        // Полоска здоровья
        const hpPercent = this.hp / this.maxHp;
        const barWidth = 40;
        const barHeight = 4;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - barWidth/2, screenY - this.radius - 8, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(screenX - barWidth/2, screenY - this.radius - 8, barWidth * hpPercent, barHeight);
        
        // Уровень
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Lv.${this.level}`, screenX - 15, screenY - this.radius - 12);
        
        // Имя героя
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.heroData.name, screenX, screenY - 35);
        
        // Расходники (зелья)
        if (this.battleConsumables.length > 0) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            for (let i = 0; i < this.battleConsumables.length; i++) {
                const item = this.battleConsumables[i];
                if (item) {
                    ctx.fillText(item.icon, screenX - 30 + i * 20, screenY - 45);
                }
            }
        }
        
        // Рисуем оружие
        this.weapons.forEach(w => w.draw(ctx, cameraX, cameraY));
        
        // Рисуем ловушки для разбойника
        if (this.heroType === 'rogue') {
            this.traps.forEach(trap => trap.draw(ctx, cameraX, cameraY));
        }
        
        // Рисуем магию для мага
        if (this.heroType === 'mage' && this.magicBeam) {
            this.magicBeam.draw(ctx, cameraX, cameraY);
        }
    }
    
    addExp(amount) {
        this.exp += amount;
        while (this.exp >= 100) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.exp -= 100;
        
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.attack += 2;
        
        this.heroData.level = this.level;
        this.heroData.exp = this.exp;
        this.heroData.baseStats.hp = this.maxHp;
        this.heroData.baseStats.attack = this.attack;
    }
}

// Класс врага на арене
class ArenaEnemy extends ArenaEntity {
    constructor(x, y, difficulty = 1) {
        super(x, y, 18, '#ff4a4a');
        
        this.difficulty = difficulty;
        this.hp = 20 + 10 * difficulty;
        this.maxHp = this.hp;
        this.attack = 3 + 2 * difficulty;
        this.speed = 5 + 1 * difficulty;
        this.expValue = 5 + 5 * difficulty;
        
        // Тип врага
        const enemyTypes = [
            { name: 'Гоблин', sprite: 'goblin', color: '#0f8a0f', attackSpeed: 1.0 },
            { name: 'Скелет', sprite: 'skeleton', color: '#aaa', attackSpeed: 0.8 },
            { name: 'Призрак', sprite: 'ghost', color: '#aa4aff', attackSpeed: 0.6 },
            { name: 'Орк', sprite: 'goblin', color: '#8B4513', attackSpeed: 1.2 }
        ];
        
        this.type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.color = this.type.color;
        this.spriteKey = this.type.sprite;
        this.name = this.type.name;
        
        this.damageCooldown = 0;
        this.damageInterval = 1.0 / this.type.attackSpeed;
        
        this.spriteManager = window.spriteManager;
    }
    
    update(deltaTime, hero, worldWidth, worldHeight) {
        if (this.slowed) {
            this.slowTimer -= deltaTime;
            if (this.slowTimer <= 0) {
                this.slowed = false;
                this.speed *= 2;          // Возвращаем нормальную скорость
                this.bobSpeed *= 2;       // Возвращаем нормальную скорость анимации
            }
        }

        super.update(deltaTime, worldWidth, worldHeight);
        
        if (hero && hero.isActive) {
            const dx = hero.worldX - this.worldX;
            const dy = hero.worldY - this.worldY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.vx = dx / distance;
                this.vy = dy / distance;
            }
            
            // Атака при касании
            if (distance < this.radius + hero.radius) {
                this.damageCooldown -= deltaTime;
                if (this.damageCooldown <= 0) {
                    hero.takeDamage(this.attack);
                    this.damageCooldown = this.damageInterval;
                }
            }
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        this.color = '#ffffff';
        setTimeout(() => this.color = this.type.color, 100);
        return this.hp <= 0;
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.getScreenX(cameraX);
        const screenY = this.getScreenY(cameraY) + this.bobOffset;
        
        if (screenX + this.radius < 0 || screenX - this.radius > ctx.canvas.width ||
            screenY + this.radius < 0 || screenY - this.radius > ctx.canvas.height) {
            return;
        }
        
        ctx.save();
        
        // Эффект получения урона
        if (this.hitEffect > 0) {
            ctx.globalAlpha = 0.8;
            ctx.filter = 'brightness(1.8) sepia(1)';
        }
        
        // Получаем спрайт врага
        let sprite = this.spriteManager ? this.spriteManager.getSprite(this.spriteKey) : null;
        
        if (sprite) {
            // Небольшой наклон при движении
            if (this.vx !== 0 || this.vy !== 0) {
                ctx.translate(screenX, screenY);
                ctx.rotate(Math.sin(this.animationTimer * 2) * 0.03);
                ctx.translate(-screenX, -screenY);
            }
            
            ctx.drawImage(sprite, screenX - 20, screenY - 20, 40, 40);
        } else {
            // Если спрайта нет, рисуем цветной круг
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Полоска здоровья
        const hpPercent = this.hp / this.maxHp;
        const barWidth = 30;
        const barHeight = 3;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - barWidth/2, screenY - this.radius - 5, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(screenX - barWidth/2, screenY - this.radius - 5, barWidth * hpPercent, barHeight);
        
        // Индикатор замедления
        if (this.slowed) {
            ctx.fillStyle = '#00aaff';
            ctx.beginPath();
            ctx.arc(screenX - 15, screenY - 15, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ==============================
// Класс оружия на арене
// ==============================
class ArenaWeapon {
    constructor(owner, weaponData) {
        this.owner = owner;
        this.data = weaponData;
        this.cooldown = 0;
        this.projectiles = [];
    }
    
    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
        }
        
        if (this.cooldown <= 0) {
            this.attack();
            this.cooldown = this.data.cooldown || 1.0;
        }
        
        this.projectiles = this.projectiles.filter(p => p.isActive);
        this.projectiles.forEach(p => p.update(deltaTime));
    }
    
    attack() {
        if (this.data.type === 'melee' || !this.data.type) {
            this.projectiles.push(new MeleeProjectile(this.owner, this.data));
        } else {
            const arena = window.currentArena;
            if (arena && arena.enemies.length > 0) {
                const target = arena.enemies[Math.floor(Math.random() * arena.enemies.length)];
                if (target && target.isActive) {
                    this.projectiles.push(new RangedProjectile(this.owner, this.data, target));
                }
            }
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        this.projectiles.forEach(p => p.draw(ctx, cameraX, cameraY));
        
        // Рисуем кулдаун
        if (this.cooldown > 0) {
            const screenX = this.owner.getScreenX(cameraX);
            const screenY = this.owner.getScreenY(cameraY);
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, 30, 0, Math.PI * 2 * (1 - this.cooldown / (this.data.cooldown || 1.0)));
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}

// ==============================
// Класс снаряда дальнего боя
// ==============================
class RangedProjectile {
    constructor(owner, data, target) {
        this.owner = owner;
        this.worldX = owner.worldX;
        this.worldY = owner.worldY;
        this.data = data;
        this.target = target;
        this.speed = 300;
        this.radius = 6;
        this.isActive = true;
        this.damage = data.damage || 5;
    }
    
    update(deltaTime) {
        if (!this.target || !this.target.isActive) {
            this.isActive = false;
            return;
        }
        
        const dx = this.target.worldX - this.worldX;
        const dy = this.target.worldY - this.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            this.target.takeDamage(this.damage);
            this.isActive = false;
        } else {
            this.worldX += (dx / distance) * this.speed * deltaTime;
            this.worldY += (dy / distance) * this.speed * deltaTime;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.worldX - cameraX;
        const screenY = this.worldY - cameraY;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffaa00';
        ctx.fill();
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ==============================
// Класс снаряда ближнего боя
// ==============================
class MeleeProjectile {
    constructor(owner, data) {
        this.owner = owner;
        this.data = data;
        this.lifetime = 0.2;
        this.isActive = true;
        this.hitEnemies = new Set();
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.isActive = false;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.owner.getScreenX(cameraX);
        const screenY = this.owner.getScreenY(cameraY);
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.data.range || 60, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ==============================
// Класс кристалла опыта
// ==============================
class ExpGem extends ArenaEntity {
    constructor(x, y, value) {
        super(x, y, 10, '#ffd700');
        this.value = value;
        this.spriteManager = window.spriteManager;
        this.floatOffset = 0;
        this.floatDir = 1;
    }
    
    update(deltaTime, worldWidth, worldHeight) {
        super.update(deltaTime, worldWidth, worldHeight);
        
        // Анимация парения
        this.floatOffset += deltaTime * 2 * this.floatDir;
        if (Math.abs(this.floatOffset) > 5) {
            this.floatDir *= -1;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        if (!this.isActive) return;
        
        const screenX = this.getScreenX(cameraX);
        const screenY = this.getScreenY(cameraY) + this.floatOffset;
        
        const sprite = this.spriteManager.getSprite('expGem');
        ctx.drawImage(sprite, screenX - 10, screenY - 10, 20, 20);
    }
}

// Делаем все классы глобальными
window.ArenaEntity = ArenaEntity;
window.ArenaHero = ArenaHero;
window.ArenaEnemy = ArenaEnemy;
window.ArenaWeapon = ArenaWeapon;
window.ExpGem = ExpGem;