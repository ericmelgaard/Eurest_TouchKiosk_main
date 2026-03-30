"use strict";

var nutritionLabelTemplate = `
    <div class="nutrition-label-overlay">
        <div class="nutritional-lable">
            <div class="button-wrapper-NL">
                <button class="close-nutrition-label material-icons" aria-label="Close" type="button" style="background:none;border:none;cursor:pointer;" tabindex="0" role="button" onclick="removeNutritionOverlay()">close</button>
            </div>
            <div class="name-wrapper-NL">
                <div class="name-NL">{{name}}</div>
            </div>
            <div class="serving wrapper">
                <div class="name-NL">Serving Size</div>
                <div class="value">{{portion}}</div>
            </div>
            <div class="calories wrapper">
                <div class="label-NL">Amount per serving</div>
                <div class="flex-row">
                    <div class="name-NL">Calories</div>
                    <div class="value">{{calories}}</div>
                </div>
            </div>
            <div class="row">
                <div class="name-NS">Total Fat</div>
                <div class="value">{{nutrition.fat.displayValue}}</div>
            </div>
            <div class="row">
                <div class="name-NS">Total Carbohydrates</div>
                <div class="value">{{nutrition.carbohydrates.displayValue}}</div>
            </div>
            <div class="row">
                <div class="name-NS">Protein</div>
                <div class="value">{{nutrition.protein.displayValue}}</div>
            </div>
        </div>
        <div class="close"></div>
    </div>
`;

function removeNutritionOverlay() {
    $('.nutrition-label-overlay').fadeOut(200, function() {
        $(this).remove();
    });
}
