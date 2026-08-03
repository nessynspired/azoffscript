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

/**
 * Chain tier — classifies which transition chain difficulty this transition
 * belongs to. Used by the Transition Chain system to group transitions by
 * how forgiving they are when stitched across 4-6 creators.
 *
 * "Easy Chain"   — forgiving, works for remote separate recording (cover/reveal, look, point, walk)
 * "Medium Chain" — requires clearer matching (throw/catch, push/stumble, drop/pickup)
 * "Advanced Chain" — needs practice or a visual reference (fake hit, choreographed fall, complex multi-object)
 */
export type TransitionChainTier = "Easy Chain" | "Medium Chain" | "Advanced Chain";

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

  // ===== Paired Handoff Fields =====
  // Transitions are stored as paired handoffs, not isolated movements.
  // The outgoing action is what the first creator does; the incoming action
  // is what the next creator does to match it.

  /** Short description of the outgoing action (what the first creator does) */
  outgoingAction?: string;
  /** Short description of the matching incoming action (what the next creator does) */
  incomingAction?: string;
  /** Required screen direction for matching (e.g. "Left to right", "Top to bottom") */
  requiredDirection?: string;
  /** Safe prop recommendation for this transition */
  safeProp?: string;
  /** Whether the lens must be fully covered for the transition to work */
  lensCoverageRequired?: boolean;
  /** Which transition chain tier this belongs to (for multi-creator chain planning) */
  chainTier?: TransitionChainTier;
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

export const TRANSITION_CHAIN_TIERS: TransitionChainTier[] = ["Easy Chain", "Medium Chain", "Advanced Chain"];

export const CHAIN_TIER_COLORS: Record<TransitionChainTier, string> = {
  "Easy Chain": "🟢",
  "Medium Chain": "🟡",
  "Advanced Chain": "🔴",
};

export const CHAIN_TIER_DESCRIPTIONS: Record<TransitionChainTier, string> = {
  "Easy Chain": "Forgiving, works for remote separate recording. Cover/reveal, look, point, walk.",
  "Medium Chain": "Requires clearer matching. Throw/catch, push/stumble, drop/pickup.",
  "Advanced Chain": "Needs practice or a visual reference. Fake hit, choreographed fall, complex multi-object.",
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
    outgoingAction: "Cover the camera lens with an object",
    incomingAction: "Start with the object covering the lens, then remove it",
    requiredDirection: "Any",
    safeProp: "Sunglasses, tumbler, or hat",
    lensCoverageRequired: true,
    chainTier: "Easy Chain",
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
    outgoingAction: "Swing an object toward the camera lens",
    incomingAction: "Act like the object hit you, then recover",
    requiredDirection: "Any",
    safeProp: "Lightweight makeup brush or soft item",
    lensCoverageRequired: true,
    chainTier: "Medium Chain",
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
    outgoingAction: "Move the object toward the edge of the frame and let it exit",
    incomingAction: "Have the object enter from the same side and receive it",
    requiredDirection: "Consistent (pick one direction for the whole chain)",
    safeProp: "Tumbler or lightweight item",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Throw the object toward the camera",
    incomingAction: "Reach out and catch the object",
    requiredDirection: "Any",
    safeProp: "Soft, lightweight object (hat, sunglasses)",
    lensCoverageRequired: false,
    chainTier: "Medium Chain",
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
    outgoingAction: "Walk out of the frame",
    incomingAction: "Walk into the frame from the same side",
    requiredDirection: "Consistent",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Walk past the camera and exit the frame",
    incomingAction: "Walk in from the same direction",
    requiredDirection: "Consistent (left to right or right to left)",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Walk off after your answer",
    incomingAction: "Walk into frame on an empty shot",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Spin in your chair and exit the frame",
    incomingAction: "Start spinning into frame from the same direction",
    requiredDirection: "Consistent",
    safeProp: "A stable chair",
    lensCoverageRequired: false,
    chainTier: "Medium Chain",
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
    outgoingAction: "Swing at the camera as if hitting the next person",
    incomingAction: "React like you got hit and recover",
    requiredDirection: "Any",
    safeProp: "None — acting only",
    lensCoverageRequired: false,
    chainTier: "Medium Chain",
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
    outgoingAction: "Look surprised and point toward the next person",
    incomingAction: "Start with a surprised face looking back",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Point toward the next person's direction",
    incomingAction: "Start looking in the direction they pointed",
    requiredDirection: "Consistent",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Close a door in front of the camera",
    incomingAction: "Open the door and start your video",
    requiredDirection: "Any",
    safeProp: "A door",
    lensCoverageRequired: true,
    chainTier: "Medium Chain",
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
    outgoingAction: "Move toward a mirror until the lens is covered",
    incomingAction: "Pull back from a mirror to reveal yourself",
    requiredDirection: "Any",
    safeProp: "A mirror",
    lensCoverageRequired: true,
    chainTier: "Advanced Chain",
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
    outgoingAction: "Get into a car and close the door",
    incomingAction: "Open the car door and step out",
    requiredDirection: "Any",
    safeProp: "A car",
    lensCoverageRequired: true,
    chainTier: "Medium Chain",
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
    outgoingAction: "Walk out of your room",
    incomingAction: "Start in a different room",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Reach toward the camera and grab it",
    incomingAction: "Start as if the camera was just handed to you",
    requiredDirection: "Any",
    safeProp: "None — acting only",
    lensCoverageRequired: true,
    chainTier: "Medium Chain",
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
    outgoingAction: "Cover the lens with your hand",
    incomingAction: "Start with your hand covering the lens, then remove it",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: true,
    chainTier: "Easy Chain",
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
    outgoingAction: "Zoom the camera in until the screen is blurry",
    incomingAction: "Start zoomed in and zoom out to reveal yourself",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Zoom out from a close-up",
    incomingAction: "Start zoomed in on something and zoom out to reveal yourself",
    requiredDirection: "Any",
    safeProp: "None needed",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Move the tumbler toward the edge of the frame",
    incomingAction: "Have the tumbler enter from the same side",
    requiredDirection: "Consistent",
    safeProp: "An AZ Off Script tumbler",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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
    outgoingAction: "Cover the lens with the AZ Off Script logo",
    incomingAction: "Start with the logo covering the lens, then remove it",
    requiredDirection: "Any",
    safeProp: "AZ Off Script sticker, merch, or tumbler",
    lensCoverageRequired: true,
    chainTier: "Easy Chain",
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
    outgoingAction: "Zoom out from your AZ Off Script merch",
    incomingAction: "Start close-up on your merch and zoom out to reveal yourself",
    requiredDirection: "Any",
    safeProp: "AZ Off Script merch",
    lensCoverageRequired: false,
    chainTier: "Easy Chain",
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

export function getTransitionsByChainTier(tier: TransitionChainTier): Transition[] {
  return TRANSITIONS.filter((t) => t.chainTier === tier);
}

export function getTransitionChainTiers(): TransitionChainTier[] {
  return TRANSITION_CHAIN_TIERS;
}
