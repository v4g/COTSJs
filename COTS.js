import * as THREE from './three.module.js';
import {PointSet} from './point-set.js';

init();
animate();
var renderer, scene, camera;
var raycaster, mouse = { x : 0, y : 0 };
var pointSet, interpolatedPoints, pointSelected;
function init() {

    var container = document.createElement( 'div' );
    raycaster = new THREE.Raycaster();
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');
    let p = new PointSet();
    interpolatedPoints = new PointSet(0.5, 0x0000ff);
    pointSet = p;
    p.createPoint( 10, 10);
    p.createPoint( 4.3, 24.6);
    p.createPoint( 28.2, 3.62);
    p.createPoint( 50, 30);
    scene.add(p.group);
    scene.add(interpolatedPoints.group);
    
    window.addEventListener( 'resize', onWindowResize, false );

    renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );

}

//

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    if (interpolatedPoints != null)
    {
        spiralMap();   
    }
    requestAnimationFrame( animate );
    render();
    
}

function render() {

    renderer.render( scene, camera );
}

function raycast ( e ) {

    //1. sets the mouse position with a coordinate system where the center
    //   of the screen is the origin
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera( mouse, camera );    
    let intersected = false;
    //3. compute intersections
    var intersects = raycaster.intersectObjects( pointSet.group.children );
    pointSelected = null;
    for ( var i = 0; i < intersects.length; i++ ) {
        pointSelected = intersects[i].object;
        /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
        */
       intersected = true;
    }
    return intersected;
}
function onMouseDown(e) {
    let intersected = raycast(e);
    if (intersected) {
        renderer.domElement.addEventListener('mousemove', mouseDragPoint);
    }
}

function mouseDragPoint(e){
    if (pointSelected != null){
        
        mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        let target = new THREE.Vector3();
        raycaster.setFromCamera( mouse, camera );    
        raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,-1), 0), target)
        pointSelected.position.copy(target);
    }
}

function onMouseUp(e) {
    renderer.domElement.removeEventListener('mousemove', mouseDragPoint);    
}

function spiralAngle(A, B, C, D) {
    let v1 = new THREE.Vector3().subVectors(B, A);
    let v2 = new THREE.Vector3().subVectors(D, C);
    let a = v1.angleTo(v2);
    if (v1.cross(v2).dot(new THREE.Vector3(0,0,1)) < 0)
        a = -a;
    return a
}

function spiralScale(A, B, C, D) {
    let v1 = new THREE.Vector3().subVectors(B, A);
    let v2 = new THREE.Vector3().subVectors(D, C);
    return v2.length()/v1.length();
}

function spiralParams(A, B, C, D)  // computes center of spiral that takes A to C and B to D
{
  let a = spiralAngle(A,B,C,D); 
  let z = spiralScale(A,B,C,D);
  let params = {a, z, c:spiralCenterFromParams(a,z,A,C)};
  return params;
}
 
function spiralCenterFromParams(a, z, A, C) 
{
    let c=Math.cos(a);
    let s=Math.sin(a);
    let W = new THREE.Vector3(z*c-1, z*s, 0);
    let d = W.dot(W);
    let CA = new THREE.Vector3().subVectors(A, C);
    let V = new THREE.Vector3(W.dot(CA),det(W,CA),0);
    V.multiplyScalar(1/d);
    return new THREE.Vector3().addVectors(A, V);
}

function det(A, B) {
    let x = A.x * B.y - B.x * A.y;
    return x;
}
function spiral(){
    interpolatedPoints.deleteAll();
    let A = pointSet.getPoint(0);
    let B = pointSet.getPoint(1);
    let C = pointSet.getPoint(2);
    let D = pointSet.getPoint(3);
    let params = spiralParams(pointSet.getPoint(0), pointSet.getPoint(1), pointSet.getPoint(2), pointSet.getPoint(3))
    interpolatedPoints.createPoint(params.c.x, params.c.y);
    drawSpiral(interpolatedPoints, params.a, params.z, params.c, pointSet.getPoint(0), pointSet.getPoint(1));
    
}
function spiralMap(){
    interpolatedPoints.deleteAll();
    let A = pointSet.getPoint(0);
    let B = pointSet.getPoint(1);
    let C = pointSet.getPoint(2);
    let D = pointSet.getPoint(3);
    let params1 = spiralParams(pointSet.getPoint(0), pointSet.getPoint(1), pointSet.getPoint(2), pointSet.getPoint(3))
    let params2 = spiralParams(pointSet.getPoint(0), pointSet.getPoint(2), pointSet.getPoint(1), pointSet.getPoint(3))
    interpolatedPoints.createPoint(params1.c.x, params1.c.y);
    interpolatedPoints.createPoint(params2.c.x, params2.c.y);
    // drawSpiral(interpolatedPoints, params1.a, params1.z, params1.c, pointSet.getPoint(0), pointSet.getPoint(1));
    // drawSpiral(interpolatedPoints, params2.a, params2.z, params2.c, pointSet.getPoint(0), pointSet.getPoint(2));
    drawSpiralMap(interpolatedPoints, params1.a, params1.z, params2.a, params2.z, params1.c, pointSet.getPoint(0));
    
}
function drawSpiral(p, a, z, F, A, B) {
    // using the parameters, interpolate t from 0 to 1
    // and find the position of A and B 
    // which is given by the formula Anew = F + z^t * FA * r (at)
    for(let t = 0 ;t < 1; t+=0.1) {
        let Anew = transform(a,z,F,A,t);
        p.createPoint(Anew.x, Anew.y);
        
        let Bnew = transform(a,z,F,B,t);
        p.createPoint(Bnew.x, Bnew.y);
        
    }
}

function drawSpiralMap(p, a1, z1, a2, z2, F, A) {
    // using the parameters, interpolate t from 0 to 1
    // and find the position of A and B 
    // which is given by the formula Anew = F + z^t * FA * r (at)
    for(let u = 0 ;u < 1; u+=0.1) {
        for(let v = 0 ;v < 1; v+=0.1) {
            let Anew = transform(a1,z1,F,A,u);
            let Bnew = transform(a2,z2,F,Anew,v);
            p.createPoint(Bnew.x, Bnew.y);
        }    
    }
}

function transform(a,z,F,A,t) {
    // which is given by the formula Anew = F + z^t * FA * r (at)
    let FA = new THREE.Vector3().subVectors(A, F);
    let rotated = FA.applyAxisAngle(new THREE.Vector3(0,0,1), t * a);
    let scaled = rotated.multiplyScalar(Math.pow(z,t));
    let Anew = new THREE.Vector3().addVectors(F, scaled);
    return Anew; 
}
