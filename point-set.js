import * as THREE from './three.module.js';

export class PointSet {
  group = new THREE.Group();
  geometry; material;
  idCount = 0;
  constructor(r=1, color=0xffff00) {
    this.material = new THREE.MeshBasicMaterial( {color} );
    this.geometry = new THREE.CircleBufferGeometry(r);
    } 
  
  createPoint(x, y) {
    let mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.position.copy(new THREE.Vector3(x,y,0));
    mesh.userData.id = this.idCount;
    this.idCount += 1;
    this.group.add(mesh);
  }
  getPoint(index) {
    return this.group.children[index].position;
  }
  deleteAll(){
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}