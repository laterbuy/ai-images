import { open } from "lmdb";
import path from "path";

const db = open({
  path: path.resolve(process.cwd(), "./db"),
  compression: true,
});

export default db;
