import axios from "axios";
import * as cheerio from 'cheerio'

export async function handler(event, context) {
    try {
        // example: "/.netlify/functions/courseCodes?campus=B&faculty=CD"
        const params = event.queryStringParameters
        const campus = params.campus || ""
        const faculty = params.faculty || ""

        const payload = new URLSearchParams({
            "search_campus": campus,
            "search_course": "",
            "captcha_no_type": "",
            "captcha1": 123456,
            "captcha2": 123456,
            "captcha3": 123456,
            "token1": "ey7JhbGciOiJbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDA1ODY3NjcsImV4cCI6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbIi9jb252aWQxOS9zYXJpbmdhbmhhcmlhbi9ieS9ub3Bla2VyamEiLCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaW1zL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw",
            "token2": "I6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbI19jb252aWQxOS9zYXJpbmdhbmhhcmlhbi9ieS9ub3Bla2VyamE1LCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaW1zL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw",
            "token3": "Byb2ZpbGiJIUzI1NjIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDA1ODY3NjcsImV4cCI6MTc2NjUwNjc2NywicGVnYXdhaV9iZXJ0YW5nZ3VuZ2phd2FiIjoiRmFpZGFoIE1vaGFtbWFkIiwidXNlciI6ImlzdHVkZW50IiwidXJsIjpbIi9jb252aWQxOS9zYXJpbmdh b3Bla2VyamEiLCIvY29udmlkMTkvc2VtYWsvc3RhdHVzL3Zha3NpbiIsIi9zaWizL3N0YWZmIiwiL2hlYS9kb2t1bWVuL3Byb2ZpbGUiXX0.SICKMG-1QLovNxWu5Ab9ZxcskOW32DGvFKUww21Q3rw",
        })

        if (faculty) {
            payload.set("search_faculty", faculty);
        }

        const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result111.cfm"
        const response = await axios.post(url, payload.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
            }
        });

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