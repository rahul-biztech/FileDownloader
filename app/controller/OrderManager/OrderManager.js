import data from "../../raw/orders_11.json";
import { showLog } from "../../utils/Utils.js";

export const extractOrders = () => {
    return new Promise((resolve, reject) => {
        getOrders().then(result => {
            showLog(result);
            resolve(result);
        });
    })
}

const getOrders = () => {
    showLog(data);
    let finalList = [];
    let orders = data.orders;
    return new Promise((resolve, reject) => {
        orders.forEach((order, index) => {
            let dl = [];
            getProducts(order, dl).then(result => {
                finalList.push(dl);
                resolve(finalList);
            });
        });
    });
}

const getProducts = (order, dl) => {
    let products = order.products;
    return new Promise((resolve, reject) => {
        products.forEach((product, index) => {
            let item = getFileSchema(order, product, "pdf");
            if(product.base_pdf !== undefined){
                item.dirName = product.name;
                item.fileName = "BasePdf";
                item.url = product.base_pdf;
                dl.push(item);
            }
            if(product.orig_pdf !== undefined) {
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
}

const getSides = (order, product, dl) => {
    let sides = product.sides;
    return new Promise((resolve, reject) => {
        if(sides === undefined){
            return;
        }
        sides.forEach((side, index) => {
            let item = getFileSchema(order, product, "jpg");
            if(side.base !== undefined){
                item.dirName = side.name;
                item.fileName = "BaseImage";
                item.url = side.base;
                dl.push(item);
            }
            if(side.orig !== undefined) {
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
}

const getElements = (order, product, side, dl) => {
    let elements = side.elements;
    return new Promise((resolve, reject) => {
        elements.forEach((element, index) => {
            dl.push(
                getDownloadableFileSchema(
                    order.order_id,
                    order.order_date,
                    product.sku,
                    product.name,
                    "Elements",
                    "Element-"+index,
                    element,
                    "jpg"
                )
            );
        })
        resolve(dl);
    })
}

const getFileSchema = (order, product, ext) => {
    return {
        "dirPath" : "home/rahul/desktop/hotfolder/",
        "orderId": order.order_id,
        "orderDate": order.order_date,
        "sku": product.sku,
        "name": product.name,
        "dirName": "",
        "fileName": "",
        "url": "",
        "extension": ext
      }
}

const getDownloadableFileSchema = (id, date, sku, name, dirName, fileName, url, extension) => {
    return {
        "dirPath" : "/home/rahul/Pictures/HotFolder/",
        "orderId": id,
        "orderDate": date,
        "sku": sku,
        "name": name,
        "dirName": dirName,
        "fileName": fileName,
        "url": url,
        "extension": extension
      }
}