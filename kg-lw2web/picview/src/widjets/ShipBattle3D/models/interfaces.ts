import * as THREE from 'three';

export interface Ship {
  object: THREE.Group;
  speed: number;
  health: number;
  sunk: boolean;
  sinking: boolean;
  sinkProgress: number;
}

export interface Torpedo {
  object: THREE.Object3D;
  direction: THREE.Vector3;
  active: boolean;
}