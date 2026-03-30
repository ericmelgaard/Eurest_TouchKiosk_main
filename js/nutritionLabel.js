"use strict";

function openNutritionModal(itemData) {
    const modal = $('#item-modal');
    const nutrition = itemData.nutrition || {};

    $('#modal-title').text(itemData.name || '');
    $('#modal-price').text(itemData.price || '');
    $('#modal-calories').text(itemData.calories ? `${itemData.calories} cal` : '');
    $('#modal-serving').text(itemData.portion || '');

    if (itemData.icons && itemData.icons.length > 0) {
        const iconsHtml = itemData.icons.map(icon =>
            `<img src="${icon.fileName}" alt="${icon.name}" class="diet-icon" />`
        ).join('');
        $('#modal-icons').html(iconsHtml).show();
    } else {
        $('#modal-icons').hide();
    }

    $('#modal-description').text(itemData.description || '').toggle(!!itemData.description);
    $('#modal-ingredients').text(itemData.ingredients || 'Not available');

    if (itemData.allergens) {
        $('#modal-allergens').text(itemData.allergens);
        $('#allergens-section').show();
    } else {
        $('#allergens-section').hide();
    }

    $('#nutrition-serving').text(itemData.portion || '');
    $('#nutrition-calories').text(itemData.calories || '0');

    $('#nutrition-fat').text(nutrition.fat?.value || '0');
    $('#nutrition-fat-dv').text(nutrition.fat?.percentDailyValue || '0');

    $('#nutrition-sat-fat').text(nutrition.saturatedFat?.value || '0');
    $('#nutrition-sat-fat-dv').text(nutrition.saturatedFat?.percentDailyValue || '0');

    $('#nutrition-trans-fat').text(nutrition.transFat?.value || '0');

    $('#nutrition-cholesterol').text(nutrition.cholesterol?.value || '0');
    $('#nutrition-cholesterol-dv').text(nutrition.cholesterol?.percentDailyValue || '0');

    $('#nutrition-sodium').text(nutrition.sodium?.value || '0');
    $('#nutrition-sodium-dv').text(nutrition.sodium?.percentDailyValue || '0');

    $('#nutrition-carbs').text(nutrition.carbohydrates?.value || '0');
    $('#nutrition-carbs-dv').text(nutrition.carbohydrates?.percentDailyValue || '0');

    $('#nutrition-fiber').text(nutrition.dietaryFiber?.value || '0');
    $('#nutrition-fiber-dv').text(nutrition.dietaryFiber?.percentDailyValue || '0');

    $('#nutrition-sugars').text(nutrition.sugars?.value || '0');

    $('#nutrition-protein').text(nutrition.protein?.value || '0');

    $('#nutrition-vitamin-d').text(nutrition.vitaminD?.value || '0');
    $('#nutrition-vitamin-d-dv').text(nutrition.vitaminD?.percentDailyValue || '0');

    $('#nutrition-calcium').text(nutrition.calcium?.value || '0');
    $('#nutrition-calcium-dv').text(nutrition.calcium?.percentDailyValue || '0');

    $('#nutrition-iron').text(nutrition.iron?.value || '0');
    $('#nutrition-iron-dv').text(nutrition.iron?.percentDailyValue || '0');

    $('#nutrition-potassium').text(nutrition.potassium?.value || '0');
    $('#nutrition-potassium-dv').text(nutrition.potassium?.percentDailyValue || '0');

    modal.removeAttr('hidden').fadeIn(300);
}

function closeNutritionModal() {
    $('#item-modal').fadeOut(300, function() {
        $(this).attr('hidden', true);
    });
}

$(document).ready(function() {
    $('#modal-close').on('click', closeNutritionModal);
    $('.modal-overlay').on('click', closeNutritionModal);

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && !$('#item-modal').attr('hidden')) {
            closeNutritionModal();
        }
    });
});
