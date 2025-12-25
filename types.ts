

export enum ClassName {
  // Services & Roots
  Workspace = 'Workspace',
  Players = 'Players',
  Lighting = 'Lighting',
  MaterialService = 'MaterialService',
  NetworkClient = 'NetworkClient',
  ReplicatedFirst = 'ReplicatedFirst',
  ReplicatedStorage = 'ReplicatedStorage',
  ServerScriptService = 'ServerScriptService',
  ServerStorage = 'ServerStorage',
  StarterGui = 'StarterGui',
  StarterPack = 'StarterPack',
  StarterPlayer = 'StarterPlayer',
  Teams = 'Teams',
  SoundService = 'SoundService',
  Chat = 'Chat',
  TextChatService = 'TextChatService',
  LocalizationService = 'LocalizationService',
  TestService = 'TestService',
  
  // Adornments
  ArcHandles = 'ArcHandles',
  BoxHandleAdornment = 'BoxHandleAdornment',
  ConeHandleAdornment = 'ConeHandleAdornment',
  CylinderHandleAdornment = 'CylinderHandleAdornment',
  Handles = 'Handles',
  ImageHandleAdornment = 'ImageHandleAdornment',
  LineHandleAdornment = 'LineHandleAdornment',
  PathfindingLink = 'PathfindingLink',
  PathfindingModifier = 'PathfindingModifier',
  PyramidHandleAdornment = 'PyramidHandleAdornment',
  SelectionBox = 'SelectionBox',
  SelectionSphere = 'SelectionSphere',
  SphereHandleAdornment = 'SphereHandleAdornment',
  SurfaceSelection = 'SurfaceSelection',
  WireframeHandleAdornment = 'WireframeHandleAdornment',

  // Ads
  AdGui = 'AdGui',

  // Animation
  Animation = 'Animation',
  AnimationController = 'AnimationController',
  Animator = 'Animator',
  Bone = 'Bone',
  FaceControls = 'FaceControls',
  IKControl = 'IKControl',
  Motor6D = 'Motor6D',

  // Avatar
  Accessory = 'Accessory',
  AirController = 'AirController',
  BodyColors = 'BodyColors',
  BuoyancySensor = 'BuoyancySensor',
  ClimbController = 'ClimbController',
  ControllerManager = 'ControllerManager',
  ControllerPartSensor = 'ControllerPartSensor',
  ForceField = 'ForceField',
  GroundController = 'GroundController',
  Humanoid = 'Humanoid',
  Pants = 'Pants',
  Shirt = 'Shirt',
  ShirtGraphic = 'ShirtGraphic',
  SwimController = 'SwimController',

  // Constraints
  AlignOrientation = 'AlignOrientation',
  AlignPosition = 'AlignPosition',
  AngularVelocity = 'AngularVelocity',
  Attachment = 'Attachment',
  BallSocketConstraint = 'BallSocketConstraint',
  CylindricalConstraint = 'CylindricalConstraint',
  HingeConstraint = 'HingeConstraint',
  LineForce = 'LineForce',
  LinearVelocity = 'LinearVelocity',
  NoCollisionConstraint = 'NoCollisionConstraint',
  PlaneConstraint = 'PlaneConstraint',
  PrismaticConstraint = 'PrismaticConstraint',
  RigidConstraint = 'RigidConstraint',
  RodConstraint = 'RodConstraint',
  RopeConstraint = 'RopeConstraint',
  SpringConstraint = 'SpringConstraint',
  Torque = 'Torque',
  TorsionSpringConstraint = 'TorsionSpringConstraint',
  UniversalConstraint = 'UniversalConstraint',
  VectorForce = 'VectorForce',
  WeldConstraint = 'WeldConstraint',

  // Effects
  Beam = 'Beam',
  Explosion = 'Explosion',
  Fire = 'Fire',
  Highlight = 'Highlight',
  ParticleEmitter = 'ParticleEmitter',
  Smoke = 'Smoke',
  Sparkles = 'Sparkles',
  Trail = 'Trail',
  WrapDeformer = 'WrapDeformer',
  WrapLayer = 'WrapLayer',
  WrapTarget = 'WrapTarget',

  // Environment
  Atmosphere = 'Atmosphere',
  Clouds = 'Clouds',
  Sky = 'Sky',

  // GUI
  BillboardGui = 'BillboardGui',
  CanvasGroup = 'CanvasGroup',
  Frame = 'Frame',
  ImageButton = 'ImageButton',
  ImageLabel = 'ImageLabel',
  Path2D = 'Path2D',
  ScreenGui = 'ScreenGui',
  ScrollingFrame = 'ScrollingFrame',
  SurfaceGui = 'SurfaceGui',
  TextBox = 'TextBox',
  TextButton = 'TextButton',
  TextLabel = 'TextLabel',
  UIAspectRatioConstraint = 'UIAspectRatioConstraint',
  UICorner = 'UICorner',
  UIDragDetector = 'UIDragDetector',
  UIFlexItem = 'UIFlexItem',
  UIGradient = 'UIGradient',
  UIGridLayout = 'UIGridLayout',
  UIListLayout = 'UIListLayout',
  UIPadding = 'UIPadding',
  UIPageLayout = 'UIPageLayout',
  UIScale = 'UIScale',
  UISizeConstraint = 'UISizeConstraint',
  UIStroke = 'UIStroke',
  UITableLayout = 'UITableLayout',
  UITextSizeConstraint = 'UITextSizeConstraint',
  VideoFrame = 'VideoFrame',
  ViewportFrame = 'ViewportFrame',

  // Input
  InputAction = 'InputAction',
  InputBinding = 'InputBinding',
  InputContext = 'InputContext',

  // Interaction
  ClickDetector = 'ClickDetector',
  Decal = 'Decal',
  Dialog = 'Dialog',
  DialogChoice = 'DialogChoice',
  DragDetector = 'DragDetector',
  MaterialVariant = 'MaterialVariant',
  ProximityPrompt = 'ProximityPrompt',
  Seat = 'Seat',
  SpawnLocation = 'SpawnLocation',
  SurfaceAppearance = 'SurfaceAppearance',
  TerrainDetail = 'TerrainDetail',
  Texture = 'Texture',
  VehicleSeat = 'VehicleSeat',

  // Lighting
  PointLight = 'PointLight',
  SpotLight = 'SpotLight',
  SurfaceLight = 'SurfaceLight',

  // Meshes
  BlockMesh = 'BlockMesh',
  CharacterMesh = 'CharacterMesh',
  SpecialMesh = 'SpecialMesh',

  // Parts
  CornerWedgePart = 'CornerWedgePart',
  MeshPart = 'MeshPart',
  Part = 'Part',
  TrussPart = 'TrussPart',
  WedgePart = 'WedgePart',

  // Post Processing
  BloomEffect = 'BloomEffect',
  BlurEffect = 'BlurEffect',
  ColorCorrectionEffect = 'ColorCorrectionEffect',
  ColorGradingEffect = 'ColorGradingEffect',
  DepthOfFieldEffect = 'DepthOfFieldEffect',
  SunRaysEffect = 'SunRaysEffect',

  // Scripting
  Actor = 'Actor',
  BindableEvent = 'BindableEvent',
  BindableFunction = 'BindableFunction',
  LocalScript = 'LocalScript',
  ModuleScript = 'ModuleScript',
  RemoteEvent = 'RemoteEvent',
  RemoteFunction = 'RemoteFunction',
  Script = 'Script',
  UnreliableRemoteEvent = 'UnreliableRemoteEvent',

  // Sensors
  AtmosphereSensor = 'AtmosphereSensor',
  FluidForceSensor = 'FluidForceSensor',

  // Sounds
  AudioAnalyzer = 'AudioAnalyzer',
  AudioChannelMixer = 'AudioChannelMixer',
  AudioChannelSplitter = 'AudioChannelSplitter',
  AudioChorus = 'AudioChorus',
  AudioCompressor = 'AudioCompressor',
  AudioDeviceInput = 'AudioDeviceInput',
  AudioDeviceOutput = 'AudioDeviceOutput',
  AudioDistortion = 'AudioDistortion',
  AudioEcho = 'AudioEcho',
  AudioEmitter = 'AudioEmitter',
  AudioEqualizer = 'AudioEqualizer',
  AudioFader = 'AudioFader',
  AudioFilter = 'AudioFilter',
  AudioFlanger = 'AudioFlanger',
  AudioGate = 'AudioGate',
  AudioLimiter = 'AudioLimiter',
  AudioListener = 'AudioListener',
  AudioPitchShifter = 'AudioPitchShifter',
  AudioPlayer = 'AudioPlayer',
  AudioReverb = 'AudioReverb',
  AudioSpeechToText = 'AudioSpeechToText',
  AudioTextToSpeech = 'AudioTextToSpeech',
  AudioTremolo = 'AudioTremolo',
  ChorusSoundEffect = 'ChorusSoundEffect',
  CompressorSoundEffect = 'CompressorSoundEffect',
  DistortionSoundEffect = 'DistortionSoundEffect',
  EchoSoundEffect = 'EchoSoundEffect',
  EqualizerSoundEffect = 'EqualizerSoundEffect',
  FlangeSoundEffect = 'FlangeSoundEffect',
  PitchShiftSoundEffect = 'PitchShiftSoundEffect',
  ReverbSoundEffect = 'ReverbSoundEffect',
  Sound = 'Sound',
  SoundGroup = 'SoundGroup',
  TremoloSoundEffect = 'TremoloSoundEffect',
  Wire = 'Wire',

  // Styling
  StyleDerive = 'StyleDerive',
  StyleLink = 'StyleLink',
  StyleRule = 'StyleRule',
  StyleSheet = 'StyleSheet',

  // Text Chat
  TextChannel = 'TextChannel',
  TextChatCommand = 'TextChatCommand',

  // Uncategorized
  AccessoryDescription = 'AccessoryDescription',
  BodyPartDescription = 'BodyPartDescription',
  Camera = 'Camera',
  Configuration = 'Configuration',
  Folder = 'Folder',
  HapticEffect = 'HapticEffect',
  HumanoidDescription = 'HumanoidDescription',
  Model = 'Model',
  Terrain = 'Terrain',
  Tool = 'Tool',
  Weld = 'Weld',
  WorldModel = 'WorldModel',

  // Values
  BoolValue = 'BoolValue',
  BrickColorValue = 'BrickColorValue',
  CFrameValue = 'CFrameValue',
  Color3Value = 'Color3Value',
  IntValue = 'IntValue',
  NumberValue = 'NumberValue',
  ObjectValue = 'ObjectValue',
  RayValue = 'RayValue',
  StringValue = 'StringValue',
  Vector3Value = 'Vector3Value',
}

export interface InstanceProperties {
  // Base
  Name?: string;
  Parent?: string;
  Source?: string; // Added Source property for Scripts

  // Visual / Part
  Color?: string; // Hex code
  Transparency?: number;
  Reflectance?: number;
  CastShadow?: boolean;
  Material?: string;
  
  // Transform
  Size?: string; // "x, y, z"
  Position?: string; // "x, y, z"
  Orientation?: string; // "x, y, z"
  
  // Physics
  Anchored?: boolean;
  CanCollide?: boolean;
  
  // Gui
  Text?: string; 
  Visible?: boolean; 
  BackgroundTransparency?: number;
  BackgroundColor3?: string;
  
  // Image Properties (New)
  Image?: string;
  ImageTransparency?: number;
  ImageColor3?: string;

  // Lighting
  ClockTime?: number;
  Brightness?: number;
  Ambient?: string;
  OutdoorAmbient?: string;
  FogEnd?: number;
  FogStart?: number;
  FogColor?: string;
  
  // Terrain
  WaterColor?: string;
  WaterWaveSize?: number;
  WaterWaveSpeed?: number;
  Decoration?: boolean;
  
  // Sound
  SoundId?: string;
  Volume?: number;
  Looped?: boolean;
  Playing?: boolean;
  
  // Animation
  AnimationId?: string;
  
  // Script
  Disabled?: boolean;
  
  // Camera
  FieldOfView?: number;

  // Humanoid
  Health?: number;
  MaxHealth?: number;
  WalkSpeed?: number;
  JumpPower?: number;
  DisplayName?: string;

  // Tool
  ToolTip?: string;
  RequiresHandle?: boolean;
  CanBeDropped?: boolean;
  Grip?: string; // "x, y, z, r00, r01..." simplified to string for now

  // Value Types
  Value?: any; // Can be string, number, boolean, etc.
}

export interface ExplorerNode {
  id: string;
  name: string;
  className: ClassName;
  children?: ExplorerNode[];
  expanded?: boolean; // Initial state
  properties?: InstanceProperties;
}

// --- NEW BLUEPRINT GRAPH TYPES ---

export type PinType = 'flow'; // Simplified to just 'flow'

export interface BlueprintPin {
  id: string;
  name?: string;
  type: PinType;
}

export enum BlueprintNodeType {
  Block = 'Block',
  Arrow = 'Arrow',
  Text = 'Text'
}

export interface BlueprintNode {
  id: string;
  type: BlueprintNodeType;
  title: string;
  content?: string; // For the text body
  x: number;
  y: number;
  rotation?: number; // Rotation in degrees (0, 90, 180, 270)
  inputs: BlueprintPin[];
  outputs: BlueprintPin[];
}

export interface BlueprintConnection {
  id: string;
  sourceNodeId: string;
  sourcePinId: string;
  targetNodeId: string;
  targetPinId: string;
}

export interface BlueprintData {
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
  viewport: { x: number; y: number; zoom: number };
}

export interface BlueprintFile {
  id: string;
  name: string;
  content: BlueprintData;
  updatedAt: number;
}