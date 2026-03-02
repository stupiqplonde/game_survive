class UIManager {
    constructor() {
        // Экраны
        this.screens = {
            lobby: document.getElementById('screenLobby'),
            heroes: document.getElementById('screenHeroes'),
            shop: document.getElementById('screenShop'),
            craft: document.getElementById('screenCraft')
        };

        // Кнопки навигации
        this.navButtons = document.querySelectorAll('.nav-btn');

        // Элементы для отображения ресурсов
        this.resourceElements = {
            proviziya: document.querySelector('#proviziya span'),
            toplivo: document.querySelector('#toplivo span'),
            instrumenty: document.querySelector('#instrumenty span')
        };

        if (window.GameState.shop) {
            this.renderShop();
        }

        if (window.GameState.recipeManager) {
            this.renderCraft();
        }

        // --- Запускаем инициализацию ---
        this.initEventListeners(); // Вешаем обработчики событий
        this.subscribeToState();   // Подписываемся на изменения GameState
        this.updateResourcesUI();  // Первичное обновление ресурсов
        this.renderHeroes();
    }

    initEventListeners() {
        // Переключение экранов по клику на навигационные кнопки
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenId = e.currentTarget.dataset.screen;
                this.showScreen(screenId);
                this.setActiveNavButton(e.currentTarget);

                if (screenId === 'heroes') {
                    this.renderHeroes();
                } else if (screenId === 'shop') {
                    this.renderShop();
                } else if (screenId === 'craft') {
                    this.renderCraft();
                }
            });
        });

        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('heroModal').style.display = 'none';
        });

        // Закрытие модального окна
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('heroModal').style.display = 'none';
            });
        }

        // Клик по пустой области модального окна (фону) для закрытия
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('heroModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    subscribeToState() {
        window.GameState.subscribe(() => {
            this.updateResourcesUI();
            
            if (this.screens.heroes.classList.contains('active')) {
                this.renderHeroes();
            } else if (this.screens.shop.classList.contains('active')) {
                this.renderShop();
            } else if (this.screens.craft.classList.contains('active')) { // +++ НОВОЕ
                this.renderCraft();
            }
        });
    }

    showScreen(screenId) {
        // Скрываем все экраны
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        // Показываем нужный
        this.screens[screenId].classList.add('active');
    }

    setActiveNavButton(activeBtn) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    updateResourcesUI() {
        this.resourceElements.proviziya.textContent = window.GameState.resources.proviziya;
        this.resourceElements.toplivo.textContent = window.GameState.resources.toplivo;
        this.resourceElements.instrumenty.textContent = window.GameState.resources.instrumenty;
    }

    // Получить путь к аватарке героя (для тега <img>)
    getHeroAvatarUrl(hero) {
        // Если есть SpriteManager, используем его
        if (window.spriteManager) {
            return window.spriteManager.getAvatarUrl(hero.type, hero.name);
        }
        // Запасной вариант - прямой путь к папке
        return `images/heroes/${hero.type}.png?t=${Date.now()}`;
    }

    // Отрисовка списка героев в меню
    renderHeroes() {
        const container = document.getElementById('heroesList');
        if (!container) return;

        container.innerHTML = '';

        // Перебираем всех героев
        window.GameState.heroes.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card';
            
            // Если это текущий выбранный герой, выделяем его рамкой
            if (hero.id === window.GameState.currentHeroId) {
                heroCard.style.border = '2px solid #e94560';
            }

            // Получаем URL аватара
            const avatarUrl = this.getHeroAvatarUrl(hero);

            // Создаём HTML карточки героя
            heroCard.innerHTML = `
                <div class="hero-avatar" style="position: relative;">
                    <!-- Аватарка героя - теперь это реальная картинка! -->
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
                    <!-- Отображение изученных навыков в виде иконок -->
                    <div class="learned-skills" style="display: flex; gap: 5px; margin-top: 5px; justify-content: center;">
                        ${hero.learnedSkills.map(skillId => {
                            const skill = window.GameState.skillManager?.skills.find(s => s.id === skillId);
                            return skill ? `<span title="${skill.name}" style="font-size: 1.5rem;">${skill.icon}</span>` : '';
                        }).join('')}
                    </div>
                </div>
                <button class="select-hero-btn" data-hero-id="${hero.id}">Выбрать для боя</button>
                <button class="inventory-hero-btn" data-hero-id="${hero.id}">Инвентарь</button>
            `;

            container.appendChild(heroCard);
        });

        // Добавляем обработчики для кнопок
        this.addHeroEventListeners();
    }

    // Обработчики для кнопок в карточках героев
    addHeroEventListeners() {
        // Кнопка "Выбрать для боя"
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                window.GameState.selectHero(heroId);
                this.renderHeroes(); // Перерисовываем, чтобы обновить выделение
            });
        });

        // Кнопка "Инвентарь"
        document.querySelectorAll('.inventory-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                this.showHeroInventory(heroId);
            });
        });
    }

    renderShop() {
        const container = document.getElementById('shopItems');
        container.innerHTML = '';
        
        if (!window.GameState.shop) {
            container.innerHTML = '<p>Магазин не инициализирован</p>';
            return;
        }
        
        const currentHero = window.GameState.getCurrentHero();
        if (!currentHero) {
            container.innerHTML = '<p>Сначала выберите героя</p>';
            return;
        }
        
        window.GameState.shop.dailyItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'shop-item';
            
            // Определяем цвет редкости
            let rarityColor = '#ffffff';
            if (item.rarity === 'rare') rarityColor = '#4caaff';
            if (item.rarity === 'epic') rarityColor = '#aa4cff';
            if (item.rarity === 'legendary') rarityColor = '#ffaa4c';
            
            itemCard.innerHTML = `
                <div style="font-size: 3rem;">${item.icon}</div>
                <h3 style="color: ${rarityColor};">${item.name}</h3>
                <p class="item-type">${item.type}</p>
                <p class="item-description">${item.description}</p>
                <p class="item-price">💰 ${item.getPrice()} провизии</p>
                <p class="item-rarity" style="color: ${rarityColor};">${item.rarity}</p>
                <button class="buy-item-btn" data-item-id="${item.id}">Купить</button>
            `;
            
            container.appendChild(itemCard);
        });
        
        // Добавляем обработчики покупки
        document.querySelectorAll('.buy-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const currentHero = window.GameState.getCurrentHero();
                
                if (!currentHero) {
                    alert('Сначала выберите героя!');
                    return;
                }
                
                const result = window.GameState.shop.buyItem(itemId, currentHero.id);
                
                if (result.success) {
                    alert(result.message);
                    this.renderShop(); // Обновляем магазин
                } else {
                    alert(result.message);
                }
            });
        });
        
        // Добавляем информацию о времени обновления
        const lastUpdate = new Date(window.GameState.shop.lastUpdate);
        const nextUpdate = new Date(lastUpdate.getTime() + 30000); // +30 секунд для теста
        
        const shopInfo = document.createElement('div');
        shopInfo.className = 'shop-info';
        shopInfo.style.marginTop = '20px';
        shopInfo.style.textAlign = 'center';
        shopInfo.innerHTML = `
            <p>🔄 Ассортимент обновится через: <span id="shopTimer"></span>с</p>
        `;
        container.appendChild(shopInfo);
        
        // Запускаем таймер обновления
        this.startShopTimer();
    }

    renderCraft() {
        const container = document.getElementById('craftRecipes');
        container.innerHTML = '';
        
        if (!window.GameState.recipeManager) {
            container.innerHTML = '<p>Система крафта не инициализирована</p>';
            return;
        }
        
        const currentHero = window.GameState.getCurrentHero();
        if (!currentHero) {
            container.innerHTML = '<p>Сначала выберите героя</p>';
            return;
        }
        
        // Отображаем доступные материалы
        const materials = window.GameState.getMaterials();
        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'materials-display';
        materialsDiv.style.cssText = `
            background: #16213e;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            gap: 20px;
            justify-content: center;
        `;
        materialsDiv.innerHTML = `
            <div> 🌲 <span id="materialWood">${materials.wood}</span></div>
            <div> ⛓️ <span id="materialIron">${materials.iron}</span></div>
            <div> 🌯 <span id="materialCloth">${materials.cloth}</span></div>
        `;
        container.appendChild(materialsDiv);
        
        // Заголовок с открытыми рецептами
        const title = document.createElement('h3');
        title.textContent = 'Доступные рецепты:';
        container.appendChild(title);
        
        // Отображаем открытые рецепты
        const unlockedRecipes = window.GameState.recipeManager.getUnlockedRecipes();
        
        if (unlockedRecipes.length === 0) {
            container.innerHTML += '<p>Нет доступных рецептов</p>';
            return;
        }
        
        unlockedRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'craft-item';
            
            // Проверяем, можно ли скрафтить
            const canCraft = recipe.canCraft(currentHero, window.GameState.inventory);
            
            // Собираем строку с материалами
            const materialsList = recipe.materials.map(m => 
                `${m.itemId === 'material_wood' ? '🌲' : m.itemId === 'material_iron' ? '⛓️' : '🌯'} ${m.quantity}`
            ).join(' + ');
            
            recipeCard.innerHTML = `
                <div style="font-size: 2rem;">${recipe.resultItem.icon}</div>
                <h4>${recipe.name}</h4>
                <p>${recipe.resultItem.description}</p>
                <p class="craft-materials">Требуется: ${materialsList}</p>
                <p class="craft-level">Требуемый уровень: ${recipe.requiredLevel}</p>
                <button class="craft-item-btn" data-recipe-id="${recipe.id}" ${!canCraft.success ? 'disabled' : ''}>
                    ${canCraft.success ? 'Скрафтить' : canCraft.message}
                </button>
            `;
            
            // Если нельзя скрафтить, делаем кнопку серой
            if (!canCraft.success) {
                recipeCard.querySelector('button').style.background = '#666';
                recipeCard.querySelector('button').style.cursor = 'not-allowed';
            }
            
            container.appendChild(recipeCard);
        });
        
        // Добавляем обработчики крафта
        document.querySelectorAll('.craft-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                
                const recipeId = e.target.dataset.recipeId;
                const currentHero = window.GameState.getCurrentHero();
                
                if (!currentHero) {
                    alert('Сначала выберите героя!');
                    return;
                }
                
                const result = window.GameState.craftItem(recipeId, currentHero.id);
                
                if (result.success) {
                    alert(result.message);
                    this.renderCraft(); // Обновляем экран крафта
                    
                    // Если открылся новый рецепт, показываем уведомление
                    if (result.newRecipe) {
                        setTimeout(() => {
                            alert(`🔓 Открыт новый рецепт: ${result.newRecipe.name}!`);
                        }, 100);
                    }
                } else {
                    alert(result.message);
                }
            });
        });
    }

    // Показать окно выбора навыка (вызывается, когда герой достигает 3,6,9... уровня)
    showSkillChoice(hero, skills) {
        console.log('showSkillChoice вызван с навыками:', skills);
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');

        // Проверяем, есть ли модальное окно
        if (!modal || !modalBody) {
            console.error('Модальное окно не найдено!');
            if (window.currentArena) {
                window.currentArena.skillChoiceShown = false;
                window.currentArena.resume();
            }
            return;
        }

        // Если нет доступных навыков, просто продолжаем игру
        if (!skills || skills.length === 0) {
            console.log('Нет доступных навыков, продолжаем игру');
            hero.pendingSkillLevel = 0;
            if (window.currentArena) {
                window.currentArena.skillChoiceShown = false;
                window.currentArena.resume();
            }
            return;
        }

        // Создаём HTML для модального окна с 3 навыками
        modalBody.innerHTML = `
            <h2 style="color: #e94560; text-align: center; margin-bottom: 20px;">Выберите навык для ${hero.name} (Уровень ${hero.pendingSkillLevel})</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                ${skills.map(skill => `
                    <div class="skill-choice-card" data-skill-id="${skill.id}" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #0f3460; transition: all 0.3s;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${skill.icon}</div>
                        <h3 style="color: #e94560; margin: 10px 0; font-size: 1.1rem;">${skill.name}</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 10px; color: #aaa;">${skill.description}</p>
                        <div style="background: #0f0f1f; padding: 8px; border-radius: 5px; font-size: 0.8rem; color: #4aff4a;">
                            ${Object.entries(skill.effects).map(([key, value]) => {
                                // Преобразуем эффекты навыка в читаемый текст
                                if (key === 'special') {
                                    if (value.type === 'block') return `🛡️ Блок: ${Math.round(value.chance * 100)}%`;
                                    if (value.type === 'doubleStrike') return `⚡ Двойной удар: ${Math.round(value.chance * 100)}%`;
                                    if (value.type === 'accuracy') return `🎯 Точность: +${Math.round(value.bonus * 100)}%`;
                                    if (value.type === 'armorPierce') return `🏹 Игнор брони: ${Math.round(value.percent * 100)}%`;
                                    if (value.type === 'attackSpeed') return `⚡ Скорость атаки: +${Math.round(value.bonus * 100)}%`;
                                    if (value.type === 'poison') return `☠️ Яд: ${value.damage} урона/${value.duration}с`;
                                    if (value.type === 'slow') return `❄️ Замедление: ${Math.round(value.percent * 100)}%`;
                                    return '';
                                }
                                if (key === 'attack') return `⚔️ Атака +${value}`;
                                if (key === 'defense') return `🛡️ Защита +${value}`;
                                if (key === 'hp') return `❤️ Здоровье +${value}`;
                                if (key === 'speed') return `👟 Скорость +${value}`;
                                if (key === 'critChance') return `⭐ Крит. шанс +${Math.round(value * 100)}%`;
                                if (key === 'critDamage') return `💥 Крит. урон +${Math.round((value - 1.5) * 100)}%`;
                                if (key === 'lifesteal') return `💉 Вампиризм +${Math.round(value * 100)}%`;
                                return '';
                            }).filter(Boolean).join('<br>')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <p style="text-align: center; margin-top: 20px; color: #888; font-size: 0.9rem;">Нажмите на навык, чтобы изучить его</p>
        `;

        modal.style.display = 'block';
        console.log('Модальное окно отображено');

        // Добавляем обработчики для карточек навыков
        this.setupSkillChoiceCards(hero, modal);
    }

    // Настройка обработчиков для карточек навыков
    setupSkillChoiceCards(hero, modal) {
        const skillCards = document.querySelectorAll('.skill-choice-card');
        console.log('Найдено карточек навыков:', skillCards.length);
        
        skillCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const skillId = card.dataset.skillId;
                console.log('Клик по навыку:', skillId);
                
                // Изучаем навык
                const success = window.GameState.skillManager.learnSkill(hero, skillId);
                
                if (success) {
                    console.log('Навык успешно изучен!');
                    
                    // Сбрасываем ожидающий уровень
                    hero.pendingSkillLevel = 0;
                    
                    // Закрываем модальное окно
                    modal.style.display = 'none';
                    
                    // Обновляем отображение героя на арене
                    if (window.currentArena) {
                        window.currentArena.skillChoiceShown = false;
                        window.currentArena.resume();
                        
                        // Обновляем слоты навыков
                        window.currentArena.updateSkillSlots();
                    }
                    
                    // Показываем уведомление
                    this.showNotification('✅ Навык изучен!');
                } else {
                    console.error('Не удалось изучить навык');
                    this.showNotification('❌ Ошибка при изучении навыка', 'error');
                }
            });
            
            // Добавляем эффект наведения
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#e94560';
                card.style.transform = 'scale(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#0f3460';
                card.style.transform = 'scale(1)';
            });
        });
    }

    startShopTimer() {
        if (this.shopTimer) clearInterval(this.shopTimer);
        
        this.shopTimer = setInterval(() => {
            const timerElement = document.querySelector('#shopTimer');
            if (timerElement) {
                const lastUpdate = window.GameState.shop.lastUpdate;
                const timeLeft = Math.max(0, 30 - Math.floor((Date.now() - lastUpdate) / 1000));
                timerElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    this.renderShop(); // Перерисовываем при обновлении
                }
            }
        }, 1000);
    }

    showHeroInventory(heroId) {
        const hero = window.GameState.heroes.find(h => h.id === heroId);
        if (!hero) return;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Инвентарь ${hero.name}</h2>
            <div class="inventory-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                ${hero.inventory.map((item, index) => {
                    if (item) {
                        return `<div class="inventory-slot" data-slot="${index}" style="background: #0f3460; padding: 15px; border-radius: 5px; text-align: center;">
                            <div style="font-size: 2rem;">${item.icon}</div>
                            <div>${item.name}</div>
                            ${item.type === 'consumable' ? '<button class="use-item-btn" data-hero-id="' + heroId + '" data-slot="' + index + '">Использовать</button>' : ''}
                        </div>`;
                    } else {
                        return `<div class="inventory-slot empty" data-slot="${index}" style="background: #1a1a2e; padding: 15px; border-radius: 5px; border: 1px dashed #0f3460; text-align: center;">
                            Пусто
                        </div>`;
                    }
                }).join('')}
            </div>
            <h3>Экипировка</h3>
            <div class="equipment-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                <div class="equipment-slot" style="background: #0f3460; padding: 10px; border-radius: 5px;">
                    <strong>Оружие:</strong><br>
                    ${hero.equipment.weapon ? hero.equipment.weapon.name : 'Пусто'}
                </div>
                <div class="equipment-slot" style="background: #0f3460; padding: 10px; border-radius: 5px;">
                    <strong>Броня:</strong><br>
                    ${hero.equipment.armor ? hero.equipment.armor.name : 'Пусто'}
                </div>
                <div class="equipment-slot" style="background: #0f3460; padding: 10px; border-radius: 5px;">
                    <strong>Аксессуар:</strong><br>
                    ${hero.equipment.accessory ? hero.equipment.accessory.name : 'Пусто'}
                </div>
            </div>
        `;
        
        // Добавляем обработчики для использования расходников
        document.querySelectorAll('.use-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                const slot = parseInt(e.target.dataset.slot);
                const hero = window.GameState.heroes.find(h => h.id === heroId);
                
                if (hero && hero.useConsumable(slot)) {
                    alert('Предмет использован!');
                    this.showHeroInventory(heroId); // Обновляем отображение
                } else {
                    alert('Нельзя использовать этот предмет сейчас');
                }

            });
        });

        document.querySelectorAll('.equip-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                const slot = parseInt(e.target.dataset.slot);
                const hero = window.GameState.heroes.find(h => h.id === heroId);
                const item = hero.inventory[slot];
                
                if (item) {
                    let equipSlot = 'weapon';
                    if (item.type === 'armor') equipSlot = 'armor';
                    if (item.type === 'accessory') equipSlot = 'accessory';
                    
                    hero.equip(item, equipSlot);
                    hero.inventory[slot] = null; // Убираем из инвентаря
                    
                    alert(`Экипировано: ${item.name}`);
                    this.showHeroInventory(heroId);
                }

            });
        });
        
        document.getElementById('heroModal').style.display = 'block';
    }

    showEquipMenu(hero, item) {
        const validSlots = hero.getValidSlotsForItem(item);
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');

        if (validSlots.length === 0) {
            alert('Этот предмет нельзя экипировать данному герою');
            return;
        }

        modalBody.innerHTML = `
            <h2 style="color: #e94560; margin-bottom: 20px;">Экипировка предмета</h2>
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 4rem;">${item.icon || '📦'}</div>
                <h3 style="color: #fff; margin: 10px 0;">${item.name}</h3>
                <p style="color: #aaa;">${item.description || ''}</p>
            </div>
            
            <h3 style="color: #4aff4a; margin-bottom: 10px;">Выберите слот для экипировки:</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
                ${validSlots.map(slot => `
                    <button class="equip-slot-btn" data-slot="${slot}" style="background: #16213e; padding: 15px; border: 2px solid #0f3460; color: white; cursor: pointer; border-radius: 5px;">
                        ${slot.charAt(0).toUpperCase() + slot.slice(1)}
                        ${hero.equipment[slot] ? `<br><small style="color: #ffaa00;">(занято: ${hero.equipment[slot].name})</small>` : ''}
                    </button>
                `).join('')}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="cancelEquipBtn" style="width: auto; padding: 10px 30px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Отмена</button>
            </div>
        `;

        document.querySelectorAll('.equip-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.dataset.slot;

                if (hero.equip(item, slot)) {
                    this.showNotification('✅ Предмет экипирован!');
                    this.showHeroInventory(hero.id);
                } else {
                    this.showNotification('❌ Не удалось экипировать предмет', 'error');
                }
            });
        });

        document.getElementById('cancelEquipBtn').addEventListener('click', () => {
            this.showHeroInventory(hero.id);
        });
    }
}


// Делаем класс глобальным, чтобы его можно было создать в game.js
window.UIManager = UIManager;