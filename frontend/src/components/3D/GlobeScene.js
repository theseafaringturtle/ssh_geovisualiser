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
  setCameraTarget(cor){
    // if(this.scene)
    //   this.scene.activeCamera.focusOn(new BABYLON.Vector3(cor[0],cor[2],cor[1]));
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
    this.info.width = this.isLargeScreen() ? 0.25 : 0.35;
    this.info.height = this.isLargeScreen() ? "65px" : "80px";
    this.info.color = "red";
    this.info.background = "yellow";
    this.info.isVisible = false;
    this.info.linkOffsetX = 80;
    this.info.linkOffsetY = -50;
    advancedTexture.addControl(this.info);

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
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, (ev) => {
          flare.hovering = true;
          this.info.isVisible = 1;
          this.info.linkWithMesh(flare);
          this.info.textBlock.text = `${jsonObj.ip}\n${jsonObj.city}\n${jsonObj.country}`;
        }));
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev) => {
          this.info.isVisible = 1;
          //todo fade timeout
          this.info.linkWithMesh(flare);
          this.info.textBlock.text = `${jsonObj.ip}\n${jsonObj.city}\n${jsonObj.country}`;
        }));
      flare.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, (ev) => {
          flare.hovering = false;
          this.info.isVisible = false;
        }));
    });
  }
}