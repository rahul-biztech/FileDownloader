// @flow
import React, {Component} from "react";
import {Link} from "react-router-dom";
import routes from "../constants/routes";
import styles from "./Home.css";
import {ipcRenderer} from "electron";
import {showLog} from "../utils/Utils";
import {extractOrders} from "../controller/OrderManager/OdrMgr";

type Props = {};
let interval;

export default class Home extends Component < Props > {
    props: Props;

    constructor(props) {
        super(props);
        ipcRenderer.on("rv911-done", (event, file) => {
            showLog(file);
        });
    }

    componentDidMount() {
        this.fetchOrders();
        clearInterval(interval);
        interval = setInterval(this.fetchOrders, 2 * 60 * 1000);
    }

    componentWillUnmount() {
        showLog("componentWillUnmount");
        clearInterval(interval);
    }

    fetchOrders = () => {
        extractOrders().then(result => {
            let merged = [].concat.apply([], result);
            let files = [].concat(merged);
            showLog(files);
            ipcRenderer.send("downloadFiles", {files: files});
        });
    };

    render() {
      return (
        <div className={styles.container} data-tid="container">
          <h2>Home</h2>
          <Link to={routes.COUNTER}>to Counter</Link>
        </div>
      );
    }
}
