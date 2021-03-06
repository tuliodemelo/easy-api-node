import fs from "fs";
import path from "path";
import Sequelize from "sequelize";

let db = null;

module.exports = app => {
    const config = app.libs.config.connections;

    const objSequlise = {};

    const scanDatabase = (existDir, dir, keyConfig) => {
        if (existDir === false) return;

        objSequlise[keyConfig] = new Sequelize(
            config[keyConfig].database,
            config[keyConfig].username,
            config[keyConfig].password,
            config[keyConfig].params,
        );

        db[keyConfig] = {
            sequelize: objSequlise[keyConfig],
            models: {},
        }

        fs.readdirSync(dir).forEach(file => {
            const modelDir = path.join(dir, file);
            const model = db[keyConfig].sequelize.import(modelDir);

            db[keyConfig].models[model.name] = model;
        });

        Object.keys(db[keyConfig].models).forEach(key => {
            db[keyConfig].models[key].associate(db[keyConfig].models);
        });
    }

    if (!db) {
        db = {};

        Object.keys(config).forEach(keyConfig => {
            var pathModel = config[keyConfig].business;

            const dir = path.join(__dirname, `../app/models/business/${pathModel}`);

            fs.existsSync(dir, (rs) => { return scanDatabase(rs, dir, keyConfig) });
        });
    }

    return db;
}
