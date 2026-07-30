/**
 * AZ Off Script Transition Library — "How do clips connect?"
 *
 * A transition is the action that connects one person's video to the
 * next person's video. It is the moment where one creator leaves the
 * screen and another creator enters.
 *
 * Written for someone who says: "I don't know what a transition is.
 * Just tell me what to do."
 *
 * No fancy words. Just clear steps.
 */

export type TransitionDifficulty = "Easy" | "Medium" | "Advanced";

export type TransitionCategory =
  | "Object Transitions"
  | "Body Movement"
  | "Acting Transitions"
  | "Environment Transitions"
  | "Camera Interaction"
  | "Brand Transitions";

export interface TransitionStep {
  step: string;
}

export interface Transition {
  id: string;
  name: string;
  category: TransitionCategory;
  /** Simple one-line description for someone who doesn't know what a transition is */
  simpleDescription: string;
  /** What the viewer sees when it's done right */
  whatViewersSee: string;
  /** Example of how it flows from person 1 to person 2 */
  example: string;
  /** Steps for the first person (the one ending their clip) */
  firstPersonSteps: string[];
  /** Steps for the next person (the one starting their clip) */
  nextPersonSteps: string[];
  /** How hard is this to pull off? */
  difficulty: TransitionDifficulty;
  /** What content types this transition works best with */
  worksBestWith: string[];
  /** What you need to do this transition (props, people, setup) */
  needs: string[];
  /** Optional: suggested objects to use */
  suggestedObjects?: string[];
}

export const TRANSITION_CATEGORIES: TransitionCategory[] = [
  "Object Transitions",
  "Body Movement",
  "Acting Transitions",
  "Environment Transitions",
  "Camera Interaction",
  "Brand Transitions",
];

export const TRANSITION_DIFFICULTIES: TransitionDifficulty[] = ["Easy", "Medium", "Advanced"];

export const DIFFICULTY_COLORS: Record<TransitionDifficulty, string> = {
  Easy: "🟢",
  Medium: "🟡",
  Advanced: "🔴",
};

export const TRANSITIONS: Transition[] = [
  // ===== OBJECT TRANSITIONS =====
  {
    id: "object_cover",
    name: "Object Cover",
    category: "Object Transitions",
    simpleDescription: "Cover the camera with an object, then the next person removes it.",
    whatViewersSee: "The object covers the camera and the screen goes dark. Then the object is removed and the next person is there.",
    example: "Person 1 moves sunglasses over the camera. Screen goes dark. Person 2 removes the sunglasses and starts their video.",
    firstPersonSteps: [
      "Start recording.",
      "Hold your object.",
      "Move it toward the camera.",
      "Cover the entire camera lens.",
      "Hold for 1 second.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording with the object covering the lens.",
      "Remove the object.",
      "Continue the video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Introductions", "Outfit videos", "Group videos", "Different answers"],
    needs: ["An object (sunglasses, tumbler, phone, purse, hat)", "Two or more creators"],
    suggestedObjects: ["Sunglasses", "Tumbler", "Phone", "Purse", "Hat", "Book", "Makeup brush"],
  },
  {
    id: "object_hit",
    name: "Object Hit",
    category: "Object Transitions",
    simpleDescription: "Swing an object at the camera. The next person acts like it hit them.",
    whatViewersSee: "One person swings an object toward the camera. The next person reacts like they got hit.",
    example: "Person 1 swings a makeup brush toward the camera. Person 2 acts like the brush hit them and starts their video.",
    firstPersonSteps: [
      "Start recording.",
      "Hold your object.",
      "Move it toward the camera.",
      "Stop when it covers the lens.",
    ],
    nextPersonSteps: [
      "Start recording with your face close to the camera.",
      "Act like the object hit you.",
      "Recover from the hit.",
      "Continue your video.",
    ],
    difficulty: "Medium",
    worksBestWith: ["Funny content", "Debates", "Group reactions", "Court formats"],
    needs: ["An object (makeup brush, tumbler, phone)", "Two or more creators", "Timing"],
    suggestedObjects: ["Makeup brush", "Tumbler", "Phone", "Purse", "Book"],
  },
  {
    id: "object_pass",
    name: "Object Pass",
    category: "Object Transitions",
    simpleDescription: "Hand off an object to the next person so the same item travels through everyone's clips.",
    whatViewersSee: "The same object travels through multiple creators. One person hands it off, the next person receives it.",
    example: "Person 1 hands off the tumbler. Person 2 receives the tumbler and continues.",
    firstPersonSteps: [
      "Start recording.",
      "Hold your object.",
      "Move the object toward the edge of the screen.",
      "Let it leave the frame.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Have the object enter from the same side it left.",
      "Receive the object.",
      "Continue your video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Crew introductions", "Team videos", "Brand moments", "Group day content"],
    needs: ["The same object for everyone", "Two or more creators", "Everyone moves the object in the same direction"],
    suggestedObjects: ["Tumbler", "Phone", "Sunglasses", "AZ Off Script merch", "Sticker"],
  },
  {
    id: "object_throw",
    name: "Object Throw",
    category: "Object Transitions",
    simpleDescription: "Throw an object toward the camera. The next person catches it.",
    whatViewersSee: "One person throws an object at the camera. The next person catches it and starts their video.",
    example: "Person 1 throws a phone toward the camera. Person 2 catches the phone and starts talking.",
    firstPersonSteps: [
      "Start recording.",
      "Hold your object.",
      "Throw it toward the camera.",
      "End recording as it leaves your hand.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Reach out and catch the object.",
      "Look at the object.",
      "Continue your video.",
    ],
    difficulty: "Medium",
    worksBestWith: ["Funny content", "Group videos", "Crew introductions"],
    needs: ["A soft, safe object", "Two or more creators", "Timing"],
    suggestedObjects: ["Tumbler", "Hat", "Sunglasses", "Purse"],
  },

  // ===== BODY MOVEMENT =====
  {
    id: "walk_into_frame",
    name: "Walk Into Frame",
    category: "Body Movement",
    simpleDescription: "Start recording before you enter, then walk into the camera view.",
    whatViewersSee: "The camera is on an empty space. The person walks into frame and starts talking.",
    example: "The camera is pointed at a wall. Person 1 walks into frame from the left, stops, and gives their answer.",
    firstPersonSteps: [
      "Start recording before entering.",
      "Walk into the camera view.",
      "Stop where you want.",
      "Do your assigned content.",
      "End naturally.",
    ],
    nextPersonSteps: [
      "Start recording on an empty frame.",
      "Walk in from the same side the last person walked out.",
      "Stop and do your content.",
    ],
    difficulty: "Easy",
    worksBestWith: ["One-line verdicts", "Reactions", "Any solo content"],
    needs: ["Just you", "A camera"],
  },
  {
    id: "walk_past_camera",
    name: "Walk Past Camera",
    category: "Body Movement",
    simpleDescription: "One person walks past the camera and the next person continues from the same direction.",
    whatViewersSee: "One person walks by close to the camera. The next person walks in from the same direction and takes over.",
    example: "Person 1 walks past the camera from left to right. Person 2 walks in from the left and starts their video.",
    firstPersonSteps: [
      "Start recording.",
      "Walk close past the camera.",
      "Exit the frame.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Walk in from the same direction the last person walked.",
      "Stop and do your content.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Group videos", "Crew introductions", "Different answers"],
    needs: ["Two or more creators", "Space to walk"],
  },
  {
    id: "walk_off_answer",
    name: "Walk-Off Answer",
    category: "Body Movement",
    simpleDescription: "Give your answer, then walk out of frame like you're done.",
    whatViewersSee: "The person says their answer and walks away. The next person walks in.",
    example: "Person 1 says 'That's a no from me' and walks out of frame. Person 2 walks in and gives their answer.",
    firstPersonSteps: [
      "Start recording.",
      "Say your answer.",
      "Walk out of frame.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording on an empty frame.",
      "Walk into frame.",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["One-line verdicts", "Two-second opinions", "Hot takes"],
    needs: ["Just you", "Space to walk off"],
  },
  {
    id: "chair_spin",
    name: "Chair Spin",
    category: "Body Movement",
    simpleDescription: "Start turned away from the camera, spin around, and give your answer.",
    whatViewersSee: "The person is facing away, spins around to face the camera, and gives their answer.",
    example: "Person 1 is sitting turned away. They spin to face the camera and say 'Guilty.'",
    firstPersonSteps: [
      "Sit turned away from the camera.",
      "Start recording.",
      "Spin to face the camera.",
      "Give your answer.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording turned away.",
      "Spin to face the camera.",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Verdicts", "Reactions", "Court formats"],
    needs: ["A chair (optional)", "Just you"],
  },

  // ===== ACTING TRANSITIONS =====
  {
    id: "get_hit",
    name: "Get Hit",
    category: "Acting Transitions",
    simpleDescription: "One person creates an action. The next person starts by reacting to it.",
    whatViewersSee: "One person does something (throws, swings, pushes). The next person acts like it hit them.",
    example: "Person 1 swings at the camera. Person 2 starts by acting like they got hit, then recovers and gives their answer.",
    firstPersonSteps: [
      "Start recording.",
      "Create the action (swing, throw, push toward camera).",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording with your face close to the camera.",
      "Act like you got hit.",
      "Recover.",
      "Continue your video.",
    ],
    difficulty: "Medium",
    worksBestWith: ["Funny content", "Debates", "Group reactions", "Court formats"],
    needs: ["Two or more creators", "Acting/timing"],
  },
  {
    id: "surprise_reaction",
    name: "Surprise Reaction",
    category: "Acting Transitions",
    simpleDescription: "One person surprises the camera. The next person starts with a surprised face.",
    whatViewersSee: "One person does something surprising. The next person starts with a shocked face, then continues.",
    example: "Person 1 jumps at the camera. Person 2 starts with a surprised face, then gives their answer.",
    firstPersonSteps: [
      "Start recording.",
      "Do something surprising (jump, pop in, yell).",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Show a surprised face.",
      "Recover.",
      "Continue your video.",
    ],
    difficulty: "Medium",
    worksBestWith: ["Funny content", "Reactions", "POV content"],
    needs: ["Two or more creators", "Acting"],
  },
  {
    id: "point_to_next",
    name: "Point to Next Person",
    category: "Acting Transitions",
    simpleDescription: "End your clip by pointing off-screen. The next person starts by pointing at themselves.",
    whatViewersSee: "One person points to the next person. The next person points at themselves like 'me?' and starts.",
    example: "Person 1 points to the right and says 'Your turn.' Person 2 points at themselves and gives their answer.",
    firstPersonSteps: [
      "Start recording.",
      "Do your content.",
      "Point off-screen to the next person.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Point at yourself like 'me?'",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Group videos", "Crew introductions", "Different answers"],
    needs: ["Two or more creators"],
  },

  // ===== ENVIRONMENT TRANSITIONS =====
  {
    id: "door_transition",
    name: "Door",
    category: "Environment Transitions",
    simpleDescription: "One person enters or exits through a door and another person continues.",
    whatViewersSee: "One person opens or closes a door. The next person continues from the same door movement.",
    example: "Person 1 closes a door. Person 2 opens the same door (or a different door) and starts their video.",
    firstPersonSteps: [
      "Start recording.",
      "Open or close the door.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording at a door.",
      "Continue from the same door movement (open if they closed, close if they opened).",
      "Do your content.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Introductions", "POV content", "Real life content"],
    needs: ["A door", "Two or more creators"],
  },
  {
    id: "mirror_transition",
    name: "Mirror",
    category: "Environment Transitions",
    simpleDescription: "One person looks in a mirror. The next person appears as the reflection.",
    whatViewersSee: "One person looks in a mirror. Instead of their reflection, the next person is there.",
    example: "Person 1 looks in the mirror. Person 2 is in the mirror and starts talking.",
    firstPersonSteps: [
      "Start recording.",
      "Look into a mirror.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Act like you are the reflection in the mirror.",
      "Give your answer.",
    ],
    difficulty: "Advanced",
    worksBestWith: ["POV content", "Soft truths", "Creative content"],
    needs: ["A mirror (or fake mirror frame)", "Two creators", "Camera positioning"],
  },
  {
    id: "car_transition",
    name: "Car",
    category: "Environment Transitions",
    simpleDescription: "One person gets in or out of a car. The next person continues.",
    whatViewersSee: "One person gets in/out of a car. The next person does the opposite and continues.",
    example: "Person 1 gets out of the car and closes the door. Person 2 opens the car door and gets in, then starts talking.",
    firstPersonSteps: [
      "Start recording.",
      "Get in or out of the car.",
      "Close or open the door.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording at a car.",
      "Do the opposite door movement.",
      "Continue your video.",
    ],
    difficulty: "Medium",
    worksBestWith: ["Arizona real life", "Errand content", "Mom-life"],
    needs: ["A car", "Two or more creators"],
  },
  {
    id: "room_change",
    name: "Room Change",
    category: "Environment Transitions",
    simpleDescription: "One person is in one room. The next person is in a different room.",
    whatViewersSee: "The background changes from one room to another as the next person starts.",
    example: "Person 1 is in the kitchen. Cut to Person 2 in the living room giving their answer.",
    firstPersonSteps: [
      "Start recording in your room.",
      "Do your content.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording in a different room.",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Different answers", "Group videos", "Real life content"],
    needs: ["Two or more creators", "Different rooms"],
  },

  // ===== CAMERA INTERACTION =====
  {
    id: "camera_grab",
    name: "Camera Grab",
    category: "Camera Interaction",
    simpleDescription: "Someone reaches toward the camera and covers the lens. The next person starts with their hand on the lens.",
    whatViewersSee: "One person reaches toward the viewer and covers the lens. The next person removes their hand and starts.",
    example: "Person 1 reaches toward the camera and covers it. Person 2 starts with their hand on the lens, removes it, and gives their answer.",
    firstPersonSteps: [
      "Reach toward the camera.",
      "Cover the lens with your hand.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording with your hand covering the lens.",
      "Remove your hand.",
      "Continue your video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Any group content", "Crew introductions", "Reactions"],
    needs: ["Just your hand", "Two or more creators"],
  },
  {
    id: "hand_cover",
    name: "Hand Cover",
    category: "Camera Interaction",
    simpleDescription: "Cover the camera with your hand. The next person removes their hand to start.",
    whatViewersSee: "A hand covers the camera. The screen goes dark. Then a hand pulls away and the next person is there.",
    example: "Person 1 covers the camera with their hand. Person 2 starts with their hand on the lens, pulls it away, and starts talking.",
    firstPersonSteps: [
      "Start recording.",
      "Move your hand toward the camera.",
      "Cover the entire lens.",
      "Hold for 1 second.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording with your hand covering the lens.",
      "Pull your hand away.",
      "Continue your video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Any content", "Solo clips", "Group videos"],
    needs: ["Just your hand", "Two or more creators (or just you for solo)"],
  },
  {
    id: "zoom_in",
    name: "Zoom In",
    category: "Camera Interaction",
    simpleDescription: "Zoom the camera all the way in until the screen is blurry. The next person zooms out from blurry.",
    whatViewersSee: "The camera zooms in until everything is blurry. Then it zooms out and the next person is there.",
    example: "Person 1 zooms in on their face until blurry. Person 2 starts zoomed in, zooms out, and gives their answer.",
    firstPersonSteps: [
      "Start recording.",
      "Zoom the camera in.",
      "Keep zooming until the screen is blurry.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording zoomed all the way in (blurry).",
      "Zoom out slowly.",
      "Continue your video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Verdicts", "Reactions", "Solo clips"],
    needs: ["A phone camera", "Just you"],
  },
  {
    id: "zoom_out",
    name: "Zoom Out Reveal",
    category: "Camera Interaction",
    simpleDescription: "Start close-up, zoom out to reveal yourself and give your answer.",
    whatViewersSee: "The camera starts on something close-up. It zooms out to reveal the person and they give their answer.",
    example: "Person 1 starts zoomed in on their eyes. They zoom out to show their whole face and say 'Guilty.'",
    firstPersonSteps: [
      "Start recording close-up on something (your face, an object).",
      "Zoom out slowly.",
      "Reveal yourself.",
      "Give your answer.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording close-up.",
      "Zoom out.",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Verdicts", "Reactions", "Outfit reveals"],
    needs: ["A phone camera", "Just you"],
  },

  // ===== BRAND TRANSITIONS =====
  {
    id: "tumbler_pass",
    name: "Tumbler Pass",
    category: "Brand Transitions",
    simpleDescription: "Pass the AZ Off Script tumbler from person to person.",
    whatViewersSee: "The AZ Off Script tumbler travels through the crew. Each person receives it, gives their answer, and passes it on.",
    example: "Person 1 holds the tumbler, gives their answer, and passes it off-screen. Person 2 receives the tumbler and continues.",
    firstPersonSteps: [
      "Start recording holding the tumbler.",
      "Give your answer.",
      "Pass the tumbler toward the edge of the screen.",
      "Let it leave the frame.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording.",
      "Receive the tumbler from the same side it left.",
      "Give your answer.",
      "Pass it on.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Crew introductions", "Group videos", "Brand moments", "Different answers"],
    needs: ["The AZ Off Script tumbler", "Two or more creators"],
  },
  {
    id: "logo_cover",
    name: "Logo Cover",
    category: "Brand Transitions",
    simpleDescription: "Cover the camera with something showing the AZ Off Script logo, then reveal the next person.",
    whatViewersSee: "The AZ Off Script logo fills the screen. Then it's removed and the next person is there.",
    example: "Person 1 holds up a sticker or merch with the logo, covers the camera. Person 2 removes it and starts.",
    firstPersonSteps: [
      "Start recording.",
      "Hold up the AZ Off Script logo (sticker, merch, tumbler).",
      "Cover the camera with it.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording with the logo covering the lens.",
      "Remove it.",
      "Continue your video.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Crew introductions", "Brand moments", "Group videos"],
    needs: ["AZ Off Script merch/sticker/tumbler", "Two or more creators"],
  },
  {
    id: "merch_reveal",
    name: "Merch Reveal",
    category: "Brand Transitions",
    simpleDescription: "Start with the camera on your AZ Off Script merch, then reveal yourself wearing it.",
    whatViewersSee: "The camera starts on the merch. It pulls back to show the person wearing it and they give their answer.",
    example: "Person 1 starts zoomed in on the AZ Off Script logo on their shirt. They zoom out to show themselves and give their answer.",
    firstPersonSteps: [
      "Start recording close-up on your AZ Off Script merch.",
      "Zoom out or step back to reveal yourself.",
      "Give your answer.",
      "End recording.",
    ],
    nextPersonSteps: [
      "Start recording close-up on your merch.",
      "Reveal yourself.",
      "Give your answer.",
    ],
    difficulty: "Easy",
    worksBestWith: ["Off Script Looks", "Crew introductions", "Brand moments"],
    needs: ["AZ Off Script merch", "Just you"],
  },
];

// ===== Helper functions =====

export function getTransition(id: string): Transition | undefined {
  return TRANSITIONS.find((t) => t.id === id);
}

export function getTransitionsByCategory(category: TransitionCategory): Transition[] {
  return TRANSITIONS.filter((t) => t.category === category);
}

export function getTransitionsByDifficulty(difficulty: TransitionDifficulty): Transition[] {
  return TRANSITIONS.filter((t) => t.difficulty === difficulty);
}

export function getEasyTransitions(): Transition[] {
  return getTransitionsByDifficulty("Easy");
}
