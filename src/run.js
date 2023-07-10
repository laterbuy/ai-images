import Parser from "rss-parser";
import axios from "axios";
import fs from "fs";
import db from "./db.js";
import list from "./config.js";
import uploadFileToGitHub from "./upload.js";

const getRssDatas = async (urlVal) => {
  const parser = new Parser();
  let datas = [];
  try {
    const feed = await parser.parseURL(urlVal);
    datas = feed.items
      .map(function (entry) {
        const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
        const match = entry.content.match(regex);
        const parts = entry.guid.split("/");
        const id = parts[parts.length - 1];
        if (match && !db.doesExist(id)) {
          const url = match[1].replaceAll("&amp;", "&");
          const pubTime = new Date(entry.pubDate).toLocaleString();
          const fileName = `${id}.jpg`;
          return { id, url, pubTime, fileName };
        }
      })
      .filter((i) => !!i);
  } catch (err) {
    console.error("parser", urlVal, err);
    return datas;
  }
  return datas;
};

const downloadImage = async (url, path) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "binary"));
    console.log(`Image downloaded successfully ${url} ${path}`);
  } catch (error) {
    console.error("Error downloading image:", url, path, error);
  }
};

const run = async () => {
  const basePath = "https://rsshub.app/twitter/user";
  for (let i = 0; i < list.length; i++) {
    console.log("start", i, list[i]);
    // 判断文件夹是否存在
    const outputsPath = process.cwd() + `/outputs`;
    if (!fs.existsSync(outputsPath)) {
      fs.mkdirSync(outputsPath);
      console.log(outputsPath, "created");
    }
    const datas = await getRssDatas(`${basePath}/${list[i]}`);
    for (let i = 0; i < datas.length; i++) {
      await downloadImage(
        datas[i].url,
        `${process.cwd()}/outputs/${list[i]}-${datas[i].fileName}`
      );
      const response = await uploadFileToGitHub(
        `${process.cwd()}/outputs/${list[i]}-${datas[i].fileName}`
      );
      if (response.data?.content) {
        console.log("put db", datas[i].id);
        await db.put(datas[i].id, {
          fileName: datas[i].fileName,
          downloadUrl: response.data?.content.download_url,
        });
      }
    }
  }
  // 刷磁盘
  await db.flushed();
  await db.close();
};

run();
