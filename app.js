const RecipeApp = (() => {
  // ============================================
  // DATA (extended with ingredients & steps)
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
      ingredients: [
        "Spaghetti",
        "Eggs",
        "Parmesan cheese",
        "Pancetta",
        "Black pepper",
      ],
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
      steps: ["Sear beef", "Prepare mushroom duxelles", "Wrap and bake"],
    },
    {
      id: 6,
      title: "Vegetable Stir Fry",
      time: 20,
      difficulty: "easy",
      description: "Quick stir-fried vegetables.",
      category: "vegetarian",
      ingredients: ["Mixed vegetables", "Soy sauce", "Oil"],
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

  // ============================================
  // DOM REFERENCES
  // ============================================
  const recipeContainer = document.querySelector("#recipe-container");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const sortButtons = document.querySelectorAll(".sort-btn");

  // ============================================
  // RECURSION (Steps rendering)
  // ============================================
  const renderSteps = (steps, level = 0) => {
    const listClass = level === 0 ? "steps-list" : "substeps-list";
    let html = `<ol class="${listClass}">`;

    steps.forEach((step) => {
      if (typeof step === "string") {
        html += `<li>${step}</li>`;
      } else {
        html += `<li>${step.text}`;
        if (step.substeps) {
          html += renderSteps(step.substeps, level + 1); // recursion
        }
        html += `</li>`;
      }
    });

    html += `</ol>`;
    return html;
  };

  const createStepsHTML = (steps) => {
    if (!steps || steps.length === 0) {
      return "<p>No steps available</p>";
    }
    return renderSteps(steps);
  };

  // ============================================
  // CARD TEMPLATE
  // ============================================
  const createRecipeCard = (recipe) => `
    <div class="recipe-card" data-id="${recipe.id}">
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
        ${createStepsHTML(recipe.steps)}
      </div>

      <div class="ingredients-container" data-id="${recipe.id}">
        <ul>
          ${recipe.ingredients.map((i) => `<li>${i}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  const renderRecipes = (list) => {
    recipeContainer.innerHTML = list.map(createRecipeCard).join("");
  };

  // ============================================
  // FILTER & SORT (from Part 2)
  // ============================================
  const filterByDifficulty = (list, diff) =>
    list.filter((r) => r.difficulty === diff);

  const filterByTime = (list, max) => list.filter((r) => r.time <= max);

  const applyFilter = (list) => {
    switch (currentFilter) {
      case "easy":
        return filterByDifficulty(list, "easy");
      case "medium":
        return filterByDifficulty(list, "medium");
      case "hard":
        return filterByDifficulty(list, "hard");
      case "quick":
        return filterByTime(list, 30);
      default:
        return list;
    }
  };

  const sortByName = (list) =>
    [...list].sort((a, b) => a.title.localeCompare(b.title));

  const sortByTime = (list) => [...list].sort((a, b) => a.time - b.time);

  const applySort = (list) => {
    switch (currentSort) {
      case "name":
        return sortByName(list);
      case "time":
        return sortByTime(list);
      default:
        return list;
    }
  };

  const updateDisplay = () => {
    let result = recipes;
    result = applyFilter(result);
    result = applySort(result);
    renderRecipes(result);
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleFilterClick = (e) => {
    currentFilter = e.target.dataset.filter;
    updateActiveButtons();
    updateDisplay();
  };

  const handleSortClick = (e) => {
    currentSort = e.target.dataset.sort;
    updateActiveButtons();
    updateDisplay();
  };

  const handleToggleClick = (e) => {
    if (!e.target.classList.contains("toggle-btn")) return;

    const id = e.target.dataset.id;
    const type = e.target.dataset.toggle;

    const container = document.querySelector(
      `.${type}-container[data-id="${id}"]`,
    );

    container.classList.toggle("visible");

    e.target.textContent = container.classList.contains("visible")
      ? `Hide ${type}`
      : `Show ${type}`;
  };

  const updateActiveButtons = () => {
    filterButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.filter === currentFilter),
    );
    sortButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.sort === currentSort),
    );
  };

  const setupEventListeners = () => {
    filterButtons.forEach((btn) =>
      btn.addEventListener("click", handleFilterClick),
    );
    sortButtons.forEach((btn) =>
      btn.addEventListener("click", handleSortClick),
    );
    recipeContainer.addEventListener("click", handleToggleClick);
  };

  // ============================================
  // INIT
  // ============================================
  const init = () => {
    setupEventListeners();
    updateDisplay();
    console.log("RecipeApp initialized");
  };

  return { init };
})();

RecipeApp.init();
