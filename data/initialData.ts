import { ExplorerNode, ClassName } from '../types';

export const initialExplorerData: ExplorerNode[] = [
  {
    id: '1',
    name: 'Workspace',
    className: ClassName.Workspace,
    expanded: true,
    children: [
      { id: '1-1', name: 'Camera', className: ClassName.Camera },
      { id: '1-2', name: 'Terrain', className: ClassName.Terrain },
    ]
  },
  {
    id: '2',
    name: 'Players',
    className: ClassName.Players,
    children: []
  },
  {
    id: '3',
    name: 'Lighting',
    className: ClassName.Lighting,
    children: []
  },
  {
    id: '4',
    name: 'MaterialService',
    className: ClassName.MaterialService,
    children: []
  },
  {
    id: '5',
    name: 'NetworkClient',
    className: ClassName.NetworkClient,
    children: []
  },
  {
    id: '6',
    name: 'ReplicatedFirst',
    className: ClassName.ReplicatedFirst,
    children: []
  },
  {
    id: '7',
    name: 'ReplicatedStorage',
    className: ClassName.ReplicatedStorage,
    children: []
  },
  {
    id: '8',
    name: 'ServerScriptService',
    className: ClassName.ServerScriptService,
    children: []
  },
  {
    id: '9',
    name: 'ServerStorage',
    className: ClassName.ServerStorage,
    children: []
  },
  {
    id: '10',
    name: 'StarterGui',
    className: ClassName.StarterGui,
    children: []
  },
  {
    id: '11',
    name: 'StarterPack',
    className: ClassName.StarterPack,
    children: []
  },
  {
    id: '12',
    name: 'StarterPlayer',
    className: ClassName.StarterPlayer,
    children: [
        { id: '12-1', name: 'StarterCharacterScripts', className: ClassName.Folder },
        { id: '12-2', name: 'StarterPlayerScripts', className: ClassName.Folder },
    ]
  },
  {
    id: '13',
    name: 'Teams',
    className: ClassName.Teams,
    children: []
  },
  {
    id: '14',
    name: 'SoundService',
    className: ClassName.SoundService,
    children: []
  },
  {
    id: '15',
    name: 'TextChatService',
    className: ClassName.TextChatService,
    children: []
  },
];