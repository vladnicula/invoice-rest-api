const fs = require('fs');


module.exports = {
    run: (FIXTURES_FOLDER) => {
        console.log(`reading`, FIXTURES_FOLDER)
        const files = fs.readdirSync(
            FIXTURES_FOLDER,
            { withFileTypes: true }
        )


        for ( const file of files ) {
            console.log(`overwrite ${process.env.PATH_TO_JSON_DIR}/${file.name} with ${FIXTURES_FOLDER}/${file.name}`)
            fs.copyFileSync(
                `${FIXTURES_FOLDER}/${file.name}`, 
                `${process.env.PATH_TO_JSON_DIR}/${file.name}`
            )
        }
    }
}
