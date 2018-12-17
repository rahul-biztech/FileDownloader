// @flow
import React, {Component, Fragment} from "react";
import {Link} from "react-router-dom";
import routes from "../constants/routes";
import {ipcRenderer} from "electron";
import {showLog} from "../utils/Utils";
import {extractOrders} from "../controller/OrderManager/OdrMgr";
import {Line} from 'rc-progress';
import { START_DOWNLOAD, DOWNLOAD_DONE } from "../utils/Constants";
import { DOWNLOAD_PROGRESS } from "electron-updater";

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Typography } from "@material-ui/core";

type Props = {};
let interval;

const styles = theme => ({
    root: {
        width: '100%',
        height: 500,
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
        overflowY: 'auto'
    },
    table: {
        minWidth: 700,
        minHeight: 300,
    },
    progress: {
        width: '50%',
        height: '30%',
        minWidth: 300,
        minHeight: 100,
        padding: 20
    }
});

class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            downloadResult : {
                passed: 0,
                failed: 0,
                processed: 0
            },
            orderRecords: []
        }

        ipcRenderer.removeAllListeners([DOWNLOAD_DONE, DOWNLOAD_PROGRESS]);

        ipcRenderer.on(DOWNLOAD_DONE, (event, result) => {
            let pass = result.pass.sort(function(a, b){return a - b});
            let fail = result.fail.sort(function(a, b){return a - b});
            showLog(pass);
            showLog(fail);
            let processedFiles = result.processedFiles;
            this.setState({
                downloadResult: {
                    passed: result.passed,
                    failed: result.failed,
                    "processed": result.processed
                },
                orderRecords: processedFiles
            });
        });

        ipcRenderer.on(DOWNLOAD_PROGRESS, (event, result) => {
            showLog(result);
            const type = result.type;
            const value = result.value;
            const {downloadResult} = this.state;
            const {orderRecords} = this.state;
            let processedFiles = result.processedFiles;

            let finalResult = this.arrayUnique(orderRecords.concat(processedFiles));
            //console.log(finalResult);

            this.setState({
                downloadResult: {
                    ...downloadResult,
                    [type]: value,
                    'processed': result.processed
                },
                orderRecords: finalResult
            })
            /* this.setState({
                downloadResult: {
                    ...downloadResult,
                    [type]: value,
                    'processed': result.processed
                }
            }); */
        });
    }

    arrayUnique = (array) => {
        var a = array.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i].url === a[j].url){
                    a[i].downloadStatus = a[j].downloadStatus;
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }

    componentDidMount() {
        this.fetchOrders();
        clearInterval(interval);
        interval = setInterval(this.fetchOrders, 30 * 60 * 1000);
    }

    async componentWillUnmount() {
        clearInterval(interval);
        await ipcRenderer.removeAllListeners([DOWNLOAD_DONE, DOWNLOAD_PROGRESS]);
    }

    fetchOrders = () => {
        extractOrders().then(result => {
            let merged = [].concat.apply([], result);
            let files = [].concat(merged);
            this.setState({orderRecords: files})
            ipcRenderer.send(START_DOWNLOAD, {files: files});
        });
    };

    render() {
        const {downloadResult, orderRecords} = this.state;
        const { classes } = this.props;

        const getTableHeader = (
            <TableRow>
                <TableCell numeric>Sr. No.</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Order Id</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Download Status</TableCell>
            </TableRow>
        )

        const getOrderRows = (
            orderRecords.map((order, index) => {
                return(
                    <TableRow key={index}>
                        <TableCell numeric>{index+1}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{order.orderId}</TableCell>
                        <TableCell>{order.sku}</TableCell>
                        <TableCell>{order.fileName}</TableCell>
                        <TableCell>{order.extension}</TableCell>
                        {
                            order.downloadStatus === 'Downloaded' 
                            ?   <TableCell>
                                    <Typography color='primary'>{order.downloadStatus}</Typography>
                                </TableCell>
                            :   <TableCell>
                                    <Typography color='default'>{order.downloadStatus}</Typography>
                                </TableCell>
                        }
                        
                    </TableRow>
                )
            })
        );

        const getDefaultRows = (
            <TableRow>
                <TableCell component="th" scope="row">
                    Please wait...
                </TableCell>
            </TableRow>
        )

        let tableData = orderRecords ? getOrderRows : getDefaultRows;

        return(
            <Fragment>
                <Paper className={classes.progress}>
                    <Typography>Downloaded: {downloadResult.passed+"%"}</Typography>
                    <Line percent={downloadResult.passed}  strokeWidth="4" strokeColor="#006400" />
                    <br/>
                    <Typography>Failed: {downloadResult.failed+"%"}</Typography>
                    <Line percent={downloadResult.failed} strokeWidth="4" strokeColor="#FF0000" />
                    <br/>
                    <Typography>Total Processed: {downloadResult.processed+"%"}</Typography>
                    <Line percent={downloadResult.processed} strokeWidth="4" strokeColor="#FF8C00" />
                </Paper>

                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            {getTableHeader}
                        </TableHead>
                        <TableBody>
                            {tableData}
                        </TableBody>
                    </Table>
                </Paper>
            </Fragment>
        );

        /* return (
            <div className={styles.container} data-tid="container">
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
        ); */
    }
}

export default withStyles(styles)(Home);
