import * as React from "react";
import {Card, CardBody, CardTitle, CardText, Button } from "reactstrap";

export default class DataList extends React.Component {

  state = {
    data: [],
  };

  render() {
    return (
      <div id="dataList">
        {this.state.data.map(el => {
          return (
              <Card key={el.ip} className="dataCard">
                <CardBody className="dataCardBody">
                  <CardTitle>{el.ip} </CardTitle>
                  <CardText className="detailText" >{el.city}, &nbsp; {el.country} &nbsp;</CardText>
                  <Button onClick={this.props.itemSelected} style={{float: "left"}}>View</Button>
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