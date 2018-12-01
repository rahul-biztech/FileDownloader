import PouchDB from 'pouchdb';
import { showLog } from '../utils/Utils';

export default class DB {
    constructor(name){
        this.db = new PouchDB(name);
    }

    async getAllPendingFiles(){
        //let pendingFiles = await this.db.allDocs({include_docs: true});
        let pendingFiles = this.db.get("pending_files")
        //console.log(pendingFiles);
    }

    async createPendingFile(files) {
        try {
            let doc = this.db.get("pending_files");
            console.log(doc);
            /* const res = await this.db.put({
                _id: "pending_files",
                _rev: doc._rev,
                title: "Pending Files",
                ...files
            });
            console.log(res); */
        }catch(error){
            console.log(error);
        };
    }

}