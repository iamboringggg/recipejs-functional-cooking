const RecipeApp = (() => {
  "use strict";

  // ============================================
  // DATA
  // ============================================
  const recipes = [
    {
      id: 1,
      title: "Classic Spaghetti Carbonara",
      time: 25,
      difficulty: "easy",
      description:
        "A creamy Italian pasta dish made with eggs, cheese, pancetta, and black pepper.",
      category: "pasta",
      ingredients: ["Spaghetti", "Eggs", "Parmesan", "Pancetta", "Pepper"],
      steps: [
        "Boil pasta",
        {
          text: "Prepare sauce",
          substeps: ["Beat eggs", "Add cheese", "Mix well"],
        },
        "Combine pasta and sauce",
        "Serve hot",
      ],
    },
    {
      id: 2,
      title: "Chicken Tikka Masala",
      time: 45,
      difficulty: "medium",
      description: "Tender chicken pieces in a creamy, spiced tomato sauce.",
      category: "curry",
      ingredients: ["Chicken", "Yogurt", "Tomatoes", "Spices"],
      steps: [
        "Marinate chicken",
        {
          text: "Prepare gravy",
          substeps: ["Heat oil", "Add spices", "Add tomatoes"],
        },
        "Add chicken",
        "Simmer and serve",
      ],
    },
    {
      id: 3,
      title: "Homemade Croissants",
      time: 180,
      difficulty: "hard",
      description: "Buttery, flaky French pastries.",
      category: "baking",
      ingredients: ["Flour", "Butter", "Yeast", "Milk", "Sugar"],
      steps: [
        "Prepare dough",
        {
          text: "Laminate dough",
          substeps: [
            "Roll dough",
            "Fold butter",
            {
              text: "Repeat folding",
              substeps: ["Fold once", "Chill", "Fold again"],
            },
          ],
        },
        "Bake croissants",
      ],
    },
    {
      id: 4,
      title: "Greek Salad",
      time: 15,
      difficulty: "easy",
      description: "Fresh vegetables with feta and olives.",
      category: "salad",
      ingredients: ["Tomatoes", "Cucumber", "Olives", "Feta", "Olive oil"],
      steps: ["Chop vegetables", "Mix ingredients", "Serve fresh"],
    },
    {
      id: 5,
      title: "Beef Wellington",
      time: 120,
      difficulty: "hard",
      description: "Beef fillet wrapped in puff pastry.",
      category: "meat",
      ingredients: ["Beef", "Mushrooms", "Puff pastry", "Eggs"],
      steps: ["Sear beef", "Prepare duxelles", "Wrap and bake"],
    },
    {
      id: 6,
      title: "Vegetable Stir Fry",
      time: 20,
      difficulty: "easy",
      description: "Quick stir-fried vegetables.",
      category: "vegetarian",
      ingredients: ["Vegetables", "Soy sauce", "Oil"],
      steps: ["Heat oil", "Add vegetables", "Stir fry and serve"],
    },
    {
      id: 7,
      title: "Pad Thai",
      time: 30,
      difficulty: "medium",
      description: "Thai stir-fried rice noodles.",
      category: "noodles",
      ingredients: ["Rice noodles", "Shrimp", "Peanuts", "Sauce"],
      steps: ["Soak noodles", "Cook shrimp", "Mix everything"],
    },
    {
      id: 8,
      title: "Margherita Pizza",
      time: 60,
      difficulty: "medium",
      description: "Classic Italian pizza.",
      category: "pizza",
      ingredients: ["Dough", "Tomato sauce", "Mozzarella", "Basil"],
      steps: ["Prepare dough", "Add toppings", "Bake pizza"],
    },
  ];

  // ============================================
  // STATE
  // ============================================
  let currentFilter = "all";
  let currentSort = "none";
  let searchQuery = "";
  let favorites = JSON.parse(localStorage.getItem("recipeFavorites")) || [];
  let debounceTimer;

  // ============================================
  // DOM REFERENCES
  // ============================================
  const recipeContainer = document.querySelector("#recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortButtons = document.querySelectorAll(".sort-btn");
  const searchInput = document.querySelector("#search-input");
  const clearSearchBtn = document.querySelector("#clear-search");
  const recipeCountDisplay = document.querySelector("#recipe-count");

  // ============================================
  // RECURSION (Steps)
  // ============================================
  const renderSteps = (steps, level = 0) => {
    const cls = level === 0 ? "steps-list" : "substeps-list";
    let html = `<ol class="${cls}">`;

    steps.forEach((step) => {
      if (typeof step === "string") {
        html += `<li>${step}</li>`;
      } else {
        html += `<li>${step.text}`;
        if (step.substeps) {
          html += renderSteps(step.substeps, level + 1);
        }
        html += `</li>`;
      }
    });

    return html + "</ol>";
  };

  // ============================================
  // CARD TEMPLATE
  // ============================================
  const createRecipeCard = (recipe) => {
    const isFav = favorites.includes(recipe.id);
    return `
      <div class="recipe-card" data-id="${recipe.id}">
        <button class="favorite-btn" data-id="${recipe.id}">
          ${isFav ? "❤️" : "🤍"}
        </button>

        <h3>${recipe.title}</h3>

        <div class="recipe-meta">
          <span>⏱️ ${recipe.time} min</span>
          <span class="difficulty ${recipe.difficulty}">
            ${recipe.difficulty}
          </span>
        </div>

        <p>${recipe.description}</p>

        <button class="toggle-btn" data-toggle="steps" data-id="${recipe.id}">
          📋 Show Steps
        </button>
        <button class="toggle-btn" data-toggle="ingredients" data-id="${recipe.id}">
          🥗 Show Ingredients
        </button>

        <div class="steps-container" data-id="${recipe.id}">
          ${renderSteps(recipe.steps)}
        </div>

        <div class="ingredients-container" data-id="${recipe.id}">
          <ul>${recipe.ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  };

  const renderRecipes = (list) => {
    recipeContainer.innerHTML = list.map(createRecipeCard).join("");
  };

  // ============================================
  // FILTERS
  // ============================================
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q)),
    );
  };

  const filterFavorites = (list) =>
    list.filter((r) => favorites.includes(r.id));

  const applyFilter = (list) => {
    switch (currentFilter) {
      case "easy":
        return list.filter((r) => r.difficulty === "easy");
      case "medium":
        return list.filter((r) => r.difficulty === "medium");
      case "hard":
        return list.filter((r) => r.difficulty === "hard");
      case "quick":
        return list.filter((r) => r.time <= 30);
      case "favorites":
        return filterFavorites(list);
      default:
        return list;
    }
  };

  // ============================================
  // SORTS
  // ============================================
  const applySort = (list) => {
    switch (currentSort) {
      case "name":
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case "time":
        return [...list].sort((a, b) => a.time - b.time);
      default:
        return list;
    }
  };

  // ============================================
  // DISPLAY
  // ============================================
  const updateDisplay = () => {
    let result = recipes;
    result = filterBySearch(result);
    result = applyFilter(result);
    result = applySort(result);

    renderRecipes(result);

    if (recipeCountDisplay) {
      recipeCountDisplay.textContent = `Showing ${result.length} of ${recipes.length} recipes`;
    }
  };

  // ============================================
  // FAVORITES
  // ============================================
  const toggleFavorite = (id) => {
    id = Number(id);
    favorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    localStorage.setItem("recipeFavorites", JSON.stringify(favorites));
    updateDisplay();
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleToggleClick = (e) => {
    if (e.target.classList.contains("toggle-btn")) {
      const id = e.target.dataset.id;
      const type = e.target.dataset.toggle;
      const box = document.querySelector(`.${type}-container[data-id="${id}"]`);
      box.classList.toggle("visible");
    }

    if (e.target.classList.contains("favorite-btn")) {
      toggleFavorite(e.target.dataset.id);
    }
  };

  const handleSearch = (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value;
      updateDisplay();
    }, 300);

    clearSearchBtn.style.display = e.target.value ? "block" : "none";
  };

  const clearSearch = () => {
    searchQuery = "";
    searchInput.value = "";
    clearSearchBtn.style.display = "none";
    updateDisplay();
  };

  // ============================================
  // INIT
  // ============================================
  const init = () => {
    filterButtons.forEach((b) =>
      b.addEventListener("click", (e) => {
        currentFilter = e.target.dataset.filter;
        updateDisplay();
      }),
    );

    sortButtons.forEach((b) =>
      b.addEventListener("click", (e) => {
        currentSort = e.target.dataset.sort;
        updateDisplay();
      }),
    );

    recipeContainer.addEventListener("click", handleToggleClick);

    if (searchInput) searchInput.addEventListener("input", handleSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener("click", clearSearch);

    updateDisplay();
    console.log("🍳 RecipeApp ready!");
  };

  return { init };
})();

RecipeApp.init();
