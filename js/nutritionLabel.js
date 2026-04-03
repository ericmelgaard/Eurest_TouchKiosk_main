"use strict";

function openNutritionModal(itemData) {
    const modal = $('#item-modal');

    console.log('Opening nutrition modal with data:', itemData);
    console.log('Nutrients array:', itemData.nutrients);

    const nutrients = itemData.nutrients || [];

    // Create a map of nutrients by name for easier access
    const nutrientMap = {};
    nutrients.forEach(nutrient => {
        if (nutrient.name) {
            nutrientMap[nutrient.name.toLowerCase()] = nutrient;
        }
    });

    // Debug: Log all available nutrient names
    console.log('Available nutrients:', Object.keys(nutrientMap));

    const getNutrientByName = (name) => {
        const nutrient = nutrientMap[name.toLowerCase()];
        return nutrient || null;
    };

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

    const calories = getNutrientByName('Calories');
    console.log('Calories nutrient:', calories);
    $('#nutrition-calories').text(calories && calories.value ? calories.value : '0');

    const totalFat = getNutrientByName('Fat (g)');
    console.log('Total Fat nutrient:', totalFat);
    const totalFatValue = totalFat && totalFat.value && totalFat.value !== '-' ? totalFat.value : '0';
    const totalFatDV = totalFat && totalFat.dailyValuePercentage ? totalFat.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-fat').text(totalFatValue);
    $('#nutrition-fat-dv').text(totalFatDV);

    const satFat = getNutrientByName('Saturated Fat (g)');
    const satFatValue = satFat && satFat.value && satFat.value !== '-' ? satFat.value : '0';
    const satFatDV = satFat && satFat.dailyValuePercentage ? satFat.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-sat-fat').text(satFatValue);
    $('#nutrition-sat-fat-dv').text(satFatDV);

    const transFat = getNutrientByName('Trans Fat (g)');
    const transFatValue = transFat && transFat.value && transFat.value !== '-' ? transFat.value : '0';
    $('#nutrition-trans-fat').text(transFatValue);

    const cholesterol = getNutrientByName('Cholesterol (mg)');
    const cholesterolValue = cholesterol && cholesterol.value && cholesterol.value !== '-' ? cholesterol.value : '0';
    const cholesterolDV = cholesterol && cholesterol.dailyValuePercentage ? cholesterol.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-cholesterol').text(cholesterolValue);
    $('#nutrition-cholesterol-dv').text(cholesterolDV);

    const sodium = getNutrientByName('Sodium (mg)');
    const sodiumValue = sodium && sodium.value && sodium.value !== '-' ? sodium.value : '0';
    const sodiumDV = sodium && sodium.dailyValuePercentage ? sodium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-sodium').text(sodiumValue);
    $('#nutrition-sodium-dv').text(sodiumDV);

    const carbs = getNutrientByName('Carbohydrate (g)');
    const carbsValue = carbs && carbs.value && carbs.value !== '-' ? carbs.value : '0';
    const carbsDV = carbs && carbs.dailyValuePercentage ? carbs.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-carbs').text(carbsValue);
    $('#nutrition-carbs-dv').text(carbsDV);

    const fiber = getNutrientByName('Dietary Fiber (g)');
    const fiberValue = fiber && fiber.value && fiber.value !== '-' ? fiber.value : '0';
    const fiberDV = fiber && fiber.dailyValuePercentage ? fiber.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-fiber').text(fiberValue);
    $('#nutrition-fiber-dv').text(fiberDV);

    const sugars = getNutrientByName('Sugars (g)');
    const sugarsValue = sugars && sugars.value && sugars.value !== '-' ? sugars.value : '0';
    $('#nutrition-sugars').text(sugarsValue);

    const protein = getNutrientByName('Protein (g)');
    const proteinValue = protein && protein.value && protein.value !== '-' ? protein.value : '0';
    $('#nutrition-protein').text(proteinValue);

    const vitaminD = getNutrientByName('Vitamin D (mcg)');
    const vitaminDValue = vitaminD && vitaminD.value && vitaminD.value !== '-' ? vitaminD.value : '0';
    const vitaminDDV = vitaminD && vitaminD.dailyValuePercentage ? vitaminD.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-vitamin-d').text(vitaminDValue);
    $('#nutrition-vitamin-d-dv').text(vitaminDDV);

    const calcium = getNutrientByName('Calcium (mg)');
    const calciumValue = calcium && calcium.value && calcium.value !== '-' ? calcium.value : '0';
    const calciumDV = calcium && calcium.dailyValuePercentage ? calcium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-calcium').text(calciumValue);
    $('#nutrition-calcium-dv').text(calciumDV);

    const iron = getNutrientByName('Iron (mg)');
    const ironValue = iron && iron.value && iron.value !== '-' ? iron.value : '0';
    const ironDV = iron && iron.dailyValuePercentage ? iron.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-iron').text(ironValue);
    $('#nutrition-iron-dv').text(ironDV);

    const potassium = getNutrientByName('Potassium (mg)');
    const potassiumValue = potassium && potassium.value && potassium.value !== '-' ? potassium.value : '0';
    const potassiumDV = potassium && potassium.dailyValuePercentage ? potassium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-potassium').text(potassiumValue);
    $('#nutrition-potassium-dv').text(potassiumDV);

    // Handle optional nutrients - only show if available
    const optionalNutrients = [
        { names: ['Vitamin A (IU)', 'Vitamin A (RE)', 'Vitamin A'], id: 'vitamin-a' },
        { names: ['Vitamin C (mg)', 'Vitamin C'], id: 'vitamin-c' },
        { names: ['Added Sugars (g)', 'Added Sugars'], id: 'added-sugars' }
    ];

    optionalNutrients.forEach(opt => {
        let nutrient = null;
        for (let name of opt.names) {
            nutrient = getNutrientByName(name);
            if (nutrient) break;
        }

        const rowId = `#nutrition-${opt.id}-row`;
        const dividerId = `#nutrition-${opt.id}-divider`;

        if (nutrient && nutrient.value && nutrient.value !== '-' && nutrient.value !== '0') {
            const value = nutrient.value;
            const dv = nutrient.dailyValuePercentage ? nutrient.dailyValuePercentage.replace('%', '') : '0';
            const unit = nutrient.unit || '';

            $(`#nutrition-${opt.id}`).text(value);
            $(`#nutrition-${opt.id}-dv`).text(dv);
            $(`#nutrition-${opt.id}-unit`).text(unit);
            $(dividerId).show();
            $(rowId).show();
        } else {
            $(dividerId).hide();
            $(rowId).hide();
        }
    });

    modal.removeAttr('hidden').fadeIn(300);

    if (typeof InactivityManager !== 'undefined') {
        InactivityManager.extendForNutrition();
    }
}

function closeNutritionModal() {
    $('#item-modal').fadeOut(300, function() {
        $(this).attr('hidden', true);
    });

    if (typeof InactivityManager !== 'undefined') {
        InactivityManager.reset();
    }
}

$(document).ready(function() {
    // Ensure modal starts hidden
    $('#item-modal').attr('hidden', true).hide();

    $('#modal-close').on('click', closeNutritionModal);
    $('#item-modal .modal-overlay').on('click', closeNutritionModal);

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && !$('#item-modal').attr('hidden')) {
            closeNutritionModal();
        }
    });
});
