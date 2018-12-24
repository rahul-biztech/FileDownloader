import knex1 from 'knex';
import { TABLE_ORDERS } from "./Constants";

export const createOrderTable = (knex) => {
    knex.schema.createTableIfNotExists(TABLE_ORDERS, (table) => {
        table.increments('id');
        table.string('orderId');
        table.string('orderDate');
        table.string('name');
        table.string('sku');
        table.string('url');
        table.string('dirName')
        table.string('fileName')
        table.string('extension');
        table.string('dirPath');
        table.string('downloadStatus');
    }).then((result) => {
        console.log("rv911-creation-R", "Table created successfully!");
    }).error((error) => {
        console.log("rv911-creation-E", error);
    });
}

export const insertBatchRecords = (knex, files) => {
    knex1(TABLE_ORDERS).batchInsert(files)
    .then(id => {
        console.log("rv911-insert-S", "File inserted successfully!", id);    
    }).error(error => {
        console.log("rv911-insert-E", error, file);
    });
}

export const insertRecordsInOrderTable = (knex, files) => {
    files.forEach(file => {
        if(file.url !== ''){
            knex(TABLE_ORDERS).insert({
                'orderId': file.orderId,
                'orderDate': file.orderDate,
                'name': file.name,
                'sku': file.sku,
                'url': file.url,
                'dirName': file.dirName,
                'fileName': file.fileName,
                'extension': file.extension,
                'dirPath': file.dirPath,
                'downloadStatus': file.downloadStatus,
            }).then(id => {
                console.log("rv911-insert-S", "File inserted successfully!", id);    
            }).error(error => {
                console.log("rv911-insert-E", error, file);
            });
        }
    });
}

export const getAllRecordsFromOrder = (knex) => {
    console.log("rv911", "Got request for all records!");
    return knex.select("*").from(TABLE_ORDERS);
}