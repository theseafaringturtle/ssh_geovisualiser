import * as React from 'react';
import {BACKEND_URL, EARTH_RADIUS, UPDATE_TIME} from "../config";
import '../App.css';
import GlobeScene from "./3D/GlobeScene";
import DataList from "./DataList";
import BabylonScene from './SceneComponent';
import {Container, Row, Col} from "reactstrap"


export default class Visualisation extends React.Component {

  constructor(props) {
    super(props);
    this.scene = new GlobeScene();
    this.dataListRef = React.createRef();
    this.fetchData();
    setInterval(this.fetchData, UPDATE_TIME);
  }


  fetchData = () => {
    fetch(`${BACKEND_URL}/data?radius=` + (EARTH_RADIUS)).then(resp => {
        return resp.json();
      }
    ).then(jsonRes => {
      console.log(jsonRes);
      this.scene.displayData(jsonRes);
      this.dataListRef.current.setState({data: jsonRes});
      // this.setCameraTarget(0);
    }).catch(error => console.error(error));
  };

  setCameraTarget = (index) => {
    if(this.scene)
      this.scene.setCameraTarget(index);
  };

  render() {
    return (
    <div style={{verticalAlign: "top"}}>
      {/*<Container style={{width: "100vw", height: "100vh"}}>*/}
      {/*<Row xs={12}>*/}
      {/*<Col xs={6}>*/}
      {/*<div style={{backgroundColor : "red", height: "100vh"}}/>*/}
      {/*</Col>*/}
      {/*</Row>*/}
      <div id="globeContainer">
        <BabylonScene onSceneMount={this.scene.onSceneMount} />
    </div>
      <DataList id="dataList" itemSelected={this.setCameraTarget} ref={this.dataListRef} />
    </div>
    )
  }
}