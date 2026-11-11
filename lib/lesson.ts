export type Option = { id: string; text: string };

export type Question = {
  setup?: string;
  label?: string;
  prompt: string;
  options: Option[];
  answer: string;
  idea: string;
};

export const preQuestions: Question[] = [
  {
    prompt: "A single gradient-descent step changes a parameter by",
    answer: "opposite",
    idea: "A step moves opposite the slope, and the learning rate scales that move.",
    options: [
      { id: "add-loss", text: "adding the loss to the parameter" },
      { id: "opposite", text: "moving opposite the slope, scaled by the learning rate" },
      { id: "set-lr", text: "setting the parameter equal to the learning rate" },
      { id: "divide", text: "dividing the loss by the number of steps" },
    ],
  },
  {
    prompt: "Training loss is oscillating, and each peak is higher than the last. What do you investigate first?",
    answer: "rate",
    idea: "Growing oscillation means the step is too long for the curvature. Look at the learning rate before you add parameters or epochs.",
    options: [
      { id: "params", text: "Add more parameters" },
      { id: "rate", text: "Whether the learning rate is too large for the curvature" },
      { id: "epochs", text: "Run more steps at the same learning rate" },
      { id: "accuracy", text: "Switch the loss to accuracy" },
    ],
  },
  {
    prompt: "The gradient at the current parameter is +4. The learning rate is positive. The next parameter is",
    answer: "smaller",
    idea: "A positive gradient means the loss rises as the parameter rises, so descent moves the parameter down.",
    options: [
      { id: "larger", text: "larger" },
      { id: "smaller", text: "smaller" },
      { id: "same", text: "unchanged, because this is not the minimum yet" },
      { id: "four", text: "equal to 4" },
    ],
  },
];

export const postQuestions: Question[] = [
  {
    prompt: "Which update is gradient descent?",
    answer: "subtract",
    idea: "The update is the parameter minus the learning rate times the gradient.",
    options: [
      { id: "plus-loss", text: "w + learning rate × loss" },
      { id: "subtract", text: "w − learning rate × gradient" },
      { id: "minus-lr", text: "w − learning rate" },
      { id: "grad-lr", text: "gradient − learning rate" },
    ],
  },
  {
    prompt: "The same learning rate converges on a flat bowl and diverges on a steeper bowl. What changed?",
    answer: "curvature",
    idea: "Steeper curvature makes the same learning rate a longer step. The minimum did not have to move.",
    options: [
      { id: "curvature", text: "The steeper bowl has larger curvature, so the same step overshoots" },
      { id: "moved", text: "The minimum moved, so every learning rate diverges" },
      { id: "zero", text: "Divergence means the gradient was zero" },
      { id: "sign", text: "The update must have added the gradient" },
    ],
  },
  {
    prompt: "The update is w = w + lr * grad. Loss rises smoothly, with no oscillation. What is the first fix?",
    answer: "sign",
    idea: "Adding the gradient walks up the slope. Subtract it. A wrong sign climbs smoothly. It does not have to oscillate.",
    options: [
      { id: "bigger", text: "Increase the learning rate" },
      { id: "sign", text: "Subtract the scaled gradient instead of adding it" },
      { id: "zero", text: "Start the parameter at zero" },
      { id: "loss", text: "Feed the loss back in as the gradient" },
    ],
  },
];

export const understandQuestion: Question = {
  label: "what sets the size of a step",
  prompt: "What set the direction and the size of the step you just watched?",
  answer: "slope",
  idea: "Direction is the sign of the slope. Size is the slope’s magnitude times the learning rate. The step did not jump to the minimum.",
  options: [
    { id: "slope", text: "Direction from the sign of the slope. Size from the slope’s magnitude times the learning rate." },
    { id: "zero", text: "Direction always toward zero. Size is the learning rate alone." },
    { id: "loss", text: "Direction from the loss value. Size is fixed." },
    { id: "jump", text: "It jumped to the minimum, so the slope did not matter." },
  ],
};

export const predictQuestions: Question[] = [
  {
    label: "one update from 3",
    setup:
      "Loss L(w) = w². The gradient is 2w, and it changes when w changes. Start at w = 3. Each update is w ← w − 0.1 × gradient.",
    prompt: "After one update, what is w?",
    answer: "2.4",
    idea: "The gradient at 3 is 6. Subtracting 0.1 × 6 moves w from 3 to 2.4. Treating the gradient as w, instead of 2w, gives 2.7. Adding the step gives 3.6.",
    options: [
      { id: "2.4", text: "2.4" },
      { id: "2.7", text: "2.7" },
      { id: "3.6", text: "3.6" },
      { id: "0", text: "0, the minimum" },
    ],
  },
  {
    label: "one update from 4",
    setup:
      "Same loss, L(w) = w², gradient 2w. Start at w = 4. Each update is w ← w − 0.5 × gradient.",
    prompt: "After one update, what is w?",
    answer: "0",
    idea: "The gradient at 4 is 8. Subtracting 0.5 × 8 lands on 0, the minimum. That happens because this rate equals 1 divided by the curvature of this bowl. 0.5 is not a generally safe rate. Using w as the gradient gives 2. Subtracting the loss instead of the gradient gives −4.",
    options: [
      { id: "0", text: "0" },
      { id: "2", text: "2" },
      { id: "-4", text: "−4" },
      { id: "4.5", text: "4.5" },
    ],
  },
  {
    label: "four updates from 1",
    setup:
      "Loss L(θ) = θ². The gradient is 2θ. Start at θ = 1. Each update is θ ← θ − 1.5 × gradient.",
    prompt: "After four updates, what is θ?",
    answer: "16",
    idea: "Each update multiplies θ by 1 − 2 × 1.5 = −2. From 1 the values are −2, 4, −8, 16. The sign flips and the distance doubles. Using θ as the gradient cuts the distance in half and ends at 1/16. Returning only −1.5 × gradient, and dropping the current θ, triples the distance and ends at 81. Subtracting 1.5 itself each time ends at −5.",
    options: [
      { id: "16", text: "16. The sign flips, and the distance from zero doubles each update." },
      { id: "81", text: "81. The sign flips, and the distance from zero triples each update." },
      { id: "1/16", text: "1/16. The sign flips, and the distance from zero is cut in half each update." },
      { id: "-5", text: "−5. It decreases by 1.5 on every update and does not turn around." },
    ],
  },
];

export const debugQuestions: Question[] = [
  {
    label: "the sequence 1, −2, 4, −8",
    setup: "This run uses L(w) = w². The gradient is 2w. The update subtracts the learning rate times the gradient.",
    prompt: "The parameter moves 1 → −2 → 4 → −8. What does this sequence tell you?",
    answer: "rate",
    idea: "Each update multiplies w by −2. The first step crosses the minimum, from 1 to −2. The next steps land farther away: 4, then 8. The gradient is 2w, so it is not zero, and the parameter has not settled. Averaging the loss would not flip the sign or double the distance. The rate 1.5 is past the stable range for this curvature, which is every rate below 1.",
    options: [
      { id: "rate", text: "The learning rate is too large for the curvature." },
      { id: "zero", text: "The gradient is always zero." },
      { id: "settled", text: "The model has reached its minimum." },
      { id: "averaged", text: "The loss function is being averaged." },
    ],
  },
  {
    label: "loss that climbs smoothly",
    prompt: "Loss rises smoothly, without oscillation. What is wrong?",
    answer: "sign",
    idea: "The learning rate is modest. The change in the parameter has the same sign as the gradient, so it climbs. Descent subtracts the gradient. A wrong sign grows smoothly. It does not have to oscillate.",
    options: [
      { id: "sign", text: "The update adds the gradient, so the parameter walks uphill" },
      { id: "small", text: "The learning rate is too small to move" },
      { id: "loss", text: "The gradient should be replaced by the loss" },
      { id: "nonconvex", text: "The bowl is non-convex, so descent cannot work" },
    ],
  },
];
