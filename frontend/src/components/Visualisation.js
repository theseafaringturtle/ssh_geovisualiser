import * as React from 'react';
import {BACKEND_URL, EARTH_RADIUS, UPDATE_TIME} from "../config";
import '../App.css';
import GlobeScene from "./3D/GlobeScene";
import DataList from "./DataList";
import BabylonScene from './SceneComponent';
import swal from 'sweetalert'


export default class Visualisation extends React.Component {

  constructor(props) {
    super(props);
    this.scene = new GlobeScene();
    this.dataListRef = React.createRef();
    this.fetchServer();
    this.fetchData();
    setInterval(this.fetchData, UPDATE_TIME);
  }

  fetchServer = () => {
    fetch(`${BACKEND_URL}/server?radius=` + (EARTH_RADIUS)).then(resp => {
        return testSv;//todo test
      }
    ).then(jsonRes => {
      if(jsonRes.error){
        swal("Error", jsonRes.error, "error");
        console.log(jsonRes.error);
        return;
      }
      console.log(jsonRes);
      this.scene.displayServer(jsonRes);
      this.dataListRef.current.setState({server: jsonRes});
      // this.setCameraTarget(0);
    }).catch(error => {
      console.error(error)
    });
  };

  fetchData = () => {
    fetch(`${BACKEND_URL}/data?radius=` + (EARTH_RADIUS)).then(resp => {
        return testArr;//todo test
      }
    ).then(jsonRes => {
      if(jsonRes.error){
        swal("Error", jsonRes.error, "error");
        console.log(jsonRes.error);
        return;
      }
      // console.log(jsonRes);
      let result = this.scene.displayData(jsonRes);
      //todo switch to sockets
      this.dataListRef.current.setState({data: jsonRes});
    }).catch(error => {
      console.error(error)
    });
  };

  setCameraTarget = (index) => {
    if(this.scene)
      this.scene.setCameraTarget(index);
  };

  render() {
    return (
    <div style={{verticalAlign: "top"}}>
      <div id="globeContainer">
        <BabylonScene onSceneMount={this.scene.onSceneMount} />
    </div>
      <DataList id="dataList" itemSelected={this.setCameraTarget} ref={this.dataListRef} />
    </div>
    )
  }
}
var testSv =
  {
    "country": "France",
    "city": "Gravelines",
    "cartesian": [
      34.5984226367739,
      1.2841100474131453,
      42.735233852563674
    ],
    "proxy": false
  };

var testArr =
  [
    {
      "country": "Op1",
      "city": "City1",
      "ip": "66.66.66.66",
      "terminals": [
        [
          "5136",
          "lee",
          "pts"
        ],
        [
          "5855",
          "lee",
          "notty"
        ]
      ],
      "cartesian": [
        // 27.5,
        // 0,
        // 47.63139721
        -34.5984226367739,
        -1.2841100474131453,
        -42.735233852563670
      ]
    },
    {
      "country": "Op2",
      "city": "City2",
      "ip": "33.33.33.33",
      "terminals": [
        [
          "5136",
          "lee",
          "pts"
        ]
      ],
      "cartesian": [
        27.5,
        0,
        47.63139721
      ]
    },
    {
      "country": "Op3",
      "city": "City3",
      "ip": "99.99.99.99",
      "terminals": [
        [
          "5136",
          "lee",
          "pts"
        ]
      ],
      "cartesian": [
        -42.13244437,
        -35.35331853,
        0
      ]
    }
  ];
