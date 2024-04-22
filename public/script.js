const recipes = {
  Taiwan: {
    name: "Braised Pork Belly (焢肉 Kong Rou)",
    ingredients: [
      "Cubed pork belly: 1 lb",
      "Garlic: around 4 pieces",
      "Sugar: 1 Spoon",
      "Green Onion: 2 pieces",
      "Soy Sauce: half a bowl",
      "Water: 3 bowls",
    ],
    steps: [
      "Medium Heat, Fry the pork belly to golden brown (skin first), set it aside",
      "Medium Heat, Fry the garlic and green onions to golden brown, set them aside",
      "Low Heat, heat sugar until it turns golden, add in the meat, soy sauce, water",
      "Low Heat, cook until the water almost all evaporates (almost dry)",
      "Plate and serve!",
    ],
  },
  India: {
    name: "Sweet Rice Pudding (Kheer)",
    ingredients: [
      "Milk: 1 liter",
      "Rice: 1 Tsp",
      "Sugar: 2 Tsp",
      "Saffron: 6-7 strands",
    ],
    steps: [
      "Wash and soak rice in water.",
      "Soak saffron in one Tsp milk.",
      "Put milk on to boil. Once it boils, add soaked rice",
      "Let it cook on low heat for 45 mins. Keep stirring occasionally",
      "The milk will thicken up",
      "Add saffron and sugar.",
      "Enjoy!",
    ],
  },
  Korea: {
    name: "Kimchi Pancake (김치 전 Kimchi Jeon)",
    ingredients: [
      "Kimchi: 1 cup",
      "Kimchi Juice: ⅓ cup",
      "Minced Garlic: ½ spoon",
      "Frying Mix: 1 cup",
      "Water: ⅔ cup",
    ],
    steps: [
      "Slice kimchi into small pieces and place into a bowl",
      "Add the frying mix, kimchi juice, and garlic to the bowl",
      "Pour in the water slowly and mix until the dough is fully combined",
      "Spoon mixture into hot oiled pan and fry on both sides until golden",
      "Serve on a plate and enjoy!",
    ],
  },
  CentralEurope: {
    name: "Sweet Noodle Kugel (לאָקשן קוגל Lokshen Kugel)",
    ingredients: [
      "4 eggs medium",
      "1/2 cup granulated sugar",
      "1 cup cottage cheese",
      "2 cups heavy cream",
      "2 cups wide noodles uncooked",
      "1 stick of butter melted",
      "2/3 cup raisins",
      "2 tsp vanilla extract",
      "1 tsp salt",
      "6 butter cookies",
    ],
    steps: [
      "Cook wide noodles as indicated on the package.",
      "Mix/beat together eggs with sugar.",
      "Mix in cottage cheese, heavy cream, melted butter, vanilla, salt and raisins.",
      "Pour drained noodles over the egg mixture.",
      "Grease a baking dish then pour the noodle mix into the dish.",
      "Mix crumbled cookies with butter then sprinkle over the noodles.",
      "Bake in the oven (350°F) until the top is golden brown, approximately an hour.",
      "Serve warm or from the fridge.",
    ],
  },
};

let currentRecipe = recipes.Taiwan; 
let userAsking = true;
let term;

// ---------- TERMINAL ---------- //
// ---------- TERMINAL ---------- //
// ---------- TERMINAL ---------- //
// ---------- TERMINAL ---------- //
// ---------- TERMINAL ---------- //

$(document).ready(function() {
  term = $('#commandDiv').terminal(function(command) {
    if (command !== '') {
      try {
        var result = window.eval(command);
        if (result !== undefined) {
          this.echo(new String(result));
        }
      } catch (e) {
        this.error(new String(e));
      }
    }
  }, {
    greetings: `Today's Recipe: ${currentRecipe.name}\n\nStarting the cooking steps:\n`,
    prompt: ' '
  });

  // showIngredients(currentRecipe, term);
  askStep(currentRecipe, term, 0);
});

// ---------- FUNCTIONS ---------- //
// ---------- FUNCTIONS ---------- //
// ---------- FUNCTIONS ---------- //
// ---------- FUNCTIONS ---------- //
// ---------- FUNCTIONS ---------- //

function showIngredients(currentRecipe, terminal) {
  currentRecipe.ingredients.forEach((ingredient, index) => {
    terminal.echo(`${index + 1}. ${ingredient}`);
  });
  terminal.echo(""); 
}

function askStep(currentRecipe, terminal, stepIndex) {
  if (stepIndex < currentRecipe.steps.length) {
    const currentStep = currentRecipe.steps[stepIndex];
    terminal.echo(`\nStep ${stepIndex + 1}: ${currentStep}`);
    terminal.push(function(command) {
      if (command.match(/no|n/i)) {
        terminal.echo(`\nIf you have any question, ask away!`);
        terminal.push(function(userInput) {
          requestAI(currentRecipe.name, currentStep, userInput).then(aiResponse => {
            terminal.echo(`\nGrandma:\n   ${aiResponse}`);
            terminal.pop(); 
          });
        }, {
          prompt: '   '
        });
      } else if (command.match(/yes|y/i)) {
        terminal.pop();
        askStep(currentRecipe, terminal, stepIndex + 1); // Move to the next step
      } else {
        terminal.echo("\nPlease answer 'yes' or 'no'.");
      }
    }, {
      prompt: '\nDo you want to move to next step? (y/n) ',
      greetings: ""
    });
  } else {
    terminal.echo("\nYou've completed all the steps of the recipe!");
    terminal.pop(); 
  }
}

// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //

async function requestAI(dish, currentStep, userQues) {
  const prompt = evaluationPrompt(dish, currentStep, userQues);
  const response = await fetch('/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: prompt })
  });

  if (response.ok) {
    const jsonData = await response.json();
    return jsonData.ai;
  } else {
    console.error("Error in submitting data.");
    return "Error in submitting data.";
  }
}

function evaluationPrompt(dish, currentStep, userQues) {
  return `
    You are a grandma assisting your grandchild in cooking. 
    Speak in a calm, warm, and caring manner.

    The current recipe is: ${dish}
    The current step is: ${currentStep}

    Your grandkid's question about this recipe is: ${userQues}
    
    Please provide short, concise, and simple guidance or clarification.
  `;
}

// ---------- BUTTON ---------- //
// ---------- BUTTON ---------- //
// ---------- BUTTON ---------- //
// ---------- BUTTON ---------- //
// ---------- BUTTON ---------- //

function sendInput() {
  var input = document.getElementById("user_input").value; // Get user input
  // term.echo(`\nYou:`)
  term.exec(input);  // Execute the input as a terminal command
  document.getElementById("user_input").value = ''; // Clear input 
}

function checkEnterKey(event) {
  if (event.keyCode === 13) { 
      sendInput();  
  }
}