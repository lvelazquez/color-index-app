/* eslint-env node */
const faker = require('faker');

require('dotenv').config();

// add faker
// The root provides a resolver function for each API endpoint
module.exports = {
    getColors(recordNum = 15, hasError) {
        return new Promise((resolve, reject) => {
            if (hasError) {
                reject('Some Error');
            } else {
                const colors = Array.from({ length: recordNum })
                    .map((o, i) => {
                        return {
                            id: i,
                            name: faker.commerce.productName(),
                            colors: Array.from({ length: 5 })
                                .map(
                                    () =>
                                        '#' +
                                        ((Math.random() * 0xffffff) << 0)
                                            .toString(16)
                                            .padStart(6, '0')
                                )
                                .join(','),
                        };
                    })
                    .reduce((acc, o) => {
                        return Object.assign({ [o.name]: o.colors }, acc);
                    }, {});

                resolve(colors);
            }
        });
    },
};
