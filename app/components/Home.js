// @flow
import React, {Component} from "react";
import {Link} from "react-router-dom";
import routes from "../constants/routes";
import styles from "./Home.css";
import {ipcRenderer} from "electron";
import {showLog} from "../utils/Utils";
import {extractOrders} from "../controller/OrderManager/OdrMgr";
import DB from "../database/db";

type Props = {};
let interval;

export default class Home extends Component < Props > {
    props: Props;

    constructor(props) {
        super(props);

        this.state = {
            db: new DB("rv911")
        }

        ipcRenderer.on("rv911-done", (event, file) => {
            let pass = file.pass.sort(function(a, b){return a - b});
            let fail = file.fail.sort(function(a, b){return a - b});
            showLog(pass);
            showLog(fail);
            alert('Congratulations, All files are downloaded successfully!');
        });

        ipcRenderer.on("rv911-progress", (event, result) => {
            showLog(result);
        });
    }

    componentDidMount() {
        showLog(this.state.db.getAllPendingFiles());
        this.fetchOrders();
        clearInterval(interval);
        interval = setInterval(this.fetchOrders, 30 * 60 * 1000);
    }

    componentWillUnmount() {
        clearInterval(interval);
        ipcRenderer.removeAllListeners(['rv911-done', 'rv911-progress']);
    }

    fetchOrders = () => {
        extractOrders().then(result => {
            let merged = [].concat.apply([], result);
            let files = [].concat(merged);
            ipcRenderer.send("downloadFiles", {files: files});
            showLog(this.state.db.createPendingFile(files));
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
