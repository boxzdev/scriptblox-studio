
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ClassName } from '../types';
import { ClassIcon } from './ClassIcon';

interface InsertObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (className: ClassName) => void;
  position?: { x: number; y: number };
}

type Category = {
    name: string;
    items: ClassName[];
}

// Define organized categories matching the prompt structure
const CATEGORIES: Category[] = [
    {
        name: "Common",
        items: [
            ClassName.Part, ClassName.Script, ClassName.LocalScript, 
            ClassName.Folder, ClassName.Model, ClassName.Tool, ClassName.ModuleScript
        ]
    },
    {
        name: "3D Interfaces",
        items: [
            ClassName.ClickDetector, ClassName.Decal, ClassName.Dialog,
            ClassName.DialogChoice, ClassName.DragDetector, ClassName.MaterialVariant,
            ClassName.ProximityPrompt, ClassName.SurfaceAppearance, ClassName.TerrainDetail,
            ClassName.Texture
        ]
    },
    {
        name: "Adornments",
        items: [
            ClassName.ArcHandles, ClassName.BoxHandleAdornment, ClassName.ConeHandleAdornment,
            ClassName.CylinderHandleAdornment, ClassName.Handles, ClassName.ImageHandleAdornment,
            ClassName.LineHandleAdornment, ClassName.PathfindingLink, ClassName.PathfindingModifier,
            ClassName.PyramidHandleAdornment, ClassName.SelectionBox, ClassName.SelectionSphere,
            ClassName.SphereHandleAdornment, ClassName.SurfaceSelection, ClassName.WireframeHandleAdornment
        ]
    },
    {
        name: "Animation",
        items: [
            ClassName.Animation, ClassName.AnimationController, ClassName.Animator,
            ClassName.Bone, ClassName.FaceControls, ClassName.IKControl, ClassName.Motor6D
        ]
    },
    {
        name: "Avatar",
        items: [
            ClassName.Accessory, ClassName.AirController, ClassName.BodyColors,
            ClassName.BuoyancySensor, ClassName.ClimbController, ClassName.ControllerManager,
            ClassName.ControllerPartSensor, ClassName.ForceField, ClassName.GroundController,
            ClassName.Humanoid, ClassName.Pants, ClassName.Shirt, ClassName.ShirtGraphic,
            ClassName.SwimController
        ]
    },
    {
        name: "Constraints",
        items: [
            ClassName.AlignOrientation, ClassName.AlignPosition, ClassName.AngularVelocity,
            ClassName.Attachment, ClassName.BallSocketConstraint, ClassName.CylindricalConstraint,
            ClassName.HingeConstraint, ClassName.LineForce, ClassName.LinearVelocity,
            ClassName.NoCollisionConstraint, ClassName.PlaneConstraint, ClassName.PrismaticConstraint,
            ClassName.RigidConstraint, ClassName.RodConstraint, ClassName.RopeConstraint,
            ClassName.SpringConstraint, ClassName.Torque, ClassName.TorsionSpringConstraint,
            ClassName.UniversalConstraint, ClassName.VectorForce, ClassName.WeldConstraint
        ]
    },
    {
        name: "Effects",
        items: [
            ClassName.Beam, ClassName.Explosion, ClassName.Fire, ClassName.Highlight,
            ClassName.ParticleEmitter, ClassName.Smoke, ClassName.Sparkles, ClassName.Trail,
            ClassName.WrapDeformer, ClassName.WrapLayer, ClassName.WrapTarget
        ]
    },
    {
        name: "Environment",
        items: [
            ClassName.Atmosphere, ClassName.Clouds, ClassName.Sky
        ]
    },
    {
        name: "GUI",
        items: [
            ClassName.BillboardGui, ClassName.CanvasGroup, ClassName.Frame,
            ClassName.ImageButton, ClassName.ImageLabel, ClassName.Path2D,
            ClassName.ScreenGui, ClassName.ScrollingFrame, ClassName.SurfaceGui,
            ClassName.TextBox, ClassName.TextButton, ClassName.TextLabel,
            ClassName.UIAspectRatioConstraint, ClassName.UICorner, ClassName.UIDragDetector,
            ClassName.UIFlexItem, ClassName.UIGradient, ClassName.UIGridLayout,
            ClassName.UIListLayout, ClassName.UIPadding, ClassName.UIPageLayout,
            ClassName.UIScale, ClassName.UISizeConstraint, ClassName.UIStroke,
            ClassName.UITableLayout, ClassName.UITextSizeConstraint, ClassName.VideoFrame,
            ClassName.ViewportFrame
        ]
    },
    {
        name: "Input",
        items: [
            ClassName.InputAction, ClassName.InputBinding, ClassName.InputContext
        ]
    },
    {
        name: "Interaction",
        items: [
            ClassName.Seat, ClassName.VehicleSeat, ClassName.SpawnLocation
        ]
    },
    {
        name: "Lights",
        items: [
            ClassName.PointLight, ClassName.SpotLight, ClassName.SurfaceLight
        ]
    },
    {
        name: "Meshes",
        items: [
            ClassName.BlockMesh, ClassName.CharacterMesh, ClassName.SpecialMesh
        ]
    },
    {
        name: "Parts",
        items: [
            ClassName.CornerWedgePart, ClassName.MeshPart, ClassName.Part,
            ClassName.TrussPart, ClassName.WedgePart
        ]
    },
    {
        name: "Post Processing",
        items: [
            ClassName.BloomEffect, ClassName.BlurEffect, ClassName.ColorCorrectionEffect,
            ClassName.ColorGradingEffect, ClassName.DepthOfFieldEffect, ClassName.SunRaysEffect
        ]
    },
    {
        name: "Scripting",
        items: [
            ClassName.Actor, ClassName.BindableEvent, ClassName.BindableFunction,
            ClassName.LocalScript, ClassName.ModuleScript, ClassName.RemoteEvent,
            ClassName.RemoteFunction, ClassName.Script, ClassName.UnreliableRemoteEvent
        ]
    },
    {
        name: "Sensors",
        items: [
            ClassName.AtmosphereSensor, ClassName.FluidForceSensor
        ]
    },
    {
        name: "Sounds",
        items: [
            ClassName.AudioAnalyzer, ClassName.AudioChannelMixer, ClassName.AudioChannelSplitter,
            ClassName.AudioChorus, ClassName.AudioCompressor, ClassName.AudioDeviceInput,
            ClassName.AudioDeviceOutput, ClassName.AudioDistortion, ClassName.AudioEcho,
            ClassName.AudioEmitter, ClassName.AudioEqualizer, ClassName.AudioFader,
            ClassName.AudioFilter, ClassName.AudioFlanger, ClassName.AudioGate,
            ClassName.AudioLimiter, ClassName.AudioListener, ClassName.AudioPitchShifter,
            ClassName.AudioPlayer, ClassName.AudioReverb, ClassName.AudioSpeechToText,
            ClassName.AudioTextToSpeech, ClassName.AudioTremolo, ClassName.ChorusSoundEffect,
            ClassName.CompressorSoundEffect, ClassName.DistortionSoundEffect, ClassName.EchoSoundEffect,
            ClassName.EqualizerSoundEffect, ClassName.FlangeSoundEffect, ClassName.PitchShiftSoundEffect,
            ClassName.ReverbSoundEffect, ClassName.Sound, ClassName.SoundGroup,
            ClassName.TremoloSoundEffect, ClassName.Wire
        ]
    },
    {
        name: "Styling",
        items: [
            ClassName.StyleDerive, ClassName.StyleLink, ClassName.StyleRule, ClassName.StyleSheet
        ]
    },
    {
        name: "Text Chat",
        items: [
            ClassName.TextChannel, ClassName.TextChatCommand
        ]
    },
    {
        name: "Uncategorized",
        items: [
            ClassName.AccessoryDescription, ClassName.BodyPartDescription, ClassName.Camera,
            ClassName.Configuration, ClassName.HapticEffect, ClassName.HumanoidDescription,
            ClassName.Weld, ClassName.WorldModel
        ]
    },
    {
        name: "Values",
        items: [
            ClassName.BoolValue, ClassName.BrickColorValue, ClassName.CFrameValue,
            ClassName.Color3Value, ClassName.IntValue, ClassName.NumberValue,
            ClassName.ObjectValue, ClassName.RayValue, ClassName.StringValue,
            ClassName.Vector3Value
        ]
    }
];

export const InsertObjectModal: React.FC<InsertObjectModalProps> = ({ isOpen, onClose, onSelect, position }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calculate safe position to prevent off-screen rendering
  const modalStyle = useMemo(() => {
    if (!position) {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    // Default dimensions of the modal matching Tailwind classes w-[280px] h-[400px]
    const width = 280;
    const height = 400;
    const padding = 12;

    let x = position.x;
    let y = position.y;

    if (typeof window !== 'undefined') {
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Smart Anchoring: 
        // If clicking on the right half, show modal to the left of cursor
        if (x > winW / 2) {
            x = x - width;
        }
        
        // If clicking on the bottom half, show modal above the cursor
        if (y > winH / 2) {
            y = y - height;
        }

        // Clamp to edges (Safety Net)
        // Right Edge
        if (x + width + padding > winW) {
            x = winW - width - padding;
        }
        // Left Edge
        if (x < padding) {
            x = padding;
        }
        // Bottom Edge
        if (y + height + padding > winH) {
            y = winH - height - padding;
        }
        // Top Edge
        if (y < padding) {
            y = padding;
        }
    }

    return { top: y, left: x };
  }, [position]);
  
  // Filter categories and their items based on search
  const filteredCategories = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    const query = normalize(search);

    return CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item => normalize(item).includes(query))
    })).filter(cat => cat.items.length > 0);
  }, [search]);

  // Flattened list for Enter key selection
  const topResult = useMemo(() => {
      if (filteredCategories.length > 0 && filteredCategories[0].items.length > 0) {
          return filteredCategories[0].items[0];
      }
      return null;
  }, [filteredCategories]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      // Small timeout to allow render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        className="absolute w-[280px] h-[400px] bg-[#252526] border border-[#3e3e42] shadow-2xl flex flex-col rounded-sm"
        style={modalStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#2d2d2d] border-b border-[#1e1e1e] select-none">
          <span className="text-[11px] font-bold text-gray-300">Insert Object</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={12} />
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#1e1e1e] bg-[#2d2d2d]">
          <div className="relative flex items-center bg-[#1e1e1e] border border-[#3e3e42] rounded-sm focus-within:border-blue-500">
             <Search size={12} className="absolute left-2 text-gray-500" />
             <input
               ref={inputRef}
               className="w-full bg-transparent text-xs text-white pl-7 pr-2 py-1.5 outline-none placeholder-gray-600"
               placeholder="Search object..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               onKeyDown={e => {
                   if (e.key === 'Enter' && topResult) {
                       onSelect(topResult);
                   }
                   if (e.key === 'Escape') onClose();
               }}
             />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#252526]">
           {filteredCategories.map(category => (
               <div key={category.name}>
                   <div className="px-2 py-1 bg-[#2d2d2d]/50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-[#3e3e42]/50 sticky top-0 z-10 backdrop-blur-sm">
                       {category.name}
                   </div>
                   <div className="py-1">
                       {category.items.map(cls => (
                         <div 
                            key={cls}
                            onClick={() => onSelect(cls)}
                            className="flex items-center px-3 py-1.5 hover:bg-[#094771] hover:text-white cursor-pointer text-gray-300 group select-none transition-colors"
                         >
                            <div className="mr-2.5 flex-shrink-0 text-gray-400 group-hover:text-white">
                                <ClassIcon className={cls} />
                            </div>
                            <span className="text-xs truncate">{cls}</span>
                         </div>
                       ))}
                   </div>
               </div>
           ))}
           
           {filteredCategories.length === 0 && (
               <div className="p-8 text-center text-gray-500 text-xs flex flex-col items-center">
                   <Search size={24} className="mb-2 opacity-20" />
                   <span>No objects found</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
