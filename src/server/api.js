const Airtable = require('airtable');

const base = new Airtable({
    apiKey: process.env['AIRTABLESECRETKEY'] || '',
}).base(process.env['AIRTABLEBASEKEY']);
const colorsTable = base('Colors');

module.exports = {
    async getColors() {
        return new Promise(async (resolve, reject) => {
            colorsTable
                .select({
                    view: 'Grid view',
                })
                .eachPage(
                    async function page(records, fetchNextPage) {
                        // This function (`page`) will get called for each page of records.
                        const data = records
                            .map((record, i) => {
                                return {
                                    name: record.get('Name'),
                                    id: record.id,
                                    colors: record.get('Colors'),
                                };
                            })
                            .filter(
                                (record) => typeof record.colors !== 'undefined'
                            )
                            .reduce((acc, o) => {
                                return Object.assign(
                                    {
                                        [o.id]: {
                                            colors: o.colors,
                                            name: o.name,
                                        },
                                    },
                                    acc
                                );
                            }, {});
                        resolve(data);
                    },
                    function done(err) {
                        if (err) {
                            reject(err);
                        }
                    }
                );
        });
    },
    async setColors(colorInfo) {
        // TODO validation
        // TODO error handling
        if (
            colorInfo.hasOwnProperty('colors') &&
            colorInfo.hasOwnProperty('name')
        ) {
            return new Promise((resolve, reject) => {
                colorsTable.create(
                    {
                        Colors: colorInfo.colors,
                        Name: colorInfo.name,
                    },
                    (err, record) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(record.getId());
                    }
                );
            });
        }
    },
    async updateColors(recordId, colorInfo) {
        // TODO improve validation
        // TODO error handling
        if (
            recordId &&
            colorInfo.hasOwnProperty('colors') &&
            colorInfo.hasOwnProperty('name')
        ) {
            return new Promise((resolve, reject) => {
                colorsTable.update(
                    recordId,
                    {
                        Colors: colorInfo.colors,
                        Name: colorInfo.name,
                    },
                    (err, record) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(record.getId());
                    }
                );
            });
        }
    },
    async removeColors(recordId) {
        // TODO improve validation
        // TODO error handling
        if (
            recordId &&
            colorInfo.hasOwnProperty('colors') &&
            colorInfo.hasOwnProperty('name')
        ) {
            return new Promise((resolve, reject) => {
                base('Colors').destroy(colorInfo.recordId, (err, record) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(record.getId());
                });
            });
        }
    },
};
