
import React from 'react';
import { 
  Box, Users, Lightbulb, Layers, Database, Server, LayoutTemplate, Briefcase, User, 
  Music, MessageSquare, Globe, Folder, FileCode, FileJson, Camera, Mountain, Sun, 
  Cloud, Zap, Monitor, CreditCard, Type, Radio, Film, Volume2, PersonStanding, Link, 
  Wrench, Hash, ToggleLeft, Palette, BoxSelect, MoveUpRight, FileText, Image as ImageIcon, 
  MousePointerClick, MessageCircle, Hand, Timer, Grid, Activity, ScrollText, FormInput, 
  Scaling, Circle, Flashlight, Armchair, Flag, Car, Eye, Link2, Key, RadioTower
} from 'lucide-react';
import { ClassName } from '../types';

interface ClassIconProps {
  className: ClassName;
}

export const ClassIcon: React.FC<ClassIconProps> = ({ className }) => {
  const size = 14;

  // Helper for checking if className starts with a string
  const isType = (str: string) => className.startsWith(str);

  // Grouped by Feature
  if (isType('Audio') || className.includes('Sound')) return <Volume2 size={size} className="text-blue-400" />;
  if (className.includes('Constraint')) return <Link size={size} className="text-green-400" />;
  if (className.includes('Effect') && !className.includes('Sound')) return <Zap size={size} className="text-yellow-400" />;
  if (className.includes('Adornment') || className.includes('Handle')) return <BoxSelect size={size} className="text-blue-300" />;
  if (className.includes('Controller')) return <Activity size={size} className="text-orange-300" />;

  switch (className) {
    // Services
    case ClassName.Workspace: return <Globe size={size} className="text-gray-300" />;
    case ClassName.Players: return <Users size={size} className="text-gray-300" />;
    case ClassName.Lighting: return <Lightbulb size={size} className="text-gray-300" />;
    case ClassName.MaterialService: return <Layers size={size} className="text-gray-300" />;
    case ClassName.NetworkClient: return <Radio size={size} className="text-blue-400" />;
    case ClassName.ReplicatedFirst: return <Database size={size} className="text-blue-300" />;
    case ClassName.ReplicatedStorage: return <Database size={size} className="text-gray-300" />;
    case ClassName.ServerScriptService: return <Server size={size} className="text-gray-300" />;
    case ClassName.ServerStorage: return <Database size={size} className="text-green-300" />;
    case ClassName.StarterGui: return <LayoutTemplate size={size} className="text-gray-300" />;
    case ClassName.StarterPack: return <Briefcase size={size} className="text-gray-300" />;
    case ClassName.StarterPlayer: return <User size={size} className="text-gray-300" />;
    case ClassName.Teams: return <Users size={size} className="text-yellow-400" />;
    case ClassName.SoundService: return <Music size={size} className="text-gray-300" />;
    case ClassName.Chat: return <MessageSquare size={size} className="text-gray-300" />;
    case ClassName.TextChatService: return <MessageSquare size={size} className="text-blue-400" />;
    case ClassName.TestService: return <Activity size={size} className="text-orange-400" />;
    case ClassName.LocalizationService: return <Globe size={size} className="text-blue-300" />;

    // Basic Objects
    case ClassName.Folder: return <Folder size={size} className="text-yellow-400 fill-yellow-400/20" />;
    case ClassName.Model: return <Box size={size} className="text-white" />;
    case ClassName.Part: 
    case ClassName.WedgePart: 
    case ClassName.CornerWedgePart:
    case ClassName.TrussPart:
    case ClassName.MeshPart:
      return <Box size={size} className="text-gray-300" />;
    
    // Scripting
    case ClassName.Script: return <FileCode size={size} className="text-gray-300" />;
    case ClassName.LocalScript: return <FileCode size={size} className="text-blue-400" />;
    case ClassName.ModuleScript: return <FileJson size={size} className="text-purple-400" />;
    case ClassName.RemoteEvent:
    case ClassName.UnreliableRemoteEvent:
    case ClassName.BindableEvent:
      return <Radio size={size} className="text-orange-400" />;
    case ClassName.RemoteFunction:
    case ClassName.BindableFunction:
      return <RadioTower size={size} className="text-purple-400" />;
    case ClassName.Actor: return <User size={size} className="text-gray-300" />;

    // Environment
    case ClassName.Terrain: return <Mountain size={size} className="text-green-600" />;
    case ClassName.Sky: return <Cloud size={size} className="text-blue-300" />;
    case ClassName.Atmosphere: return <Cloud size={size} className="text-orange-300" />;
    case ClassName.Clouds: return <Cloud size={size} className="text-white" />;

    // GUI
    case ClassName.ScreenGui: return <Monitor size={size} className="text-gray-300" />;
    case ClassName.Frame: return <CreditCard size={size} className="text-gray-300" />;
    case ClassName.TextLabel: case ClassName.TextButton: return <Type size={size} className="text-gray-300" />;
    case ClassName.ImageLabel: case ClassName.ImageButton: return <ImageIcon size={size} className="text-orange-300" />;
    case ClassName.BillboardGui: case ClassName.SurfaceGui: case ClassName.AdGui: return <Monitor size={size} className="text-gray-300" />;
    case ClassName.ScrollingFrame: return <ScrollText size={size} className="text-gray-300" />;
    case ClassName.TextBox: return <FormInput size={size} className="text-gray-300" />;
    case ClassName.VideoFrame: return <Film size={size} className="text-purple-300" />;
    case ClassName.ViewportFrame: return <Camera size={size} className="text-gray-300" />;
    
    // Layout & Constraints
    case ClassName.UIAspectRatioConstraint:
    case ClassName.UISizeConstraint:
    case ClassName.UITextSizeConstraint:
      return <Scaling size={size} className="text-green-300" />;
    case ClassName.UICorner: return <Circle size={size} className="text-green-300" />;
    case ClassName.UIGridLayout: case ClassName.UIListLayout: case ClassName.UITableLayout: return <Grid size={size} className="text-gray-300" />;
    case ClassName.UIPadding: return <Box size={size} className="text-gray-300" />;

    // Avatar
    case ClassName.Humanoid: return <PersonStanding size={size} className="text-orange-300" />;
    case ClassName.Attachment: return <Link size={size} className="text-green-400" />;
    case ClassName.Tool: case ClassName.Accessory: return <Wrench size={size} className="text-gray-300" />;
    case ClassName.Shirt: case ClassName.Pants: return <User size={size} className="text-green-300" />;
    
    // Values
    case ClassName.StringValue: return <FileText size={size} className="text-gray-300" />;
    case ClassName.IntValue: case ClassName.NumberValue: return <Hash size={size} className="text-blue-300" />;
    case ClassName.BoolValue: return <ToggleLeft size={size} className="text-blue-500" />;
    case ClassName.Color3Value: case ClassName.BrickColorValue: return <Palette size={size} className="text-purple-400" />;
    case ClassName.ObjectValue: return <BoxSelect size={size} className="text-gray-300" />;
    case ClassName.Vector3Value: case ClassName.CFrameValue: case ClassName.RayValue: return <MoveUpRight size={size} className="text-gray-300" />;

    // Gameplay
    case ClassName.SpawnLocation: return <Flag size={size} className="text-gray-300" />;
    case ClassName.Seat: return <Armchair size={size} className="text-gray-400" />;
    case ClassName.VehicleSeat: return <Car size={size} className="text-gray-400" />;
    case ClassName.ProximityPrompt: return <Timer size={size} className="text-blue-400" />;
    case ClassName.ClickDetector: return <MousePointerClick size={size} className="text-green-300" />;
    case ClassName.DragDetector: return <Hand size={size} className="text-yellow-300" />;

    // Lighting
    case ClassName.PointLight: return <Lightbulb size={size} className="text-yellow-200" />;
    case ClassName.SpotLight: return <Flashlight size={size} className="text-yellow-200" />;
    case ClassName.SurfaceLight: return <Sun size={size} className="text-yellow-200" />;

    // Meshes
    case ClassName.SpecialMesh: case ClassName.BlockMesh: case ClassName.CharacterMesh: return <Box size={size} className="text-blue-200" />;

    // Post Processing
    case ClassName.BloomEffect: case ClassName.BlurEffect: case ClassName.SunRaysEffect: 
    case ClassName.ColorCorrectionEffect: case ClassName.DepthOfFieldEffect: return <Eye size={size} className="text-purple-300" />;

    default: return <Box size={size} className="text-gray-300" />;
  }
};
