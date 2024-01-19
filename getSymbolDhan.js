const xlsx = require('xlsx');

const csvData = xlsx.readFile('src/utils/DhanScrips.csv')
const parsedData =xlsx.utils.sheet_to_json(csvData.Sheets['Sheet1']);
const map = {};
parsedData.forEach((d)=>{
    if(!map[d['SEM_SMST_SECURITY_ID']]){
        map[d['SEM_SMST_SECURITY_ID']]=[]
    }
    map[d['SEM_SMST_SECURITY_ID']].push({...d});
});
export default map;