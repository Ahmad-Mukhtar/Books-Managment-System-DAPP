import React from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component } from "react";
import {
  faEye,
  faEdit,
  faTrash,
  faUser,
  faList,
  faSignOutAlt,
  faPlus,
  faTachometerAlt,
  faBook,
  faCode,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

import { ToastContainer } from "react-toastify";

import Dashboard from "./components/dashboard";
import BooksListContainer from "./components/book-list-container";
import BookForm from "./components/book-form";
import About from "./components/about";
import NotFound from "./components/not-found";
import Main from "./components/Main";
import UploadBook from "./components/uploadBook";
import DStorage from "./abis/DStorage.json";
import Web3 from "web3";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
}); // leaving out the arguments will default to these values

library.add(faEye);
library.add(faEdit);
library.add(faTrash);
library.add(faUser);
library.add(faTachometerAlt);
library.add(faList);
library.add(faSignOutAlt);
library.add(faPlus);
library.add(faBook);
library.add(faCode);
library.add(faQuestionCircle);

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = DStorage.networks[networkId];
    if (networkData) {
      // Assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address);
      this.setState({ dstorage });
      // Get files amount
      const filesCount = await dstorage.methods.fileCount().call();

      this.setState({ filesCount });
      // Load files&sort by the newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call();
      
        this.setState({
          files: [...this.state.files, file],
        });
      }

     
    } else {
      window.alert("DStorage contract not deployed to detected network.");
    }
  }

  // Get file from user
  captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    const reader = new window.FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({
        // buffer: Buffer(reader.result),
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name,
      });
      console.log("buffer", this.state.buffer);
    };
  };

  uploadFile = (description) => {
    console.log("Submitting file to IPFS...");
    // Add file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      // console.log("IPFS result", result.size);
      if (error) {
        console.error(error);
        return;
      }

      this.setState({ loading: true });
      // Assign value for the file without extension
      if (this.state.type === "") {
        this.setState({ type: "none" });
      }
      // alert(this.state.dstorage.name);
      this.state.dstorage.methods
        .uploadFile(
          result[0].hash,
          result[0].size,
          this.state.type,
          this.state.name,
          description
        )
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({
            loading: false,
            type: null,
            name: null,
          });
          window.location.reload();
        })
        .on("error", (e) => {
          window.alert("Error");
          this.setState({ loading: false });
        });
    });
  };
  
  subscribeFile=(fileid)=>
  {
    console.log("Subscribing...");

    this.state.dstorage.methods
        .subscribe_item(
          fileid
        )
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          window.location.reload();
        })
        .on("error", (e) => {
          window.alert("Error");
        });



  }

  openFile=(file)=>
  {
    console.log("Opening...");

    this.state.dstorage.methods
        .open_file(
          file.fileId
        )
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {

          //navigate here
          window.open("https://ipfs.io/ipfs/"+file.fileHash, '_blank');
         
        })
        .on("error", (e) => {
          window.alert("Error");
        });



  }

  ownFile=(fileid)=>
  {
    console.log("Owning...");

    this.state.dstorage.methods
        .own_File(
          fileid
        )
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          window.location.reload();
        })
        .on("error", (e) => {
          window.alert("Error");
        });



  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      dstorage: null,
      files: [],
      sub_ids:[],
      loading: false,
      type: null,
      name: null,
    };
    this.uploadFile = this.uploadFile.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.subscribeFile=this.subscribeFile.bind(this);
    this.openFile=this.openFile.bind(this);
    this.ownFile=this.ownFile.bind(this);
  }
  render() {
    return (
      <Router>
        <ToastContainer />
        <div className="cont">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <img
              className="app-logo"
              src={logo}
              width="60"
              height="60"
              alt="ReactJS"
            />
            <div className="collpase nav-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/" className="nav-link">
                    <FontAwesomeIcon icon="tachometer-alt" /> Book Store
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/books" className="nav-link">
                    <FontAwesomeIcon icon="book" /> My Books
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/book" className="nav-link">
                    <FontAwesomeIcon icon="plus" /> Upload Book
                  </Link>
                </li>
              </ul>
              {
                <ul className="navbar-nav mr-auto pull-right">
                  <li className="navbar-item">
                    <Link to="/about" className="nav-link">
                      <FontAwesomeIcon icon="question-circle" />
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <a
                      href="https://github.com/nabeelbaghoor"
                      className="nav-link"
                    >
                      <FontAwesomeIcon icon="code" />
                    </a>
                  </li>
                </ul>
              }
            </div>
          </nav>
          
          <div className="content">
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/books" component={BooksListContainer} />
              <Route
                path="/book"
                render={(props) => (
                  <UploadBook
                    loading = {this.state.loading}
                    files={this.state.files}
                    captureFile={this.captureFile}
                    subscribeFile={this.subscribeFile}
                    openFile={this.openFile}
                    ownFile={this.ownFile}
                    uploadFile={this.uploadFile}
                    {...props}
                  />
                )}
              />
              <Route path="/book/:id" component={BookForm} />
              <Route path="/about" component={About} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
