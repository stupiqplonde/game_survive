class UIManager {
    constructor() {
        this.screens = {
            lobby: document.getElementById('screenLobby'),
            heroes: document.getElementById('screenHeroes'),
            shop: document.getElementById('screenShop'),
            craft: document.getElementById('screenCraft'),
            arena: document.getElementById('screenArena')
        };

        this.navButtons = document.querySelectorAll('.nav-btn');
        this.resourceElements = {
            proviziya: document.querySelector('#proviziya span'),
            toplivo: document.querySelector('#toplivo span'),
            instrumenty: document.querySelector('#instrumenty span')
        };

        this.gameHeader = document.querySelector('.game-header');
        this.shopTimer = null;

        if (this.gameHeader) {
            this.gameHeader.style.display = 'flex';
            this.gameHeader.style.visibility = 'visible';
        }

        this.initEventListeners();
        this.subscribeToState();
        this.updateResourcesUI();
        this.renderHeroes();

        if (window.GameState.shop) this.renderShop();
        if (window.GameState.recipeManager) this.renderCraft();
    }

    initEventListeners() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenId = e.target.dataset.screen;
                this.showScreen(screenId);
                this.setActiveNavButton(e.target);

                if (screenId === 'heroes') this.renderHeroes();
                else if (screenId === 'shop') this.renderShop();
                else if (screenId === 'craft') this.renderCraft();
            });
        });

        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('heroModal').style.display = 'none';
                this.handleModalClose();
            });
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('heroModal');
            if (e.target === modal) {
                modal.style.display = 'none';
                this.handleModalClose();
            }
        });
    }

    handleModalClose() {
        if (window.currentArena?.hero?.heroData) {
            const hero = window.currentArena.hero.heroData;
            if (hero.pendingSkillLevel > 0) {
                hero.pendingSkillLevel = 0;
                window.currentArena.skillChoiceShown = false;
                window.currentArena.resume();
            }
        }
    }

    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => screen?.classList.remove('active'));
        this.screens[screenId]?.classList.add('active');

        if (this.gameHeader) {
            this.gameHeader.style.display = screenId === 'arena' ? 'none' : 'flex';
            this.gameHeader.style.visibility = screenId === 'arena' ? 'hidden' : 'visible';
        }
    }

    setActiveNavButton(activeBtn) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    subscribeToState() {
        window.GameState.subscribe(() => {
            this.updateResourcesUI();
            if (this.screens.heroes.classList.contains('active')) this.renderHeroes();
            else if (this.screens.shop.classList.contains('active')) this.renderShop();
            else if (this.screens.craft.classList.contains('active')) this.renderCraft();
        });
    }

    updateResourcesUI() {
        const r = window.GameState.resources;
        if (this.resourceElements.proviziya) this.resourceElements.proviziya.textContent = r.proviziya.toFixed(1);
        if (this.resourceElements.toplivo) this.resourceElements.toplivo.textContent = r.toplivo.toFixed(1);
        if (this.resourceElements.instrumenty) this.resourceElements.instrumenty.textContent = r.instrumenty.toFixed(1);
    }

    getHeroAvatarUrl(hero) {
        return window.spriteManager 
            ? window.spriteManager.getAvatarUrl(hero.type, hero.name)
            : `images/heroes/${hero.type}.png?t=${Date.now()}`;
    }

    renderHeroes() {
        const container = document.getElementById('heroesList');
        if (!container) return;

        container.innerHTML = '';

        window.GameState.heroes.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card';
            if (hero.id === window.GameState.currentHeroId) {
                heroCard.style.border = '2px solid #e94560';
            }

            const avatarUrl = this.getHeroAvatarUrl(hero);
            heroCard.innerHTML = window.HeroCardTemplate.render(hero, hero.id === window.GameState.currentHeroId, avatarUrl);
            container.appendChild(heroCard);
        });

        this.addHeroEventListeners();
    }

    addHeroEventListeners() {
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.GameState.selectHero(e.target.dataset.heroId);
                this.renderHeroes();
            });
        });

        document.querySelectorAll('.inventory-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showHeroInventory(e.target.dataset.heroId));
        });
    }

    renderShop() {
        const container = document.getElementById('shopItems');
        if (!container) return;

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
            itemCard.innerHTML = window.ShopItemTemplate.render(item);
            container.appendChild(itemCard);
        });

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
                    this.showNotification(result.message);
                    this.renderShop();
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });

        const timeLeft = Math.max(0, 30 - Math.floor((Date.now() - window.GameState.shop.lastUpdate) / 1000));
        const shopInfo = document.createElement('div');
        shopInfo.innerHTML = window.ShopItemTemplate.renderShopInfo(timeLeft);
        container.appendChild(shopInfo);

        this.startShopTimer();
    }

    startShopTimer() {
        if (this.shopTimer) clearInterval(this.shopTimer);

        this.shopTimer = setInterval(() => {
            const timerElement = document.querySelector('#shopTimer');
            if (timerElement) {
                const lastUpdate = window.GameState.shop.lastUpdate;
                const timeLeft = Math.max(0, 30 - Math.floor((Date.now() - lastUpdate) / 1000));
                timerElement.textContent = timeLeft;

                if (timeLeft <= 0) this.renderShop();
            }
        }, 1000);
    }

    renderCraft() {
        const container = document.getElementById('craftRecipes');
        if (!container) return;

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

        const materials = window.GameState.getMaterials();
        const materialsDiv = document.createElement('div');
        materialsDiv.innerHTML = window.CraftItemTemplate.renderMaterials(materials);
        container.appendChild(materialsDiv);

        const title = document.createElement('h3');
        title.textContent = 'Доступные рецепты:';
        title.style.marginBottom = '15px';
        title.style.color = '#4aff4a';
        container.appendChild(title);

        const unlockedRecipes = window.GameState.recipeManager.getUnlockedRecipes();

        if (unlockedRecipes.length === 0) {
            container.innerHTML += '<p>Нет доступных рецептов</p>';
            return;
        }

        unlockedRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'craft-item';

            const canCraft = recipe.canCraft(currentHero, window.GameState.materials);
            recipeCard.innerHTML = window.CraftItemTemplate.renderRecipe(recipe, canCraft);
            container.appendChild(recipeCard);
        });

        document.querySelectorAll('.craft-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;

                const recipeId = e.target.dataset.recipeId;
                const currentHero = window.GameState.getCurrentHero();

                if (!currentHero) {
                    this.showNotification('Сначала выберите героя!', 'error');
                    return;
                }

                const result = window.GameState.craftItem(recipeId, currentHero.id);

                if (result.success) {
                    this.showNotification(result.message);
                    this.renderCraft();
                    if (result.newRecipe) {
                        setTimeout(() => this.showNotification(`🔓 Открыт новый рецепт: ${result.newRecipe.name}!`), 100);
                    }
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });
    }

    showSkillChoice(hero, skills) {
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalBody) {
            if (window.currentArena) {
                window.currentArena.skillChoiceShown = false;
                window.currentArena.resume();
            }
            return;
        }

        if (!skills || skills.length === 0) {
            hero.pendingSkillLevel = 0;
            if (window.currentArena) {
                window.currentArena.skillChoiceShown = false;
                window.currentArena.resume();
            }
            return;
        }

        modalBody.innerHTML = window.SkillChoiceTemplate.render(hero.name, hero.pendingSkillLevel, skills);
        modal.style.display = 'block';

        this.setupSkillChoiceCards(hero, modal);
    }

    setupSkillChoiceCards(hero, modal) {
        const cards = document.querySelectorAll('.skill-choice-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseover', () => {
                card.style.borderColor = '#e94560';
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 0 15px rgba(233,69,96,0.5)';
            });
            
            card.addEventListener('mouseout', () => {
                card.style.borderColor = '#0f3460';
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'none';
            });

            card.addEventListener('click', () => {
                const skillId = card.dataset.skillId;
                const skill = window.GameState.skillManager?.skills.find(s => s.id === skillId);

                if (skill) {
                    const success = window.GameState.skillManager.learnSkill(hero, skillId);

                    if (success) {
                        hero.pendingSkillLevel = 0;
                        modal.style.display = 'none';

                        if (window.currentArena) {
                            window.currentArena.updateSkillSlots();
                        }

                        this.showNotification(`✨ Герой изучил навык: ${skill.name}`);
                        this.renderHeroes();

                        if (window.currentArena) {
                            window.currentArena.skillChoiceShown = false;
                            window.currentArena.resume();
                        }
                    } else {
                        this.showNotification('❌ Не удалось изучить навык', 'error');
                    }
                }
            });
        });

        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                hero.pendingSkillLevel = 0;
                modal.style.display = 'none';
                if (window.currentArena) {
                    window.currentArena.skillChoiceShown = false;
                    window.currentArena.resume();
                }
            });
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.innerHTML = window.NotificationTemplate.render(message, type);
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    showHeroInventory(heroId) {
        const hero = window.GameState.heroes.find(h => h.id === heroId);
        if (!hero) return;

        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        const inventory = window.GameState.inventory || [];

        modalBody.innerHTML = window.InventoryTemplate.render(hero, inventory);

        document.querySelectorAll('.inventory-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const instanceId = e.currentTarget.dataset.instanceId;
                const item = inventory.find(i => i.id === itemId && (i.instanceId === instanceId || !i.instanceId));

                if (item) this.showEquipMenu(hero, item);
            });
        });

        document.querySelectorAll('.unequip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = e.target.dataset.heroId;
                const slot = e.target.dataset.slot;
                const hero = window.GameState.heroes.find(h => h.id === heroId);

                if (hero) {
                    hero.unequip(slot);
                    this.showHeroInventory(heroId);
                }
            });
        });

        document.getElementById('closeInventoryBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.style.display = 'block';
    }

    showEquipMenu(hero, item) {
        const validSlots = hero.getValidSlotsForItem(item);
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');

        if (validSlots.length === 0) {
            alert('Этот предмет нельзя экипировать данному герою');
            return;
        }

        modalBody.innerHTML = window.InventoryTemplate.renderEquipMenu(hero, item, validSlots);

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

    updateArenaUI(arena) {
        if (!arena?.hero) return;

        const hpPercent = (arena.hero.hp / arena.hero.maxHp) * 100;
        const expPercent = ((arena.hero.exp % 100) / 100) * 100;

        const hpBar = document.getElementById('arenaHpBar');
        const hpText = document.getElementById('arenaHpText');
        const expBar = document.getElementById('arenaExpBar');
        const expText = document.getElementById('arenaExpText');
        const timer = document.getElementById('arenaTimer');

        if (hpBar) hpBar.style.width = `${hpPercent}%`;
        if (hpText) hpText.textContent = `${Math.floor(arena.hero.hp)}/${arena.hero.maxHp}`;

        if (expBar) expBar.style.width = `${expPercent}%`;
        if (expText) expText.textContent = `Ур. ${arena.hero.level} (${arena.hero.exp % 100}/100)`;

        const minutes = Math.floor(arena.gameTime / 60);
        const seconds = Math.floor(arena.gameTime % 60);
        if (timer) timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.updateSkillSlots(arena);
    }

    updateSkillSlots(arena) {
        const skillSlots = document.querySelectorAll('.skill-slot');
        if (!skillSlots.length || !arena.hero?.heroData) return;

        const learnedSkills = arena.hero.heroData.learnedSkills || [];

        skillSlots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('active');
        });

        learnedSkills.forEach((skillId, index) => {
            if (index < skillSlots.length) {
                const skill = window.GameState.skillManager?.skills.find(s => s.id === skillId);
                if (skill) {
                    skillSlots[index].innerHTML = skill.icon;
                    skillSlots[index].classList.add('active');
                    skillSlots[index].title = skill.name;
                }
            }
        });
    }

    showBattleResults(arena) {
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');

        const minutes = Math.floor(arena.gameTime / 60);
        const seconds = Math.floor(arena.gameTime % 60);
        const kills = arena.enemies?.length || 0;

        modalBody.innerHTML = `
            <h2 style="color: #e94560; text-align: center; margin-bottom: 20px;">🏆 Результаты боя</h2>
            <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚔️</div>
                <p style="font-size: 1.2rem; margin: 10px 0;">Время: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                <p style="font-size: 1.2rem; margin: 10px 0;">Убито врагов: ${kills}</p>
                <p style="font-size: 1.2rem; margin: 10px 0;">Достигнут уровень: ${arena.hero.level}</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="closeResultsBtn" style="background: #4aff4a; color: #000; padding: 10px 30px; border: none; border-radius: 5px; cursor: pointer;">Закрыть</button>
            </div>
        `;

        modal.style.display = 'block';

        document.getElementById('closeResultsBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

window.UIManager = UIManager;