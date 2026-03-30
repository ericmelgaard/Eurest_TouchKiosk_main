"use strict";

var nutritionLabelTemplate = `
    <div class="nutrition-label-overlay">
        <div class="nutrition-label-backdrop"></div>
        <div class="nutrition-label">
            <button class="close-nutrition-label material-icons" aria-label="Close">close</button>

            <div class="nutrition-header">
                <div class="nutrition-title-row">
                    <h2 class="nutrition-item-name">{{{name}}}</h2>
                    <span class="nutrition-price">{{price}}</span>
                </div>
                <div class="nutrition-meta-row">
                    <span class="nutrition-calories-badge">{{calories}} calories</span>
                    <span class="nutrition-serving">{{portion}}</span>
                </div>
                {{#icons}}
                <div class="nutrition-icons">
                    {{#icons}}
                    <img src="{{fileName}}" alt="{{name}}" class="nutrition-diet-icon" />
                    {{/icons}}
                </div>
                {{/icons}}
            </div>

            <div class="nutrition-facts-container">
                <div class="nutrition-facts-header">
                    <h3>Nutrition Facts</h3>
                    <div class="serving-size-line">Serving Size {{portion}}</div>
                </div>

                <div class="nutrition-facts-body">
                    <div class="nutrition-calories-row">
                        <span class="calories-label">Calories</span>
                        <span class="calories-value">{{calories}}</span>
                    </div>

                    <div class="nutrition-daily-value-header">% Daily Value*</div>

                    <div class="nutrition-row main-nutrient">
                        <span class="nutrient-name"><strong>Total Fat</strong> {{nutrition.fat.displayValue}}</span>
                        <span class="daily-value">{{nutrition.fat.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row sub-nutrient">
                        <span class="nutrient-name">Saturated Fat {{nutrition.saturatedFat.displayValue}}</span>
                        <span class="daily-value">{{nutrition.saturatedFat.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row sub-nutrient">
                        <span class="nutrient-name"><em>Trans Fat</em> {{nutrition.transFat.displayValue}}</span>
                        <span class="daily-value"></span>
                    </div>

                    <div class="nutrition-row main-nutrient">
                        <span class="nutrient-name"><strong>Sodium</strong> {{nutrition.sodium.displayValue}}</span>
                        <span class="daily-value">{{nutrition.sodium.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row main-nutrient">
                        <span class="nutrient-name"><strong>Total Carbohydrate</strong> {{nutrition.carbohydrates.displayValue}}</span>
                        <span class="daily-value">{{nutrition.carbohydrates.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row sub-nutrient">
                        <span class="nutrient-name">Dietary Fiber {{nutrition.dietaryFiber.displayValue}}</span>
                        <span class="daily-value">{{nutrition.dietaryFiber.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row main-nutrient">
                        <span class="nutrient-name"><strong>Protein</strong> {{nutrition.protein.displayValue}}</span>
                        <span class="daily-value"></span>
                    </div>

                    <div class="nutrition-divider"></div>

                    <div class="nutrition-row vitamin">
                        <span class="nutrient-name">Calcium {{nutrition.calcium.displayValue}}</span>
                        <span class="daily-value">{{nutrition.calcium.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row vitamin">
                        <span class="nutrient-name">Iron {{nutrition.iron.displayValue}}</span>
                        <span class="daily-value">{{nutrition.iron.percentDailyValue}}%</span>
                    </div>

                    <div class="nutrition-row vitamin">
                        <span class="nutrient-name">Vitamin D {{nutrition.vitaminD.displayValue}}</span>
                        <span class="daily-value">{{nutrition.vitaminD.percentDailyValue}}%</span>
                    </div>
                </div>

                <div class="nutrition-footnote">
                    * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
                </div>
            </div>

            {{#ingredients}}
            <div class="nutrition-section">
                <h4>Ingredients</h4>
                <p class="ingredients-text">{{ingredients}}</p>
            </div>
            {{/ingredients}}

            {{#allergens}}
            <div class="nutrition-section allergens-section">
                <h4>Allergens</h4>
                <p class="allergens-text">{{allergens}}</p>
            </div>
            {{/allergens}}
        </div>
    </div>
`;

function removeNutritionOverlay() {
    $('.nutrition-label-overlay').fadeOut(200, function() {
        $(this).remove();
    });
}
