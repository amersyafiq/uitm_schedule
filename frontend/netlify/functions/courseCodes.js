import axios from "axios";
import * as cheerio from 'cheerio'
import { basePayload } from "./utils/payload.js";

export async function handler(event, context) {
    try {
        // example: "/.netlify/functions/courseCodes?campus=B&faculty=CD"
        const params = event.queryStringParameters
        const campus = params.campus || ""
        const faculty = params.faculty || ""

        const iCress = await axios.get("http://localhost:8888/.netlify/functions/iCressMain")
        const { payload: basePayload, cookies } = iCress.data

        const payload = {
            ...basePayload,
            search_campus: campus,
            search_faculty: faculty,
            search_course: ""
        }

        const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm"
        const response = await axios.post(url, payload.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
                "Cookie": cookies
            }
        });

        console.log("Cookies:", cookies);
        console.log("Payload keys:", Object.keys(payload).length);
        console.log("Response status:", response.status);

        const $ = cheerio.load(response.data)

        const code_array = [];
        $("tr.gradeU").each((i, tr) => {
            const td = $(tr).find("td").eq(1).text().trim();
            if (td) code_array.push(td);
        });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ results: code_array })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message }),
        };
    }
}