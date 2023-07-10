import axios from "axios";
import fs from "fs";

async function uploadFileToGitHub(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = filePath.split("/").pop(); // 获取文件名
    const response = await axios({
      url: `https://api.github.com/repos/laterbuy/blogTalk/contents/ai-image/${fileName}`,
      method: "put",
      headers: {
        Authorization: `token ${process.env.MY_TOKEN}`,
      },
      data: {
        branch: "main",
        content: fileBuffer.toString("base64"),
        message: "upload file",
      },
    });

    console.log("File uploaded successfully:", response?.data);
    return response;
  } catch (error) {
    console.error("Error uploading file:", error?.response?.status);
  }
}

export default uploadFileToGitHub;
