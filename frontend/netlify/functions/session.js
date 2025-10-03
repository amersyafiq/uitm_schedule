import axios from "axios";
import * as cheerio from 'cheerio';

export async function handler(event) {
    try {
        const payload = new URLSearchParams({
            "search_campus": "B",
            "search_faculty": "CD",
            "search_course": ""
        })

        const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm";

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
            }
        });

        const $ = cheerio.load(response.data);
        const h5Texts = $("h5").map((i, el) => $(el).text().trim()).get();

        let semester = null;
        if (h5Texts.length >= 3) {
            const match = h5Texts[2].match(/Semester\s*:\s*(\d+)/);
            if (match) semester = match[1];
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ session: semester })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message }),
        };
    }
}