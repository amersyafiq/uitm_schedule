import axios from "axios";

export async function handler(event) {
  try {
    const { url } = event.queryStringParameters;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing url query parameter" }),
      };
    }

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res.data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
