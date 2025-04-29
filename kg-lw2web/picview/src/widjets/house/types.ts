export type Vector3 = [number, number, number];
export type Color = [number, number, number, number];

export interface Mesh {
  vertices: number[];
  normals: number[];
  texCoords: number[];
  indices: number[];
}

export interface Object3D {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  mesh: Mesh;
  texture: string;
  color?: Color;
}