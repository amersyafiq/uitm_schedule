import axios from "axios";
import * as cheerio from 'cheerio'
import { URLSearchParams } from "url";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export async function handler(event, context) {
    try {
        // example: "/.netlify/functions/courseCodes?campus=B&faculty=CD"
        const params = event.queryStringParameters
        const campus = params.campus || ""
        const faculty = params.faculty || ""

        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));

        const iCress = await client.get("http://localhost:8888/.netlify/functions/iCressMain")
        const { payload: basePayload, cookies } = iCress.data

        const cookieString = cookies
            .map((c) => `${c.key}=${c.value}`)
            .join("; ");

        const key1 = cookies.find(c => c.key === "KEY1")?.value;
        const key2 = cookies.find(c => c.key === "KEY2")?.value;
        const key3 = cookies.find(c => c.key === "KEY3")?.value;
        const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11II1lI111I.cfm?id1=${key1}&id2=${key2}&id3=${key3}`;

        const payload = new URLSearchParams({
            ...basePayload,
            search_campus: campus,
            search_faculty: faculty,
            search_course: ""
        });

        const response = await client.post(url, payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/",
                "Cookie": cookieString
            }
        });

        const $ = cheerio.load(response.data)

        const code_array = [];
        $("tr.gradeU").each((i, tr) => {
            const td = $(tr).find("td").eq(1).text().trim().replace(".","");
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