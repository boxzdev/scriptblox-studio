import React from 'react';
import { ExplorerNode, InstanceProperties, ClassName } from '../types';

interface PropertiesPaneProps {
  node: ExplorerNode | null;
  onChange: (key: keyof InstanceProperties | 'Name', value: any) => void;
}

// Reusable Property Row Component
const PropertyRow: React.FC<{ 
    label: string; 
    children: React.ReactNode; 
}> = ({ label, children }) => (
    <div className="flex border-b border-[#2d2d2d] min-h-[22px]">
        <div className="w-[40%] py-0.5 border-r border-[#2d2d2d] px-1 truncate flex items-center hover:bg-[#2d2d2d] cursor-default pl-4" title={label}>
            {label}
        </div>
        <div className="w-[60%] py-0.5 px-1 truncate flex items-center relative group">
            {children}
        </div>
    </div>
);

// Input Components
const StringInput: React.FC<{ value?: string; onChange: (val: string) => void; placeholder?: string }> = ({ value = "", onChange, placeholder }) => (
    <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none w-full h-full text-[#cccccc] placeholder-gray-600 focus:bg-[#000000] focus:ring-1 focus:ring-blue-500 px-1 rounded-sm -ml-1 transition-colors"
    />
);

const NumberInput: React.FC<{ value?: number; onChange: (val: number) => void }> = ({ value = 0, onChange }) => (
    <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        step={0.1}
        className="bg-transparent border-none outline-none w-full h-full text-[#cccccc] focus:bg-[#000000] focus:ring-1 focus:ring-blue-500 px-1 rounded-sm -ml-1 transition-colors"
    />
);

const BoolInput: React.FC<{ value?: boolean; onChange: (val: boolean) => void }> = ({ value = false, onChange }) => (
    <input 
        type="checkbox" 
        checked={value} 
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500 cursor-pointer" 
    />
);

const ColorInput: React.FC<{ value?: string; onChange: (val: string) => void }> = ({ value = "#FFFFFF", onChange }) => (
    <div className="flex items-center w-full">
        <div className="w-3 h-3 border border-black mr-2 shadow-sm" style={{ backgroundColor: value }}></div>
        <div className="flex-1 text-[#cccccc] relative h-full">
            <span className="text-[11px] opacity-80">{value}</span>
            <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
        </div>
    </div>
);

const VectorInput: React.FC<{ value?: string; onChange: (val: string) => void }> = ({ value = "0, 0, 0", onChange }) => (
    <StringInput value={value} onChange={onChange} />
);

// Section Header Component
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-[#2d2d2d] px-1 py-0.5 flex items-center border-b border-[#1e1e1e] mt-1 sticky top-0 z-10">
        <span className="font-semibold text-gray-400">{title}</span>
    </div>
);

export const PropertiesPane: React.FC<PropertiesPaneProps> = ({ node, onChange }) => {
  if (!node) {
    return (
      <div className="h-full bg-[#222222] text-[#cccccc] flex items-center justify-center text-xs select-none">
        No selection
      </div>
    );
  }

  const p = node.properties || {};

  // Define logic for showing specific categories
  const isPart = node.className === ClassName.Part;
  const isModel = node.className === ClassName.Model;
  const isLighting = node.className === ClassName.Lighting;
  const isTerrain = node.className === ClassName.Terrain;
  const isSound = node.className === ClassName.Sound;
  const isScript = node.className === ClassName.Script || node.className === ClassName.LocalScript;
  const isGui = node.className === ClassName.Frame || 
                node.className === ClassName.TextLabel || 
                node.className === ClassName.TextButton || 
                node.className === ClassName.ScreenGui || 
                node.className === ClassName.ImageLabel ||
                node.className === ClassName.ImageButton; // Added ImageButton to isGui

  const isText = node.className === ClassName.TextLabel || node.className === ClassName.TextButton;
  
  const isImage = node.className === ClassName.ImageLabel || node.className === ClassName.ImageButton; // Changed Decal to ImageButton

  const isCamera = node.className === ClassName.Camera;
  const isAnimation = node.className === ClassName.Animation;
  const isHumanoid = node.className === ClassName.Humanoid;
  const isTool = node.className === ClassName.Tool;
  const isAttachment = node.className === ClassName.Attachment;
  
  const isValue = [
      ClassName.StringValue, 
      ClassName.IntValue, 
      ClassName.NumberValue, 
      ClassName.BoolValue, 
      ClassName.Color3Value,
      ClassName.ObjectValue,
      ClassName.RayValue
  ].includes(node.className);

  return (
    <div className="h-full bg-[#222222] text-[#cccccc] flex flex-col font-sans text-xs overflow-y-auto pb-4">
      
      {/* Information Header */}
      <div className="bg-[#2d2d2d] px-2 py-1 border-b border-[#444] font-semibold text-[11px] text-gray-400 sticky top-0 z-20">
        Properties - {node.name}
      </div>
      
      <div className="">
        {/* DATA SECTION (Universal) */}
        <SectionHeader title="Data" />
        <PropertyRow label="ClassName">
            <span className="text-gray-400 select-none cursor-not-allowed">{node.className}</span>
        </PropertyRow>
        <PropertyRow label="Name">
            <StringInput value={node.name} onChange={(v) => onChange('Name', v)} />
        </PropertyRow>
        <PropertyRow label="Parent">
            <span className="text-gray-400 italic">...</span>
        </PropertyRow>
        
        {/* VALUE TYPES */}
        {isValue && (
            <>
                <SectionHeader title="Value" />
                <PropertyRow label="Value">
                    {node.className === ClassName.BoolValue ? (
                        <BoolInput value={p.Value} onChange={(v) => onChange('Value', v)} />
                    ) : node.className === ClassName.Color3Value ? (
                        <ColorInput value={p.Value} onChange={(v) => onChange('Value', v)} />
                    ) : node.className === ClassName.IntValue || node.className === ClassName.NumberValue ? (
                        <NumberInput value={p.Value} onChange={(v) => onChange('Value', v)} />
                    ) : (
                        <StringInput value={String(p.Value)} onChange={(v) => onChange('Value', v)} />
                    )}
                </PropertyRow>
            </>
        )}

        {/* HUMANOID PROPERTIES */}
        {isHumanoid && (
            <>
                <SectionHeader title="Game" />
                <PropertyRow label="Health">
                    <NumberInput value={p.Health} onChange={(v) => onChange('Health', v)} />
                </PropertyRow>
                <PropertyRow label="MaxHealth">
                    <NumberInput value={p.MaxHealth} onChange={(v) => onChange('MaxHealth', v)} />
                </PropertyRow>
                <PropertyRow label="WalkSpeed">
                    <NumberInput value={p.WalkSpeed} onChange={(v) => onChange('WalkSpeed', v)} />
                </PropertyRow>
                <PropertyRow label="JumpPower">
                    <NumberInput value={p.JumpPower} onChange={(v) => onChange('JumpPower', v)} />
                </PropertyRow>
            </>
        )}

        {/* TOOL PROPERTIES */}
        {isTool && (
            <>
                <SectionHeader title="Tool" />
                <PropertyRow label="ToolTip">
                    <StringInput value={p.ToolTip} onChange={(v) => onChange('ToolTip', v)} />
                </PropertyRow>
                <PropertyRow label="RequiresHandle">
                    <BoolInput value={p.RequiresHandle} onChange={(v) => onChange('RequiresHandle', v)} />
                </PropertyRow>
                <PropertyRow label="CanBeDropped">
                    <BoolInput value={p.CanBeDropped} onChange={(v) => onChange('CanBeDropped', v)} />
                </PropertyRow>
                <PropertyRow label="Grip">
                    <VectorInput value={p.Grip} onChange={(v) => onChange('Grip', v)} />
                </PropertyRow>
            </>
        )}

        {/* ATTACHMENT PROPERTIES */}
        {isAttachment && (
             <>
                <SectionHeader title="Attachment" />
                <PropertyRow label="Visible">
                    <BoolInput value={p.Visible} onChange={(v) => onChange('Visible', v)} />
                </PropertyRow>
             </>
        )}

        {/* APPEARANCE SECTION */}
        {(isPart || isModel || isGui || isLighting || isTerrain) && (
             <SectionHeader title="Appearance" />
        )}

        {(isPart || isModel || isGui) && (
            <PropertyRow label={isGui ? "BackgroundColor3" : "Color"}>
                <ColorInput value={isGui ? p.BackgroundColor3 : p.Color} onChange={(v) => onChange(isGui ? 'BackgroundColor3' : 'Color', v)} />
            </PropertyRow>
        )}

        {(isPart || isModel) && (
            <>
                <PropertyRow label="CastShadow">
                    <BoolInput value={p.CastShadow} onChange={(v) => onChange('CastShadow', v)} />
                </PropertyRow>
                <PropertyRow label="Reflectance">
                    <NumberInput value={p.Reflectance} onChange={(v) => onChange('Reflectance', v)} />
                </PropertyRow>
                <PropertyRow label="Transparency">
                    <NumberInput value={p.Transparency} onChange={(v) => onChange('Transparency', v)} />
                </PropertyRow>
            </>
        )}

        {isGui && (
             <>
                <PropertyRow label="BackgroundTransparency">
                    <NumberInput value={p.BackgroundTransparency} onChange={(v) => onChange('BackgroundTransparency', v)} />
                </PropertyRow>
                <PropertyRow label="Visible">
                     <BoolInput value={p.Visible} onChange={(v) => onChange('Visible', v)} />
                </PropertyRow>
             </>
        )}

        {/* LIGHTING PROPERTIES */}
        {isLighting && (
            <>
                <PropertyRow label="Ambient">
                     <ColorInput value={p.Ambient} onChange={(v) => onChange('Ambient', v)} />
                </PropertyRow>
                <PropertyRow label="Brightness">
                     <NumberInput value={p.Brightness} onChange={(v) => onChange('Brightness', v)} />
                </PropertyRow>
                <PropertyRow label="ClockTime">
                     <NumberInput value={p.ClockTime} onChange={(v) => onChange('ClockTime', v)} />
                </PropertyRow>
                <PropertyRow label="FogColor">
                     <ColorInput value={p.FogColor} onChange={(v) => onChange('FogColor', v)} />
                </PropertyRow>
                <PropertyRow label="FogEnd">
                     <NumberInput value={p.FogEnd} onChange={(v) => onChange('FogEnd', v)} />
                </PropertyRow>
                <PropertyRow label="OutdoorAmbient">
                     <ColorInput value={p.OutdoorAmbient} onChange={(v) => onChange('OutdoorAmbient', v)} />
                </PropertyRow>
            </>
        )}

        {/* TERRAIN PROPERTIES */}
        {isTerrain && (
            <>
                <PropertyRow label="WaterColor">
                     <ColorInput value={p.WaterColor} onChange={(v) => onChange('WaterColor', v)} />
                </PropertyRow>
                <PropertyRow label="WaterWaveSize">
                     <NumberInput value={p.WaterWaveSize} onChange={(v) => onChange('WaterWaveSize', v)} />
                </PropertyRow>
                <PropertyRow label="WaterWaveSpeed">
                     <NumberInput value={p.WaterWaveSpeed} onChange={(v) => onChange('WaterWaveSpeed', v)} />
                </PropertyRow>
                <PropertyRow label="Decoration">
                     <BoolInput value={p.Decoration} onChange={(v) => onChange('Decoration', v)} />
                </PropertyRow>
            </>
        )}

        {/* TEXT PROPERTIES */}
        {isText && (
             <>
                <SectionHeader title="Text" />
                <PropertyRow label="Text">
                    <StringInput value={p.Text} onChange={(v) => onChange('Text', v)} />
                </PropertyRow>
             </>
        )}
        
        {/* IMAGE PROPERTIES */}
        {isImage && (
             <>
                <SectionHeader title="Image" />
                <PropertyRow label="Image">
                    <StringInput value={p.Image} onChange={(v) => onChange('Image', v)} placeholder="rbxassetid://..." />
                </PropertyRow>
                <PropertyRow label="ImageColor3">
                     <ColorInput value={p.ImageColor3} onChange={(v) => onChange('ImageColor3', v)} />
                </PropertyRow>
                <PropertyRow label="ImageTransparency">
                     <NumberInput value={p.ImageTransparency} onChange={(v) => onChange('ImageTransparency', v)} />
                </PropertyRow>
             </>
        )}

        {/* ANIMATION PROPERTIES */}
        {isAnimation && (
             <>
                <SectionHeader title="Animation" />
                <PropertyRow label="AnimationId">
                    <StringInput value={p.AnimationId} onChange={(v) => onChange('AnimationId', v)} />
                </PropertyRow>
             </>
        )}

        {/* TRANSFORM SECTION (Part, Model, Camera) */}
        {(isPart || isModel || isCamera || isAttachment) && (
            <>
                <SectionHeader title="Transform" />
                {isCamera && (
                    <PropertyRow label="FieldOfView">
                        <NumberInput value={p.FieldOfView} onChange={(v) => onChange('FieldOfView', v)} />
                    </PropertyRow>
                )}
                {(isPart || isModel || isAttachment) && (
                    <>
                        {/* Attachments often just have position relative to parent in Studio */}
                        <PropertyRow label="Position">
                            <VectorInput value={p.Position} onChange={(v) => onChange('Position', v)} />
                        </PropertyRow>
                        <PropertyRow label="Orientation">
                            <VectorInput value={p.Orientation} onChange={(v) => onChange('Orientation', v)} />
                        </PropertyRow>
                    </>
                )}
                {(isPart || isModel) && (
                    <PropertyRow label="Size">
                        <VectorInput value={p.Size} onChange={(v) => onChange('Size', v)} />
                    </PropertyRow>
                )}
            </>
        )}

        {/* BEHAVIOR SECTION */}
        {(isPart || isSound || isScript) && (
            <>
                <SectionHeader title="Behavior" />
                {isPart && (
                    <>
                        <PropertyRow label="Anchored">
                            <BoolInput value={p.Anchored} onChange={(v) => onChange('Anchored', v)} />
                        </PropertyRow>
                        <PropertyRow label="CanCollide">
                            <BoolInput value={p.CanCollide} onChange={(v) => onChange('CanCollide', v)} />
                        </PropertyRow>
                    </>
                )}
                {isScript && (
                    <PropertyRow label="Disabled">
                         <BoolInput value={p.Disabled} onChange={(v) => onChange('Disabled', v)} />
                    </PropertyRow>
                )}
                {isSound && (
                    <>
                        <PropertyRow label="Playing">
                            <BoolInput value={p.Playing} onChange={(v) => onChange('Playing', v)} />
                        </PropertyRow>
                        <PropertyRow label="Looped">
                            <BoolInput value={p.Looped} onChange={(v) => onChange('Looped', v)} />
                        </PropertyRow>
                        <PropertyRow label="SoundId">
                             <StringInput value={p.SoundId} onChange={(v) => onChange('SoundId', v)} />
                        </PropertyRow>
                        <PropertyRow label="Volume">
                             <NumberInput value={p.Volume} onChange={(v) => onChange('Volume', v)} />
                        </PropertyRow>
                    </>
                )}
            </>
        )}

      </div>
    </div>
  );
};