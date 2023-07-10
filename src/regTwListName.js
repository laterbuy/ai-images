import fs from "fs";

const str = fs.readFileSync("./test.json", "utf8");
const regex = /"screen_name": "([^"]+)"/g;
const match = str.match(regex);

// fs.writeFileSync("./test1.json", JSON.stringify(match));

// console.log(match);
