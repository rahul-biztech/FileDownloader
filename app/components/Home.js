// @flow
import React, {Component} from "react";
import {Link} from "react-router-dom";
import routes from "../constants/routes";
import styles from "./Home.css";
import {ipcRenderer} from "electron";
import {showLog} from "../utils/Utils";
import {extractOrders} from "../controller/OrderManager/OdrMgr";
import DB from "../database/db";
import {Line} from 'rc-progress';

type Props = {};
let interval;

export default class Home extends Component < Props > {
    props: Props;

    constructor(props) {
        super(props);

        this.state = {
            db: new DB("rv911"),
            downloadResult : {
                passed: 0,
                failed: 0,
                processed: 0
            }
        }

        ipcRenderer.removeAllListeners(['rv911-done', 'rv911-progress']);

        ipcRenderer.on("rv911-done", (event, result) => {
            let pass = result.pass.sort(function(a, b){return a - b});
            let fail = result.fail.sort(function(a, b){return a - b});
            showLog(pass);
            showLog(fail);
            this.setState({
                downloadResult: {
                    passed: result.passed,
                    failed: result.failed,
                    "processed": result.processed
                }
            })
        });

        ipcRenderer.on("rv911-progress", (event, result) => {
            showLog(result);
            const type = result.type;
            const value = result.value;
            const {downloadResult} = this.state;
            this.setState({
                downloadResult: {
                    ...downloadResult,
                    [type]: value,
                    'processed': result.processed
                }
            });
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
        const {downloadResult} = this.state;
      return (
        <div className={styles.container} data-tid="container">
          <h2>Home</h2>
          <Link to={routes.COUNTER}>to Counter</Link>
          <div><h4>File download status: </h4></div>
          <div>
              <h5>Downloaded: {downloadResult.passed+"%"}</h5>
              <Line percent={downloadResult.passed} strokeWidth="4" strokeColor="#006400" />
          </div>
          <div>
              <h5>Failed: {downloadResult.failed+"%"}</h5>
              <Line percent={downloadResult.failed} strokeWidth="4" strokeColor="#FF0000" />
          </div>
          <div>
              <h5>Total Processed: {downloadResult.processed+"%"}</h5>
              <Line percent={downloadResult.processed} strokeWidth="4" strokeColor="#FF8C00" />
          </div>
        </div>
      );
    }
}
