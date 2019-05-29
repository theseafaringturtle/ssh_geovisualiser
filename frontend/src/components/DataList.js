import * as React from "react";
import {Card, CardBody, CardTitle, CardText, Button } from "reactstrap";

export default class DataList extends React.Component {

  state = {
    data: [],
  };

  render() {
    return (
      <div id="dataList">
        {this.state.data.map((el, ind) => {
          return (
              <Card key={ind} className="dataCard">
                <CardBody className="dataCardBody">
                  <CardTitle>{el.ip} </CardTitle>
                  <CardText className="detailText" >{el.city}, &nbsp; {el.country} &nbsp;</CardText>
                  <Button onClick={() => {return this.props.itemSelected(ind)}} style={{float: "left"}}>View</Button>
                </CardBody>
              {/*<p className="detailText">{el.country}</p> &nbsp;*/}
              {/*<p className="detailText">{el.city}</p> &nbsp;*/}
              {/*<p className="detailText">{el.ip}</p> &nbsp;*/}
              </Card>
          )
        })}
      </div>
    )
  }
}
/*
[
    {
        "country": "Italy",
        "city": "Busto Arsizio",
        "ip": "130.25.193.243",
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
            38.015776875757425,
            5.918516250776332,
            39.30358601860552
        ]
    }
]
 */