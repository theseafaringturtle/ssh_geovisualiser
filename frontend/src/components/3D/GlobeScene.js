import * as BABYLON from "@babylonjs/core";
import {AdvancedDynamicTexture, Button} from "@babylonjs/gui/index";
import {createBorders, createEarth, createFire} from './SceneObjects'
import {UPDATE_TIME} from "../../config";

export default class GlobeScene {

  constructor(){
    this.scene = null;
    this.flares = [];
  }
  isLargeScreen(){
    return window.innerWidth > 900;
  }
  setCameraTarget(index){
    if(this.scene) {
      this.flares[index].showInfo();
      //no need to subtract the earth's position since it is at the origin
      this.scene.targetCameraPosition = this.flares[index].position.scale(1);
    }
  }

  onSceneMount = (e) => {
    const {canvas, scene, engine} = e;

    scene.clearColor = new BABYLON.Color3(0.03, 0.03, 0.2);

    //allow picking invisible objects (flares in this case)
    scene.pointerDownPredicate = (mesh) => {
      return mesh.isPickable && mesh.isReady();
    };
    // Camera
    let camera = new BABYLON.ArcRotateCamera("Camera", -1.57, 1.0, 100, new BABYLON.Vector3.Zero(), scene);
    camera.lowerRadiusLimit = this.isLargeScreen() ? 105 : 80;
    camera.upperRadiusLimit = 180;
    camera.radius = 150;
    camera.pinchPrecision = this.isLargeScreen() ? 12 : 20;
    camera.angularSensibilityX = this.isLargeScreen() ? 1000 : 2400;
    camera.angularSensibilityX = this.isLargeScreen() ? 1000 : 2450;
    camera.attachControl(canvas);

    let light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, 0, 0), scene);
    light.specular = new BABYLON.Color3(0.05, 0.2, 0.4);
    // light.intensity = 0.7;

    let options = {
      alphaBlendingMode: 2,
      blurHorizontalSize: 1,
      blueTextureSizeRatio: 0.5,
      blurVerticalSize: 1,
      mainTextureRatio: 0.25
    };
    let hl = new BABYLON.HighlightLayer("hg", scene, options);

    let borderSphere = createBorders(scene);
    hl.addExcludedMesh(borderSphere);

    let earthSphere = createEarth(scene);
    hl.addMesh(earthSphere, new BABYLON.Color3(0.7, 0.95, 1));

    let advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.info = Button.CreateSimpleButton("but", "Click Me");
    this.info.width = this.isLargeScreen() ? 0.25 : 0.4;
    this.info.height = this.isLargeScreen() ? "65px" : "80px";
    this.info.color = "red";
    this.info.background = "yellow";
    this.info.isVisible = false;
    this.info.linkOffsetX = 80;
    this.info.linkOffsetY = -50;
    advancedTexture.addControl(this.info);

    scene.targetCameraPosition = null;
    scene.registerBeforeRender(function () {
      animateCameraToTarget(scene);
    });

    borderSphere.actionManager = new BABYLON.ActionManager(scene);
    borderSphere.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev) => {
        this.info.isVisible = false;
      }));

    this.scene = scene;
    engine.runRenderLoop(() => {
      if(!document.hasFocus)
        return;
      const currentTime = new Date().getTime();
      this.flares.forEach(flare => {
        if (flare.TTL < currentTime) {
          flare.dispose();
          if (flare.hovering)
            this.info.isVisible = false;
        }
      });
      this.flares = this.flares.filter(flare => {return !flare.isDisposed()});
      if (scene) {
        scene.render();
      }
    });
  };

  displayData = (jsonRes) => {
    jsonRes.forEach(jsonObj => {
      let position =  new BABYLON.Vector3(jsonObj.cartesian[0],
        jsonObj.cartesian[2], jsonObj.cartesian[1]);
      // debugger;
      let flare = createFire(position, this.scene);
      flare.TTL = new Date().getTime() + UPDATE_TIME + 1000;
      this.flares.push(flare);
      flare.hovering = false;
      flare.actionManager = new BABYLON.ActionManager(this.scene);
      flare.showInfo = () => {
        this.info.isVisible = 1;
        this.info.linkWithMesh(flare);
        this.info.textBlock.text = `${jsonObj.ip}\n${jsonObj.city}\n${jsonObj.country}`;
      };
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, (ev) => {
          flare.hovering = true;
          flare.showInfo();
        }));
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev) => {
          flare.showInfo();
        }));
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, (ev) => {
          flare.hovering = false;
          this.info.isVisible = false;
        }));
    });
  }
}

// adapted from http://www.html5gamedevs.com/topic/19683-convert-position-to-alpha-beta-for-arcrotatecamera/
// now radius independent
function animateCameraToTarget(scene) {
  if (scene.targetCameraPosition && scene.activeCamera) {
    let direction = scene.targetCameraPosition.subtract(scene.activeCamera.position);
    // let distance = direction.length();
    let angle =BABYLON.Vector3.GetAngleBetweenVectors(scene.targetCameraPosition, scene.activeCamera.position, BABYLON.Vector3.Zero());
    if (Math.abs(angle) > 0.1) {
      // set new camera - move camera in small steps based on the direction vector
      scene.activeCamera.setPosition(scene.activeCamera.position.add(direction.normalize().scale(2)));
      // scene.activeCamera.radius = 100;
    } else {
      // target position reached
      scene.targetCameraPosition = null;
    }
  }
}