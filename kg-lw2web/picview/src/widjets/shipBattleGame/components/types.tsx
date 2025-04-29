import * as THREE from 'three';

export type ShipType = {
  id: number;
  type: 'cargo' | 'warship' | 'speedboat';
  position: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  size: number;
  health: number;
  sunk: boolean;
  sinkProgress: number;
};

export type TorpedoType = {
  id: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  speed: number;
  active: boolean;
};