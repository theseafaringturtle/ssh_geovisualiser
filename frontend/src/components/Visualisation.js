import * as React from 'react';
import {BACKEND_URL, EARTH_RADIUS, UPDATE_TIME} from "../config";
import '../App.css';
import GlobeScene from "./3D/GlobeScene";
import BabylonScene from './SceneComponent'; // import the component above linking to file we just created.


export default class Visualisation extends React.Component {

  constructor(props){
    super(props);
    this.scene = new GlobeScene();
    this.fetchData();
    setInterval(this.fetchData, UPDATE_TIME);
  }


  fetchData = () => {
    fetch(`${BACKEND_URL}/data?radius=` + (EARTH_RADIUS)).then(resp => {
        return resp.json();
      }
    ).then(jsonRes => {
        console.log(jsonRes);
        //todo remove duplicates
        this.scene.displayData(jsonRes);
        //todo add to list panel on the side
      }).catch(error => console.error(error));
  };

  render() {
    return (
      <div className="globeContainer">
        <BabylonScene onSceneMount={this.scene.onSceneMount}/>
      </div>
    )
  }
}