import { parse } from '@fast-csv/parse';
import fs from 'fs';
import _ from 'lodash';

class CSVParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.rows = [];
  }

  async parse() {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.filePath)
        .pipe(parse({ headers: true }))
        .on('error', (err) => {
          reject(err);
        })
        .on('data', (row) => {
          this.rows.push(row);
        })
        .on('end', (rowCount) => {
          resolve();
        });
    });
  }

  getHeaders() {
    if (this.rows.length === 0) {
      return [];
    } else {
      return _.keys(this.rows[0]);
    }
  }

  /**
   * Check if required headers are present in CSV file
   * @param {Array} headers
   */
  isValidHeaders(headers) {
    let isValid = true;
    const csvHeaders = this.getHeaders();

    _.forEach(headers, (header) => {
      if (_.findIndex(csvHeaders, (h) => h === header) === -1) {
        isValid = false;
      }
    });

    return isValid;
  }
}

export default CSVParser;
