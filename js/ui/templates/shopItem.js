// js/ui/templates/shopItem.js
// Шаблон предмета магазина

const ShopItemTemplate = {
    /**
     * Создает HTML карточки товара
     * @param {Object} item - предмет
     * @returns {string} HTML
     */
    render(item) {
        let rarityColor = '#ffffff';
        if (item.rarity === 'rare') rarityColor = '#4caaff';
        if (item.rarity === 'epic') rarityColor = '#aa4cff';
        if (item.rarity === 'legendary') rarityColor = '#ffaa4c';

        return `
            <div style="font-size: 3rem;">${item.icon}</div>
            <h3 style="color: ${rarityColor};">${item.name}</h3>
            <p class="item-type">${item.type}</p>
            <p class="item-description">${item.description || 'Нет описания'}</p>
            <p class="item-price">💰 ${item.getPrice()} провизии</p>
            <p class="item-rarity" style="color: ${rarityColor};">${item.rarity}</p>
            <button class="buy-item-btn" data-item-id="${item.id}">Купить</button>
        `;
    },

    /**
     * Создает HTML информации о магазине
     * @param {number} timeLeft - время до обновления
     * @returns {string} HTML
     */
    renderShopInfo(timeLeft) {
        return `
            <div class="shop-info" style="margin-top: 20px; text-align: center;">
                <p>🔄 Ассортимент обновится через: <span id="shopTimer">${timeLeft}</span>с</p>
            </div>
        `;
    }
};

window.ShopItemTemplate = ShopItemTemplate;