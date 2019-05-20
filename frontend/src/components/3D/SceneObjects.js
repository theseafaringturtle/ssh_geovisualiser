import * as BABYLON from "@babylonjs/core/index";
import {EARTH_RADIUS} from "../../config";

export function createBorders(scene) {
  let borderSphere = BABYLON.Mesh.CreateSphere("borderSphere", 100, EARTH_RADIUS * 2, scene);
  borderSphere.position = new BABYLON.Vector3(0, 0, 0);
  let bordersMaterial = new BABYLON.StandardMaterial("bordermat", scene);
  bordersMaterial.diffuseTexture = new BABYLON.Texture('assets/earth_borders.png', scene);
  invertTexture(bordersMaterial.diffuseTexture);
  bordersMaterial.diffuseTexture.hasAlpha = true;
  bordersMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  borderSphere.material = bordersMaterial;
  borderSphere.rotation.y = Math.PI;
  return borderSphere;
}

export function createEarth(scene){
  let sphere = BABYLON.Mesh.CreateSphere("earthSphere", 100.0, EARTH_RADIUS * 2, scene);
  sphere.position = new BABYLON.Vector3(0, 0, 0);
  sphere.rotation.y = Math.PI;

  let earthMaterial = new BABYLON.StandardMaterial("earth", scene);
  earthMaterial.diffuseTexture = new BABYLON.Texture('assets/earth_day.jpg', scene);
  invertTexture(earthMaterial.diffuseTexture);
  earthMaterial.bumpTexture = new BABYLON.Texture('assets/earth_normal.png', scene);
  invertTexture(earthMaterial.bumpTexture);
  earthMaterial.specularTexture = new BABYLON.Texture('assets/earth_spec.png', scene);
  invertTexture(earthMaterial.specularTexture);
  earthMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
  earthMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
  earthMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.8);
  sphere.material = earthMaterial;
  return sphere;
}

function invertTexture(texture){
  texture.vScale = -1;
  texture.uScale = -1;
  texture.vOffset = -0.003;
}

export function createFire(coordinates, scene){

  let flare = BABYLON.Mesh.CreateSphere("flare", 1, 1, scene);
  flare.visibility = 0;
  flare.position = coordinates;
  flare.isPickable = true;

  let fireSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

  fireSystem.particleTexture = new BABYLON.Texture("./assets/fire.png", scene);

  // Where the particles come from
  fireSystem.emitter = flare; // the starting object, the emitter
  fireSystem.minEmitBox = new BABYLON.Vector3(-0.1, 0.5, -0.1); // Starting all from
  fireSystem.maxEmitBox = new BABYLON.Vector3( 0.1, 0.5, 0.1); // To...

  fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 0.7);
  fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 0.7);
  fireSystem.colorDead = new BABYLON.Color4(0.1, 0, 0, 0.1);

  // Size of each particle (random between...
  fireSystem.minSize = 0.2;//0.3
  fireSystem.maxSize = 0.5;//1
  // Life time of each particle (random between...
  fireSystem.minLifeTime = 0.2;//0.2
  fireSystem.maxLifeTime = 0.3;//0.4

  fireSystem.emitRate = 200;//600;
  // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
  fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  fireSystem.gravity = new BABYLON.Vector3(flare.position.x, flare.position.y, flare.position.z);

  fireSystem.minAngularSpeed = 0;
  fireSystem.maxAngularSpeed = Math.PI;

  fireSystem.minEmitPower = 1;
  fireSystem.maxEmitPower = 1;
  fireSystem.updateSpeed = 0.007;

  fireSystem.start();
  return flare;
}