
# default important explorer core Elements

Workspace - The root container for all 3D objects and physical interactions in the game world.
Players - Container for Player objects connected to the server.
Lighting - Controls global lighting effects and environmental settings.
MaterialService - Manages custom materials and overrides.
NetworkClient - Manages network connection on the client side.
ReplicatedFirst - Contains assets and scripts replicated to clients first.
ReplicatedStorage - Storage for objects replicated to both server and client.
ServerScriptService - Storage for server-side scripts not accessible to clients.
ServerStorage - Storage for objects only accessible on the server.
StarterGui - Container for GUIs copied to player's PlayerGui on spawn.
StarterPack - Container for Tools copied to player's Backpack on spawn.
StarterPlayer - Container for scripts/settings copied to Player objects.
Teams - Container for Team objects.
SoundService - Manages global sound playback and effects.
Chat - Legacy chat system service.
TextChatService - Modern text chat system configuration.

# object Elements

## Common
Folder - A container used to organize objects.
Script - Runs Lua code on the server.
LocalScript - Runs Lua code on the client.
Part - A basic 3D building block.
Model - A container for grouping 3D objects together.
Tool - An equippable item usually held by a character.

## User Interface
ScreenGui - A 2D interface layer rendered on the screen.
Frame - A rectangular container for GUI elements.
TextLabel - Displays text on a GUI.
TextButton - A clickable button with text.
ImageLabel - Displays an image on a GUI.
ImageButton - A clickable button with an image.
BillboardGui - A GUI container that renders in 3D space but faces the camera.
CanvasGroup - A GUI container that renders children into a single image group.
Path2D - Renders a spline-based path on a GUI.
ScrollingFrame - A frame that allows content to be scrolled.
SurfaceGui - A GUI container that renders on the surface of a Part.
TextBox - An input field for users to type text.
UIAspectRatioConstraint - Enforces a specific aspect ratio on a GUI element.
UICorner - Rounds the corners of a GUI element.

## Lighting & Environment
PointLight - Emits light in all directions from a point.
SpotLight - Emits light in a cone shape.
SurfaceLight - Emits light from the surface of a Part.
Sky - Defines the skybox texture and celestial bodies.
Atmosphere - Simulates atmospheric scattering and haze.
BloomEffect - Adds a glow effect to bright areas.
Decal - Applies an image to a face of a Part.
Texture - Applies a repeating image pattern to a face of a Part.
SurfaceAppearance - Applies PBR textures (Color, Normal, Roughness) to a MeshPart.
MaterialVariant - Customizes the appearance of a material.
TerrainDetail - Adds decorative details like grass to Terrain.

## Gameplay & Interaction
SpawnLocation - A Part where players respawn.
Seat - A specialized Part that a Humanoid can sit on.
VehicleSeat - A Seat that controls a vehicle mechanism.
ClickDetector - Detects mouse clicks on 3D objects.
DragDetector - Enables physical dragging of objects by the player.
ProximityPrompt - Interaction prompt triggered when a player gets close.
Dialog - Displays a chat bubble above a Part or NPC.
DialogChoice - Represents a choice in a Dialog conversation.
RemoteEvent - Enables communication between server and client scripts.

## Avatar & Audio
Humanoid - Controls character movement, health, and display name.
Animation - Data for character or object animation.
Sound - An audio source.
Attachment - A point on a Part used for constraints or accessories.

## Values
StringValue - Stores a string value.
IntValue - Stores an integer value.
NumberValue - Stores a floating-point number value.
BoolValue - Stores a boolean (true/false) value.
Color3Value - Stores a color value.
ObjectValue - Stores a reference to another object.
RayValue - Stores a Ray value (origin and direction).

## Advanced & Services
ModuleScript - Reusable Lua code module required by other scripts.
Camera - Controls the view of the 3D world.
Terrain - Voxel-based 3D landscape.
LocalizationService - Manages translations and localization tables.
TestService - Used for running automated tests.
