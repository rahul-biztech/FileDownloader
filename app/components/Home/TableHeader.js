import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { TableRow, TableCell, Typography } from '@material-ui/core';

const tableHeader = () => (
    <TableRow>
        <TableCell align='center'><Typography>Sr. No.</Typography></TableCell>
        <TableCell><Typography>Order Date</Typography></TableCell>
        <TableCell><Typography>Order Id</Typography></TableCell>
        <TableCell><Typography>SKU</Typography></TableCell>
        <TableCell><Typography>File Name</Typography></TableCell>
        <TableCell><Typography>File Type</Typography></TableCell>
        <TableCell><Typography>Download Status</Typography></TableCell>
    </TableRow>
);

export default tableHeader;
    
