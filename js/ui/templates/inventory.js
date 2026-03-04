// js/ui/templates/inventory.js
// Шаблон инвентаря

const InventoryTemplate = {
    /**
     * Создает HTML инвентаря
     * @param {Object} hero - объект героя
     * @param {Array} inventory - общий инвентарь
     * @returns {string} HTML
     */
    render(hero, inventory) {
        const inventoryHtml = inventory.length > 0 
            ? inventory.map((item) => `
                <div class="inventory-item" data-item-id="${item.id}" data-instance-id="${item.instanceId || item.id}" style="background: #16213e; padding: 10px; border-radius: 5px; text-align: center; cursor: pointer; border: 1px solid #0f3460;" 
                     onmouseover="this.style.borderColor='#e94560'" onmouseout="this.style.borderColor='#0f3460'">
                    <div style="font-size: 2rem;">${item.icon || '📦'}</div>
                    <div style="font-size: 0.8rem; color: #fff;">${item.name}</div>
                    <div style="font-size: 0.7rem; color: #aaa;">${item.type}</div>
                </div>
            `).join('') 
            : '<div style="grid-column: span 4; text-align: center; color: #666;">Инвентарь пуст</div>';

        const equipmentHtml = Object.entries(hero.equipment).map(([slot, item]) => `
            <div class="equipment-slot" data-slot="${slot}" style="background: #16213e; padding: 10px; border-radius: 5px; text-align: center; min-height: 100px; border: 2px solid #0f3460;">
                <div style="font-size: 0.8rem; color: #e94560; margin-bottom: 5px; text-transform: capitalize;">${slot}</div>
                ${item ? `
                    <div style="font-size: 2rem;">${item.icon || '📦'}</div>
                    <div style="font-size: 0.8rem; color: #fff;">${item.name}</div>
                    <button class="unequip-btn" data-hero-id="${hero.id}" data-slot="${slot}" style="font-size: 0.7rem; padding: 2px 5px; margin-top: 5px; background: #e94560; color: white; border: none; border-radius: 3px; cursor: pointer;">Снять</button>
                ` : '<div style="color: #666; padding: 20px 0;">Пусто</div>'}
            </div>
        `).join('');

        return `
            <h2 style="color: #e94560; margin-bottom: 20px;">Инвентарь ${hero.name} (${hero.type})</h2>
            <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: #4aff4a; margin-bottom: 10px;">Общий инвентарь</h3>
                    <div class="inventory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-height: 300px; overflow-y: auto; padding: 10px; background: #0f0f1f; border-radius: 10px;">
                        ${inventoryHtml}
                    </div>
                </div>
                
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: #4aff4a; margin-bottom: 10px;">Экипировка</h3>
                    <div class="equipment-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${equipmentHtml}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="closeInventoryBtn" style="width: auto; padding: 10px 30px; background: #4aff4a; color: #000; border: none; border-radius: 5px; cursor: pointer;">Закрыть</button>
            </div>
        `;
    },

    /**
     * Создает HTML меню экипировки
     * @param {Object} hero - объект героя
     * @param {Object} item - предмет для экипировки
     * @param {Array} validSlots - допустимые слоты
     * @returns {string} HTML
     */
    renderEquipMenu(hero, item, validSlots) {
        const slotsHtml = validSlots.map(slot => `
            <button class="equip-slot-btn" data-slot="${slot}" style="background: #16213e; padding: 15px; border: 2px solid #0f3460; color: white; cursor: pointer; border-radius: 5px;">
                ${slot.charAt(0).toUpperCase() + slot.slice(1)}
                ${hero.equipment[slot] ? `<br><small style="color: #ffaa00;">(занято: ${hero.equipment[slot].name})</small>` : ''}
            </button>
        `).join('');

        return `
            <h2 style="color: #e94560; margin-bottom: 20px;">Экипировка предмета</h2>
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 4rem;">${item.icon || '📦'}</div>
                <h3 style="color: #fff; margin: 10px 0;">${item.name}</h3>
                <p style="color: #aaa;">${item.description || ''}</p>
            </div>
            
            <h3 style="color: #4aff4a; margin-bottom: 10px;">Выберите слот для экипировки:</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
                ${slotsHtml}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="cancelEquipBtn" style="width: auto; padding: 10px 30px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Отмена</button>
            </div>
        `;
    }
};

window.InventoryTemplate = InventoryTemplate;