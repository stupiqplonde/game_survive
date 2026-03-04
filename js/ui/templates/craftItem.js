const CraftItemTemplate = {
    renderMaterials(materials) {
        return `
            <div class="materials-display" style="background: #16213e; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: flex; gap: 20px; justify-content: center;">
                <div> 🌲 Древесина: <span id="materialWood">${materials.wood}</span></div>
                <div> ⛓️ Железо: <span id="materialIron">${materials.iron}</span></div>
                <div> 🌯 Ткань: <span id="materialCloth">${materials.cloth}</span></div>
            </div>
        `;
    },

    renderRecipe(recipe, canCraft) {
        const materialsList = recipe.materials.map(m =>
            `${m.itemId === 'material_wood' ? '🌲' : m.itemId === 'material_iron' ? '⛓️' : '🌯'} ${m.quantity}`
        ).join(' + ');

        return `
            <div style="font-size: 2rem;">${recipe.resultItem.icon}</div>
            <h4>${recipe.name}</h4>
            <p>${recipe.resultItem.description || 'Нет описания'}</p>
            <p class="craft-materials">Требуется: ${materialsList}</p>
            <p class="craft-level">Требуемый уровень: ${recipe.requiredLevel}</p>
            <button class="craft-item-btn" data-recipe-id="${recipe.id}" ${!canCraft.success ? 'disabled' : ''}>
                ${canCraft.success ? 'Скрафтить' : canCraft.message}
            </button>
        `;
    }
};

window.CraftItemTemplate = CraftItemTemplate;