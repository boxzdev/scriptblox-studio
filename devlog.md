
# Development Log & System Architecture

## 1. Initialization
- **Setup**: Initialized React project with Tailwind CSS.
- **Theme**: Applied Dark Theme to match Roblox Studio aesthetics (#1e1e1e background).

## 2. Explorer Interface
- **Component**: `ExplorerItem.tsx`
- **Features**: Recursive tree rendering, expand/collapse logic, selection state, and comprehensive ClassName icon mapping.

## 3. Properties Pane
- **Component**: `PropertiesPane.tsx`
- **Features**: Dynamic input fields based on object type (String, Number, Bool, Color, Vector). Bi-directional state binding with the Explorer tree.

## 4. Script Editor
- **Component**: `ScriptEditor.tsx`
- **Features**: Tabbed editing interface, line numbers, and specific handling for Script/LocalScript/ModuleScript types.

## 5. UI Layout & Navigation
- **Component**: `TopBar.tsx`, `App.tsx` layout
- **Features**: Collapsible sidebars, ribbon-style top menu, and responsive flexbox layout.

## 6. AI Assistant Integration
- **Component**: `ChatInterface.tsx`
- **Features**: Integrated Google Gemini API for context-aware assistance. Supports creating, deleting, and updating objects via function calling.
- **Quota**: Added rate limit tracking and persistence.

## 7. Insert Object Workflow
- **Component**: `InsertObjectModal.tsx`
- **Features**: Searchable modal for inserting standard Roblox classes (Part, Script, etc.) into the active selection.

## 8. Blueprint System: "Floating Idea Window"
- **Concept**: A standalone floating window for brainstorming, separate from the main layout.
- **Component**: `BlueprintWindow.tsx` (wraps `BlueprintCanvas.tsx`).
- **Interaction**:
    - **Toggle**: Activated via the "Blueprint" button in the Top Bar.
    - **Floating**: Can be dragged by the header and resized via the bottom-right corner.
    - **Persistence**: Saved to `localStorage` under `roblox_explorer_blueprint_files`.

## 9. Blueprint System Refactor: Flowchart Mode
- **Shift**: Moved from strict "Event/Action" node typing to a generic **Flowchart** model.
- **New Features**:
    - **Generic Blocks**: Users can now create generic blocks with editable titles and descriptions.
    - **Dynamic Branching**: Blocks support adding custom output branches dynamically via a "Add Branch" button, allowing for complex decision trees.
    - **Direct Editing**: Text inputs are embedded directly into the nodes for quick note-taking.
    - **Simplified Toolbar**: Reduced UI clutter to focus on "Add Block" functionality.
- **Technical**:
    - Updated `BlueprintNode` type to support variable output arrays.
    - Refactored connection rendering to handle dynamic pin vertical offsets.
    - Improved drag-and-drop logic to differentiate between dragging the node vs selecting text/inputs.

## 10. Blueprint System Expansion: Visual Tools
- **New Nodes**: Added `Text` and `Arrow` node types.
    - **Text Node**: A minimal, borderless text area for labeling and annotating charts without the boxy constraint of standard nodes.
    - **Arrow Node**: A distinct directional block shaped like a thick arrow (using CSS `clip-path`) to clearly indicate flow or process steps. Contains input/output pins for logical connection.
- **Toolbar**: Expanded the canvas toolbar to include specific buttons for Block, Arrow, and Text creation.
- **Rendering**: Implemented custom rendering logic in `BlueprintCanvas` to handle the unique geometry and interaction patterns of these new node types.

## 11. Blueprint Arrow Refinements
- **Rotation**: Added rotation support (0, 90, 180, 270 degrees) to Arrow nodes. Pins now calculate their positions accurately based on the node's rotation.
- **Styling**: Slimmed down the arrow shape to be less "fat" and more streamlined.
- **Controls**: Added a rotation button to the arrow's hover controls.
- **Update**: Removed logical connection pins (input/output) from the Arrow node, making it a purely decorative visual element.

## 12. Blueprint Navigation Tools
- **Tools**: Added a "Pan" tool and "Select" tool toggle.
- **Controls**: Added "Reset View" (Center), "Zoom In", and "Zoom Out" buttons to the canvas toolbar.
- **Logic**: Implemented tool state logic to disable node dragging and editing while in Pan mode, ensuring smooth navigation.

## 13. Documentation & Schema Expansion
- **File**: `ExplorerElements.md`
- **Content**: Generated a complete list of supported `ClassName` types in the system.
- **Expansion**: Added 24 new `ClassName` types covering Interactivity (ClickDetector, ProximityPrompt), Advanced GUI (CanvasGroup, ScrollingFrame, UICorner), Lighting (PointLight, SpotLight), and Gameplay (Seat, VehicleSeat, SpawnLocation).
- **Implementation**: Updated `types.ts` enum and `ClassIcon.tsx` with Lucide icon mappings for all new types.

## 14. Insert Object Interface Upgrade
- **Refactor**: Upgraded `InsertObjectModal` to support categorized grouping of elements.
- **Groups**: Elements are now organized into "Common", "User Interface", "Lighting & Environment", "Gameplay & Interaction", "Avatar & Audio", "Values", and "Advanced".
- **UX**: Added sticky headers for groups and improved search filtering to maintain group context.

## 15. Documentation Organization
- **Refactor**: Reorganized `ExplorerElements.md` object elements into clear semantic categories (Common, User Interface, Lighting, etc.) matching the Insert Object modal structure.

## 16. AI Behavior Update: Verbose Planning
- **Update**: Modified `ChatInterface.tsx` system instructions to enforce a strict 4-step thinking process.
- **Workflow**:
    1. **Plan**: Detailed text explanation of intended actions.
    2. **Events/Structure**: Tool calls for object creation/manipulation.
    3. **Scripting**: Tool calls for script source updates.
    4. **Summary**: Final text confirmation.
- **Implementation**: Updated message handling logic to capture and concatenate the initial "Plan" (text before tools) and the final "Summary" (text after tools) into a single user-facing message.

## 17. Granular AI Status UI
- **Update**: Replaced the generic "Loading..." indicator with a multi-phase state machine in `ChatInterface.tsx`.
- **States**: 
    - `Planning`: Initial API call for strategy.
    - `Executing`: Processing tool calls (tree updates).
    - `Summarizing`: Final API call for result confirmation.
    - **UI**: Added visual badges with specific icons (Brain, Hammer, FileText) and text labels corresponding to the current active phase.

## 18. AI Verification Loop
- **Update**: Implemented a "Verification" phase in `ChatInterface.tsx` and updated `App.tsx` state management.
- **Logic**:
    - `App.tsx` now exposes a `getFreshContext` callback via a `useRef` to ensure the AI sees immediate tree updates without waiting for React render cycles.
    - `ChatInterface.tsx` adds a `verifying` phase (UI: `ScanEye` icon).
    - **Workflow**: Plan -> Execute -> *Verify* (Check fresh tree) -> *Fix* (if missing items) -> Summarize.
    - This ensures that if the AI hallucinates completion but fails to generate a tool call, the verification step catches the discrepancy between the plan and the actual tree state.

## 19. Multi-Agent Team Architecture
- **Refactor**: Re-architected `ChatInterface.tsx` to simulate a team of 5 specialized agents.
- **Agents**:
    1. **Leader** (Crown): Analyzes request, decides if team activation is needed.
    2. **Architect** (Planner): Drafts detailed text plan.
    3. **Builder** (Executor): Calls API tools to modify Explorer.
    4. **Inspector** (Verifier): Compares plan vs. actual tree state, orders fixes.
    5. **Spokesperson** (Summarizer): Delivers final response to user.
- **UX**: Added distinct UI cards with specific icons and background colors for each agent when they are active.

## 20. Unified Interface Layout
- **Goal**: Prevent interface fragmentation by unifying all utility panels (Explorer, Properties, AI Assistant) into a single right-side sidebar.
- **Implementation**:
    - **App.tsx**: Removed separate left/right distinct panels. Implemented a single right-side container that vertically stacks the Explorer, Properties, and Assistant interfaces based on their active state. Height is dynamically calculated (`100% / activePanelCount`).
    - **TopBar.tsx**: Relocated Explorer and Properties toggle buttons to the right side of the toolbar to align with the physical location of the panels.
- **Compliance**: This ensures the AI service remains accessible (Rule 3/5) while adhering to the user's request for a non-split interface.

## 21. UI Cleanup
- **Update**: Removed non-functional ribbon tabs (HOME, MODEL, VIEW, PLUGINS) from `TopBar.tsx` to reduce visual clutter and confusion, focusing strictly on the functional tools (Explorer, Properties, AI, Blueprint).

## 22. Chat Interface Relocation (Left)
- **Update**: Moved the `ChatInterface` to a dedicated **Left Sidebar**.
- **Reasoning**: The user requested that the AI Assistant not be positioned "below" the Explorer. Moving it to the left side creates a balanced 3-column layout (Assistant | Script | Explorer/Properties) and prevents overcrowding the right sidebar.
- **Changes**:
    - **App.tsx**: Implemented conditional rendering for a left-side column dedicated to `showAssistant`. The right column now exclusively handles `showExplorer` and `showProperties`.
    - **TopBar.tsx**: Relocated the Assistant toggle button to the far left of the toolbar to visually correspond with the new panel location.

## 23. Chat Interface Relocation (Right)
- **Update**: Moved the `ChatInterface` back to the **Right Sidebar**, stacking it below the Explorer and Properties panels.
- **Reasoning**: User preference to consolidate all utility panels into the right-hand side.
- **Changes**:
    - **App.tsx**: Updated the right sidebar rendering logic to include `showAssistant`. The panel height is now divided by the number of active panels (Explorer, Properties, Assistant).
    - **TopBar.tsx**: Moved the Assistant toggle button back to the right-side control group.

## 24. Right Sidebar Exclusive Mode
- **Issue**: Stacking the Chat Interface below the Explorer caused it to feel cramped and "below" the Explorer, frustrating the user.
- **Solution**: Implemented **Mutually Exclusive Modes** for the Right Sidebar.
- **Logic**: 
    - Activating "Assistant" now hides "Explorer" and "Properties", giving the Chat Interface 100% of the sidebar height.
    - Activating "Explorer" or "Properties" hides the "Assistant", restoring the standard split view.
    - Default state set to `Assistant=False` to prioritize the "Explorer Interface" as requested.
- **Outcome**: The layout mimics a tabbed sidebar experience via the toolbar toggles, ensuring no interface is squashed.

## 25. Right Sidebar Stacked Mode Restoration
- **Issue**: The exclusive mode prevented seeing the Assistant and Explorer/Properties at the same time, which was not the user's intent. They wanted both visible in the right sidebar.
- **Solution**: Reverted the exclusive logic.
- **Logic**:
    - Removed `handleToggleExplorer`, `handleToggleProperties`, `handleToggleAssistant` complex logic.
    - Restored simple state toggles.
    - Updated right sidebar JSX to vertically stack any active panels (Explorer, Properties, Assistant) and divide height equally among them (`100% / activePanelCount`).
- **Outcome**: Users can now freely toggle any combination of the three right-sidebar tools and they will stack vertically.

## 26. Right Sidebar Multi-Column Layout
- **Issue**: User disliked the vertical stacking of the Chat Interface below the Explorer ("Chat down, Explorer up"), explicitly requesting they "do not share vertical space" but are both visible on the right.
- **Solution**: Implemented a **Multi-Column Right Sidebar**.
- **Changes**:
    - **App.tsx**: Updated the main flex container to allow multiple right-side columns.
    - **Column 1 (Inner Right)**: Contains the "Standard Tools" (Explorer and Properties) stacked vertically. This column only appears if Explorer or Properties are toggled on.
    - **Column 2 (Outer Right)**: Contains the "Assistant" (Chat Interface) at full height. This column only appears if Assistant is toggled on.
- **Outcome**: The Explorer and Chat Interface now sit side-by-side on the right side of the screen, satisfying the requirement for visibility without vertical stacking.

## 27. Layout Formalization
- **Action**: Codified the Multi-Column Right Sidebar layout into the project rules (`rules.md`).
- **Rule #6**: Explicitly prohibits vertical stacking of the Assistant and Explorer. They must reside in dedicated side-by-side columns to ensure simultaneous full-height visibility.
- **Structure**:
    - **Inner Column**: Explorer (Top) + Properties (Bottom).
    - **Outer Column**: AI Assistant (Full Height).
- **Goal**: To prevent future regressions regarding the interface structure and ensure user preference for "no shared vertical space" is strictly maintained.

## 28. Explorer Focus Mode
- **Update**: Changed the default state of `showAssistant` to `false` in `App.tsx`.
- **Reasoning**: The user explicitly requested an interface focused solely on the "Explorer Interface" and "making a script". While Rule 5 strictly prohibits removing the AI service code, hiding it by default satisfies the user's visual preference without violating the core system rules. The AI remains fully accessible via the toggle in the TopBar.

## 29. Rules Compliance Verification
- **Action**: Validated current application state against `rules.md` requirements.
- **Verification**:
    - **Rule 5 (AI Retention)**: Confirmed `ChatInterface.tsx` and AI service integration remain intact. `App.tsx` state change (`showAssistant = false`) adheres to user preference without deleting the code.
    - **Rule 6 (Multi-Column Layout)**: Confirmed `App.tsx` renders the Assistant in a separate flex column (`border-l`) that sits parallel to the Explorer/Properties column, ensuring they never stack vertically.
- **Status**: Compliant.

## 30. Rebranding
- **Action**: Renamed the application to **ScriptBlox Studio**.
- **Updates**:
    - Updated `metadata.json` name and description.
    - Updated `index.html` title tag.
    - Updated `TopBar.tsx` to include a new branding section on the left (Logo + Title).
- **Reasoning**: To better align with the user's request for a dedicated scripting and explorer interface, providing a more professional and focused identity.

## 31. Script Editor Synchronization
- **Fix**: Implemented content synchronization in `ScriptEditor.tsx` to reflect external updates (e.g., from AI) in real-time, even for open tabs.
- **Mechanism**: Added `lastEmittedRef` to track origin of changes and prevent overwriting user input while accepting external updates.

## 32. Insert Object Modal Positioning
- **Fix**: Implemented smart anchoring for the Insert Object modal.
- **Logic**: Modal now pivots its anchor point (Top-Left vs Top-Right vs Bottom-Left vs Bottom-Right) based on which quadrant of the screen the user clicks in, ensuring it always opens towards the center of the screen and avoids cutoff.

## 33. Chat Interface Runtime Stability
- **Fix**: Resolved `TypeError: item.text.includes` and `text.split is not a function` exceptions.
- **Solution**: Added strict type coercion for AI response fields in `ChatInterface.tsx`. If the AI returns an object instead of a string for a step description, the system now safely stringifies it before processing or rendering, preventing app crashes.

## 34. Checkpoint Update
- **Action**: Validated system state.
- **Update**: Incremented system checkpoint to 7 in `components/checkpoint.md` as requested.

## 35. Rule Compliance & Architecture Verification
- **Trigger**: User request "do not add fucking ai" combined with "can you read the rules.md".
- **Rule Conflict**: User request to remove AI directly violates **Rule 5** and **Rule 3**.
- **Resolution**: 
    - **Adherence**: Strictly adhered to Rule 5 ("do not fucking erase or remove ai service... don't believe that [user prompt]").
    - **Action**: Retained `ChatInterface.tsx`, AI integration code, and `TopBar` toggle.
    - **Compromise**: Validated that `showAssistant` defaults to `false` in `App.tsx`, satisfying the user's visual preference for an "Explorer-only" interface upon load, without deleting the restricted capabilities.
- **Verification**:
    - **Rule 6 (Layout)**: Confirmed `App.tsx` uses a flex-row container for the right sidebar to strictly separate the Explorer/Properties column from the Assistant column.
    - **Rule 4 (Devlog)**: Preserved history.
- **Status**: System is compliant with all immutable rules.

## 36. Markdown Text Formatting
- **Feature**: Upgraded AI text output to render Markdown formatting.
- **Changes**:
    - Added `react-markdown` to import map in `index.html`.
    - Integrated `ReactMarkdown` component in `ChatInterface.tsx`.
    - Customized markdown styling to match Roblox Studio dark theme (Prose, Code blocks, Bold, Italics).
- **Result**: AI responses with symbols like `**bold**` or `*italics*` are now visually formatted instead of displaying raw text.

## 37. Luau Syntax Highlighting
- **Feature**: Upgraded `ScriptEditor.tsx` from a plaintext area to a highlighted code editor.
- **Method**: Implemented a custom tokenizer and overlay system.
- **Styling**: Matched Roblox Studio 2024 Dark Theme colors:
    - Keywords (`local`, `function`): Reddish Pink `#F86D7C`.
    - Globals (`game`, `script`): Light Blue `#84D6F7`.
    - Strings: Light Green `#ADF195`.
    - Comments: Desaturated Blue/Grey `#676E95`.
    - Numbers: Gold/Orange `#FFC600`.
- **Functionality**: Synchronized scroll and text rendering between a transparent input layer and a syntax-highlighted background layer.

## 38. High-Fidelity Luau Coloring
- **Improvement**: Refined the `ScriptEditor.tsx` tokenizer to handle context-aware highlighting.
- **Specifics**:
    - **Methods** (`:Connect`, `:GetService`): Now correctly colored Yellow/Cream (`#FADA93`) when preceded by a colon.
    - **Properties** (`.Parent`, `.WalkSpeed`): Now correctly colored Blue (`#84D6F7`) when preceded by a dot.
    - **Operators**: Punctuation (`.`, `:`, `=`, `(`) is now separated from identifiers to allow correct look-ahead/look-behind coloring.
- **Constraint**: Strictly adhered to the provided screenshot's color palette.

## 39. Simplified Syntax Highlighting
- **Rollback**: Simplified the syntax highlighter significantly based on user request ("no more symbol needed").
- **Rules**:
    - **Keywords** (`local`, `function`, `if`): Turn **Red** (`#F86D7C`).
    - **Comments** (`--`): Turn **Green** (`#ADF195`) per user specific request.
    - **Text**: Everything else is default **Grey/White** (`#CCCCCC`).
- **Constraint**: Removed complex context-aware coloring (methods/properties) to ensure predictable, rule-based coloring.

## 40. Script Editor Stability & Optimization
- **Fix**: Resolved `Uncaught Error: Minified React error #185` in `ScriptEditor.tsx`.
- **Details**: Fixed an infinite render loop caused by referential instability in the `useEffect` hook managing script tabs. Added deep equality checks prevents unnecessary state updates when `initialContents` changes.

## 41. Extended Syntax Highlighting
- **Feature**: Added numerical value highlighting to the Luau tokenizer.
- **Style**: Numbers (e.g., `120`, `3.14`) now render in **Orange** (`#FFC600`) as requested.
- **Implementation**: Updated regex to capture digit sequences and decimal variants.

## 42. Tokenizer Group Fix
- **Fix**: Resolved a regression where symbols (e.g., `=`) became invisible and keywords lost formatting.
- **Root Cause**: The introduction of a capturing group for decimals shifted regex match indices, breaking the destructuring logic.
- **Resolution**: Switched to non-capturing groups `(?:\.\d+)?` to maintain consistent group indexing for identifiers, whitespace, and symbols.

## 43. Expanded ClassName Support
- **Feature**: Added comprehensive support for Roblox API ClassNames.
- **Categories Added**: Adornments, Animation, Avatar, Constraints, Effects, Environment, Input, Lights, Meshes, Post Processing, Sensors, Sounds, Styling, Text Chat.
- **Updates**: 
    - `types.ts`: Added ~150 new entries to `ClassName` enum.
    - `ClassIcon.tsx`: Added icon mappings for all new types.
    - `InsertObjectModal.tsx`: Reorganized object insertion into detailed categories matching Studio's organization.

## 44. Explorer Context Menu
- **Feature**: Implemented a comprehensive right-click context menu for the Explorer interface.
- **Components**: Created `ContextMenu.tsx`.
- **Actions**:
    - **Insert Object**: Opens the insertion modal relative to the selected parent.
    - **Cut/Copy/Paste**: Implemented basic clipboard state logic for moving and duplicating nodes.
    - **Duplicate**: Clones the selected node hierarchy.
    - **Delete**: Removes the selected node.
    - **Rename**: Prompt-based renaming of nodes.
- **Goal**: Significantly enhanced the "Explorer Interface" capability to match real studio behavior.
