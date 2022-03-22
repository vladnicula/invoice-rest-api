const fs = require('fs');
const { dirname } = require('path');
const path = require('path')

const FIXTURES_FOLDER = `${process.env.PATH_TO_JSON_DIR}/fixtures`;

const files = fs.readdirSync(
  FIXTURES_FOLDER,
  { withFileTypes: true }
)


for ( const file of files ) {
  fs.copyFileSync(
    `${FIXTURES_FOLDER}/${file.name}`, 
    `${process.env.PATH_TO_JSON_DIR}/${file.name}`
  )
}
  

