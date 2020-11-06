const process = require('process')
const Airtable = require('airtable')

require('dotenv').config()

const base = new Airtable({ apiKey: process.env.AIRTABLESECRETKEY || '' }).base(
  'appRroYp8W79za5MC'
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
            const data = records.map(record => {
              return {
                name: record.get('Name'),
                id: record.id,
                colors: record.get("colors")
              }
            }).reduce((o)=> o[o.id], {});

            resolve(data)

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage()
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
