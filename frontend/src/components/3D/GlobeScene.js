import * as BABYLON from "@babylonjs/core";
import {AdvancedDynamicTexture, Button} from "@babylonjs/gui/index";
import {createBorders, createEarth, createFire} from './SceneObjects'
import {EARTH_RADIUS, UPDATE_TIME} from "../../config";

export default class GlobeScene {

  constructor() {
    this.scene = null;
    this.flares = [];
    this.host = null;
  }

  isLargeScreen() {
    return window.innerWidth > 900;
  }

  setCameraTarget(index) {
    if (this.scene) {
      if(this.flares[index]) {
        this.flares[index].showInfo();
      }
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
    let infoButton = this.info;
    scene.registerBeforeRender(function () {
      animateCameraToTarget(scene, infoButton);
    });

    borderSphere.actionManager = new BABYLON.ActionManager(scene);
    borderSphere.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (ev) => {
        this.info.isVisible = false;
      }));

    this.scene = scene;
    engine.runRenderLoop(() => {
      if (!document.hasFocus)
        return;
      const currentTime = new Date().getTime();
      this.flares.forEach(flare => {
        if (flare.TTL < currentTime) {
          flare.dispose();
          if (flare.line)
            flare.line.dispose();
          if (flare.hovering)
            this.info.isVisible = false;
        }
      });
      this.flares = this.flares.filter(flare => {
        return !flare.isDisposed()
      });
      if (scene) {
        scene.render();
      }
    });
  };

  displayServer = (serverObj) => {
    let position = new BABYLON.Vector3(serverObj.cartesian[0],
      serverObj.cartesian[2], serverObj.cartesian[1]);
    //todo pc mesh
    this.host = createFire(position, this.scene);
    this.host.showInfo = () => {
      this.info.isVisible = false;
      this.info.linkWithMesh(this.host);
      this.info.textBlock.text = `${serverObj.ip}\nSERVER`;
    };
    this.setActions(this.host);
  };

  displayData = (jsonArr) => {
    if(!this.host)
      return false;
    jsonArr.forEach(jsonObj => {
      let position = new BABYLON.Vector3(jsonObj.cartesian[0],
        jsonObj.cartesian[2], jsonObj.cartesian[1]);
      // debugger;
      let flare = createFire(position, this.scene);
      flare.TTL = new Date().getTime() + UPDATE_TIME + 1000;
      this.flares.push(flare);
      flare.showInfo = () => {
        this.info.isVisible = false;
        this.info.linkWithMesh(flare);
        this.info.textBlock.text = `${jsonObj.ip}\n${jsonObj.city}\n${jsonObj.country}`;
      };
      this.setActions(flare);
      console.log("Getting curve for "+jsonObj.city)
      flare.line = getCurveBetweenPoints(this.host.position.scale(1.01), flare.position.scale(1.01), this.scene);
      return true;
    });
  };
  setActions = flare => {
    flare.hovering = false;
    flare.actionManager = new BABYLON.ActionManager(this.scene);
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
  }
}

// adapted from http://www.html5gamedevs.com/topic/19683-convert-position-to-alpha-beta-for-arcrotatecamera/
// now radius independent
function animateCameraToTarget(scene, infoButton) {
  if (scene.targetCameraPosition && scene.activeCamera) {
    let direction = scene.targetCameraPosition.subtract(scene.activeCamera.position);
    // let distance = direction.length();
    let angle = BABYLON.Vector3.GetAngleBetweenVectors(scene.targetCameraPosition, scene.activeCamera.position, BABYLON.Vector3.Zero());
    console.log(angle)
    if (Math.abs(angle) > 0.1) {
      // set new camera - move camera in small steps based on the direction vector
      scene.activeCamera.setPosition(scene.activeCamera.position.add(direction.normalize().scale(8)));
      // scene.activeCamera.radius = 100;
    } else {
      // target position reached
      scene.targetCameraPosition = null;
      // fix for buttons in wrong position: show them only at the end of the transition
      infoButton.isVisible = true;
    }
  }
}

// assumes that the vectors start from the origin, which is the center of the sphere
function getCurveBetweenPoints(point1, point2, scene){

  let origin = BABYLON.Vector3.Zero();
  let derp = BABYLON;
  ////DEBUG
  // let l1 = BABYLON.Mesh.CreateLines("l1", [origin, point1], scene);
  // l1.color = new BABYLON.Color3(1, 1, 0.5);
  // let l2 = BABYLON.Mesh.CreateLines("l2", [origin, point2], scene);
  // l2.color = new BABYLON.Color3(1, 0, 0.5);
  ////
  let controlPoint1;
  let controlPoint2;
  let numPoints;

  let angle = Math.abs(BABYLON.Vector3.GetAngleBetweenVectors(
    point1, point2, BABYLON.Vector3.Zero()));
  if(angle < Math.PI / 4){
    controlPoint1 = point1.scale(1.1);
    controlPoint2 = point2.scale(1.1);
    numPoints = 15;
  }
  else {
    let angleRatio = Math.min(angle / Math.PI, 0.75);
    let distance = BABYLON.Vector3.Distance(point1, point2);
    let len = angleRatio * distance;//
    console.log(len)
    // len = Math.max(Math.min(EARTH_RADIUS, len), 1);
    let perpendicularToBoth = BABYLON.Vector3.Cross(point1, point2).normalize().scale(len);
    //debugger;
    let tangent1 = BABYLON.Vector3.Cross(perpendicularToBoth, point1).normalize().scale(len);
    controlPoint1 = tangent1.add(point1);
    let tangent2 = BABYLON.Vector3.Cross(point2, perpendicularToBoth).normalize().scale(len);
    controlPoint2 = tangent2.add(point2);
    numPoints = 25;
    ///DEBUG
    // let p1 = BABYLON.Mesh.CreateLines("perp", [point1, perpendicularToBoth.add(point1)], scene);
    // p1.color = new BABYLON.Color3(1, 0.5, 0.8)
    // BABYLON.Mesh.CreateLines("tangent1", [point1, tangent1.add(point1)], scene)
    // BABYLON.Mesh.CreateLines("control1", [point2, perpendicularToBoth.add(point2)], scene).color = new BABYLON.Color3(1, 0.5, 0.8);;
    // BABYLON.Mesh.CreateLines("tngent2", [point2,tangent2.add(point2)], scene).color = BABYLON.Color3.Red();
  }

  let curve = new BABYLON.Curve3.CreateCubicBezier(point1,controlPoint1, controlPoint2, point2, numPoints);
  let curveMesh = BABYLON.Mesh.CreateLines("curve", curve.getPoints(),scene);
  curveMesh.color = new BABYLON.Color3(0.5, 0.8, 0.9);
  return curveMesh;
}