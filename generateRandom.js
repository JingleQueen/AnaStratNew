export default function generateRandom(digits){
    return ("" + Math.random()).substring(2,digits+2);
}