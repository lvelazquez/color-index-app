const process = require('process')
const Airtable = require('airtable')


const base = new Airtable({ apiKey: process.env.AIRTABLESECRETKEY || '' }).base(
  process.env.AIRTABLEBASEKEY
)

// The root provides a resolver function for each API endpoint
module.exports = {
  async getColors () {
    return new Promise(async (resolve, reject) => {
      base('Colors')
        .select({
          view: 'Grid view'
        })
        .eachPage(
          async function page (records, fetchNextPage) {            
            // This function (`page`) will get called for each page of records.
            const data = records.map((record, i) => {
              return {
                name: record.get('Name'),
                id: `colors${i}`,
                colors: record.get("Colors")
              }
            }).reduce((acc, o)=> {            
              return Object.assign({ [o.name]: o.colors }, acc);
          }, {});
            resolve(data)
          },
          function done (err) {
            if (err) {
              reject(err)
            }
          }
        )
    })
  },
}
