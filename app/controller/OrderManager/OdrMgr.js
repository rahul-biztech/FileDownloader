// import data from "../../raw/orders.json";
import data from "../../raw/orders_holded.json";
import { showLog } from "../../utils/Utils.js";

let path = "";
let storeByDate = true;

export const extractOrders = (response, dirPath, storageSchema) => {
    if(response === undefined) {
        response = data;
    }
    /* path = dirPath + "/Instant-Download";
    storeByDate = storageSchema === "Date"
        ? true
        : false; */
    console.log(path + " store by: " + storageSchema + ": " + storeByDate);
    return new Promise((resolve, reject) => {
        getOrders(response).then(result => {
            resolve(result);
        }, error => {
            reject(error);
        });
    });
};

const getOrders = response => {
    let finalList = [];
    let orders = response.orders;
    if (orders === undefined || orders.length === 0) {
        return new Promise((resolve, reject) => {
            reject("Sorry, No new orders found!");
        });
    }
    return new Promise((resolve, reject) => {
        orders.forEach((order, index) => {
            let dl = [];
            getProducts(order, dl).then(result => {
                finalList.push(dl);
                resolve(finalList);
            });
        });
    });
};

const getProducts = (order, dl) => {
    let products = order.products;
    return new Promise((resolve, reject) => {
        products.forEach((product, index) => {
            let item = getFileSchema(order, product, "pdf");
            if (product.base_pdf !== undefined) {
                item.dirName = product.name;
                item.fileName = "BasePdf";
                item.url = product.base_pdf;
                dl.push(item);
            }
            if (product.orig_pdf !== undefined) {
                let orignItem = Object.assign({}, item);
                orignItem.dirName = product.name;
                orignItem.fileName = "OriginPdf";
                orignItem.url = product.orig_pdf;
                dl.push(orignItem);
            }
            getSides(order, product, dl).then(result => {
                resolve(result);
            });
        });
    });
};

const getSides = (order, product, dl) => {
    let sides = product.sides;
    return new Promise((resolve, reject) => {
        if (sides === undefined) {
            return;
        }
        sides.forEach((side, index) => {
            let item = getFileSchema(order, product, "jpg");
            item.dirPath = item.dirPath + side.name;
            if (side.base !== undefined) {
                item.dirName = side.name;
                item.fileName = "BaseImage";
                item.url = side.base;
                dl.push(item);
            }
            if (side.orig !== undefined) {
                let orignItem = Object.assign({}, item);
                orignItem.dirName = side.name;
                orignItem.fileName = "OriginImage";
                orignItem.url = side.orig;
                dl.push(orignItem);
            }
            getElements(order, product, side, dl).then(result => {
                resolve(result);
            });
        });
    });
};

const getElements = (order, product, side, dl) => {
    let elements = side.elements;
    return new Promise((resolve, reject) => {
        let item = getFileSchema(order, product, "jpg");
        item.dirPath = item.dirPath + side.name + "/" + "Elements";
        item.dirName = "Elements";
        item.extension = "jpg";
        elements.forEach((element, index) => {
            let eleItem = Object.assign({}, item);
            eleItem.fileName = "Element " + index;
            eleItem.url = element;
            dl.push(eleItem);
        });
        resolve(dl);
    });
};

const getFileSchema = (order, product, ext) => {
    let directory = "";
    if (storeByDate) {
        directory = path + "/" + order.order_date + "/" + order.order_id + "/" + product.sku + "/";
    } else {
        directory = path + "/" + order.order_id + "/" + product.sku + "/";
    }
    return {
        dirPath: directory,
        orderId: order.order_id,
        orderDate: order.order_date,
        sku: product.sku,
        name: product.name,
        dirName: "",
        fileName: "",
        url: "",
        extension: ext
    };
};
