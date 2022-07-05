import React, { Component } from "react";
import Main from "./Main";

class uploadBook extends Component {
  render() {
    return (
        <div>
            {this.props.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            files={this.props.files}
            captureFile={this.props.captureFile}
            uploadFile={this.props.uploadFile}
            openFile={this.props.openFile}
            ownFile={this.props.ownFile}
            subscribeFile={this.props.subscribeFile}
          />
        )}
        </div>
    );
    }
}
export default uploadBook;