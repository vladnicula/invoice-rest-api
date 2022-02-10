import fs from 'fs'

export class BaseRepository<Model extends {[key: string]: unknown, id: string}> {

    protected inMemoryData: Array<Model> = [];
    pathToJSONFolder: string;
    file: string;
    disableAutoWriteToDisk = false;

    constructor (file: string) {
        this.file = file;
    }

    async init (pathToJSONFolder: string) {
        this.pathToJSONFolder = pathToJSONFolder;
        const resultJSON = await new Promise<Array<Model>>((resolve, reject) => {
            fs.readFile(`${pathToJSONFolder}/${this.file}`, 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }

                try {
                    resolve(JSON.parse(data ?? "[]"))
                } catch (err) {
                    reject(err)
                }
            });
        })

        this.inMemoryData = resultJSON;
    }

    async serializeAndSaveToDisk () {
        if (!this.pathToJSONFolder) {
            return;
        }
        
        const json = JSON.stringify(this.inMemoryData, null, 4);
        return new Promise<true>((resolve, reject) => {
            fs.writeFile(`${this.pathToJSONFolder}/${this.file}`, json, {
                encoding: "utf-8",
            }, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve(true);
            });
        })
    }

    async getById (id: string) {
        return this.inMemoryData.find((item) => item.id === id)
    }

    async add(params: Omit<Model, 'id'>) {
        const newId = new Date().getTime().toString();
        const newRecord = {
            ...params as Model,
            id: newId
        };

        this.inMemoryData.push(newRecord);
        
        if ( !this.disableAutoWriteToDisk ) {
            await this.serializeAndSaveToDisk();
        }
        return newRecord;
    }

    getByUserId (userId: string) {
        return this.inMemoryData.filter((item) => item.user_id === userId)
    }
}