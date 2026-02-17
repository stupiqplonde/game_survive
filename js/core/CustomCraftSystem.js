class CustomCraftSystem {
    constructor() {
        this.baseRecipes = [
            {
                id: 'wood_to_planks',
                name: 'Доски из древесины',
                inputs: { wood: 2 },
                outputs: { planks: 1 },
                unlocked: true
            },
            {
                id: 'metal_to_parts',
                name: 'Металлические детали',
                inputs: { metal: 3 },
                outputs: { metalParts: 1 },
                unlocked: true
            }
        ];
        
        this.customRecipes = [];
        this.selectedIngredients = [];
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
    
    // Добавление ингредиента в крафт
    addIngredient(type, amount) {
        this.selectedIngredients.push({ type, amount });
        this.notify();
    }
    
    removeIngredient(index) {
        this.selectedIngredients.splice(index, 1);
        this.notify();
    }
    
    // Проверка возможности создания рецепта
    validateCustomRecipe(ingredients) {
        // Проверка на дубликаты ингредиентов
        const typeCount = {};
        ingredients.forEach(ing => {
            typeCount[ing.type] = (typeCount[ing.type] || 0) + ing.amount;
        });
        
        // Проверяем, что все ингредиенты доступны
        for (const [type, amount] of Object.entries(typeCount)) {
            if ((window.GameState.materials[type] || 0) < amount) {
                return { valid: false, reason: `Недостаточно ${type}` };
            }
        }
        
        // Проверяем, что комбинация уникальна
        const isUnique = !this.allRecipes.some(recipe => {
            const recipeIngredients = recipe.inputs;
            return Object.entries(recipeIngredients).every(([t, a]) => 
                typeCount[t] === a
            ) && Object.keys(recipeIngredients).length === Object.keys(typeCount).length;
        });
        
        if (!isUnique) {
            return { valid: false, reason: 'Такой рецепт уже существует' };
        }
        
        // Определяем редкость и результат
        const rarity = this.determineRarity(ingredients);
        const result = this.generateResult(ingredients, rarity);
        
        return { valid: true, result, rarity };
    }
    
    determineRarity(ingredients) {
        const totalValue = ingredients.reduce((sum, ing) => {
            const values = { wood: 1, metal: 2, planks: 3, metalParts: 4 };
            return sum + (values[ing.type] || 1) * ing.amount;
        }, 0);
        
        if (totalValue >= 20) return 'epic';
        if (totalValue >= 10) return 'rare';
        return 'common';
    }
    
    generateResult(ingredients, rarity) {
        const baseNames = {
            'common': ['Простой предмет', 'Обычная вещь', 'Базовая деталь'],
            'rare': ['Редкая находка', 'Качественное изделие', 'Особый предмет'],
            'epic': ['Эпический артефакт', 'Легендарная вещь', 'Уникальное творение']
        };
        
        const name = baseNames[rarity][Math.floor(Math.random() * baseNames[rarity].length)];
        const nameIndex = Date.now() % 1000;
        
        // Генерируем случайный предмет на основе ингредиентов
        const statsBonus = {};
        ingredients.forEach(ing => {
            if (ing.type.includes('wood')) statsBonus.defense = (statsBonus.defense || 0) + ing.amount;
            if (ing.type.includes('metal')) statsBonus.attack = (statsBonus.attack || 0) + ing.amount;
            if (ing.type.includes('cloth')) statsBonus.hp = (statsBonus.hp || 0) + ing.amount * 5;
        });
        
        return new Item(
            'custom_' + Date.now(),
            `${name} #${nameIndex}`,
            this.determineItemType(ingredients),
            rarity,
            statsBonus
        );
    }
    
    determineItemType(ingredients) {
        const types = ingredients.map(i => i.type);
        if (types.some(t => t.includes('metal') || t.includes('parts'))) {
            return 'weapon_melee';
        }
        if (types.some(t => t.includes('wood'))) {
            return 'weapon_ranged';
        }
        if (types.some(t => t.includes('cloth'))) {
            return 'armor';
        }
        return 'consumable';
    }
    
    createCustomRecipe(name, ingredients, result) {
        const validation = this.validateCustomRecipe(ingredients);
        if (!validation.valid) {
            return { success: false, reason: validation.reason };
        }
        
        const recipe = {
            id: 'custom_' + Date.now(),
            name: name || validation.result.name,
            inputs: {},
            outputs: { item: validation.result },
            unlocked: true,
            isCustom: true
        };
        
        ingredients.forEach(ing => {
            recipe.inputs[ing.type] = (recipe.inputs[ing.type] || 0) + ing.amount;
        });
        
        this.customRecipes.push(recipe);
        
        // Тратим ингредиенты
        ingredients.forEach(ing => {
            window.GameState.updateMaterial(ing.type, -ing.amount);
        });
        
        this.notify();
        return { success: true, recipe };
    }
    
    get allRecipes() {
        return [...this.baseRecipes, ...this.customRecipes];
    }
    
    craft(recipeId) {
        const recipe = this.allRecipes.find(r => r.id === recipeId);
        if (!recipe) return { success: false, reason: 'Рецепт не найден' };
        
        // Проверяем ингредиенты
        for (const [type, amount] of Object.entries(recipe.inputs)) {
            if ((window.GameState.materials[type] || 0) < amount) {
                return { success: false, reason: `Недостаточно ${type}` };
            }
        }
        
        // Тратим ингредиенты
        for (const [type, amount] of Object.entries(recipe.inputs)) {
            window.GameState.updateMaterial(type, -amount);
        }
        
        // Получаем результат
        if (recipe.outputs.item) {
            // Добавляем предмет текущему герою
            const currentHero = window.GameState.heroes.find(h => h.id === window.GameState.currentHeroId);
            if (currentHero) {
                const emptySlot = currentHero.inventory.findIndex(slot => slot === null);
                if (emptySlot !== -1) {
                    currentHero.equipItem(recipe.outputs.item, emptySlot);
                }
            }
        }
        
        return { success: true };
    }
    
    renderCraftingUI() {
        return `
            <div class="crafting-panel">
                <h2>🔨 Мастерская крафта</h2>
                
                <div class="base-recipes">
                    <h3>Базовые рецепты</h3>
                    ${this.baseRecipes.map(recipe => `
                        <div class="recipe-item">
                            <span>${recipe.name}</span>
                            <span>${this.formatIngredients(recipe.inputs)}</span>
                            <button class="craft-btn" data-recipe="${recipe.id}">Создать</button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="custom-recipes">
                    <h3>Ваши рецепты</h3>
                    ${this.customRecipes.map(recipe => `
                        <div class="recipe-item custom">
                            <span>✨ ${recipe.name}</span>
                            <span>${this.formatIngredients(recipe.inputs)}</span>
                            <button class="craft-btn" data-recipe="${recipe.id}">Создать</button>
                        </div>
                    `).join('') || '<p>Пока нет своих рецептов</p>'}
                </div>
                
                <div class="custom-crafting">
                    <h3>Создать свой рецепт</h3>
                    <div class="ingredients-selector">
                        <div class="available-materials">
                            <h4>Доступные материалы:</h4>
                            ${Object.entries(window.GameState.materials).map(([type, amount]) => `
                                <button class="material-btn" data-type="${type}">
                                    ${this.getIcon(type)} ${this.getName(type)}: ${amount}
                                </button>
                            `).join('')}
                        </div>
                        
                        <div class="selected-ingredients">
                            <h4>Выбранные ингредиенты:</h4>
                            <div class="ingredients-list" id="selectedIngredients"></div>
                        </div>
                        
                        <div class="recipe-name-input">
                            <input type="text" id="recipeName" placeholder="Название рецепта">
                            <button id="createRecipeBtn" class="create-recipe-btn">Создать рецепт</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    formatIngredients(ingredients) {
        return Object.entries(ingredients)
            .map(([type, amount]) => `${this.getIcon(type)} ${amount}`)
            .join(' + ');
    }
    
    getIcon(type) {
        const icons = {
            'wood': '🪵',
            'metal': '⚙️',
            'cloth': '🧵',
            'planks': '🪑',
            'metalParts': '🔩',
            'item': '📦'
        };
        return icons[type] || '📦';
    }
    
    getName(type) {
        const names = {
            'wood': 'Древесина',
            'metal': 'Металл',
            'cloth': 'Ткань',
            'planks': 'Доски',
            'metalParts': 'Детали'
        };
        return names[type] || type;
    }
    
    save() {
        localStorage.setItem('customRecipes', JSON.stringify({
            customRecipes: this.customRecipes
        }));
    }
    
    load() {
        const saved = localStorage.getItem('customRecipes');
        if (saved) {
            const data = JSON.parse(saved);
            this.customRecipes = data.customRecipes || [];
        }
    }
}

window.CustomCraftSystem = CustomCraftSystem;