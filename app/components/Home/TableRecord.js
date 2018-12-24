import React, { Component } from 'react';
import { TableRow, TableCell, Typography } from '@material-ui/core';

const tableRecord = ({index, order}) => (
    <TableRow>
        <TableCell align='center'><Typography>{index+1}</Typography></TableCell>
        <TableCell><Typography>{order.orderDate}</Typography></TableCell>
        <TableCell><Typography>{order.orderId}</Typography></TableCell>
        <TableCell><Typography>{order.sku}</Typography></TableCell>
        <TableCell><Typography>{order.fileName}</Typography></TableCell>
        <TableCell><Typography>{order.extension}</Typography></TableCell>
        {
            order.downloadStatus === 'Downloaded' 
            ?   <TableCell>
                    <Typography 
                        color='primary'
                        onClick={() => this.showFileInSystemDirectory(order.dirPath)}
                        >{order.downloadStatus}</Typography>
                </TableCell>
            :   <TableCell>
                    <Typography color='default'>{order.downloadStatus}</Typography>
                </TableCell>
        }
    </TableRow>
);
export default tableRecord;