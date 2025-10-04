import axios from "axios";
import * as cheerio from 'cheerio'

export async function handler(event, context) {
    try {
        const params = event.queryStringParameters
        const campus = params.campus || ""
        const faculty = params.faculty || ""
        const code = params.code || ""

        const payload = new URLSearchParams({
            "search_campus": campus,
            "search_course": code,
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

        let $ = cheerio.load(response.data)
        const course_name = $('tr.gradeU').find('td').eq(1).text().trim() // CSC577.
        const course_link = $('tr.gradeU').find('td').eq(2).find('a').attr('href').trim() // index_tt.cfm?id1=58DCBC31DEFF9C8C02E4F8FFD12E51A8F1439E&id2=6BB3BCB0D9A59DA7CA69C8E490AE5E86834746

        const search_url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${course_link}`
        const response2 = await axios.get(search_url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
            }
        });

        $ = cheerio.load(response2.data)

        // ======================  Course data ========================
        const scrapped_info = $('strong').first().html().replace(/<br\s*\/?>/g, ' ').trim().split(/\s+/);

        //[ 'SESSION',':', '20254','-', 'COURSE','&nbsp;', ':', 'CSC577', 'CAMPUS',':', 'SELANGOR', 'FACULTY', ':','CD' ]
        const scrapped_session = scrapped_info[2]
        const scrapped_course = scrapped_info[7]
        const scrapped_campus = scrapped_info[10] === 'SELANGOR' ? 'B' : scrapped_info[10]
        const scrapped_faculty = scrapped_info[13] || ""


        // ======================  Classes data ========================
        const rows = $("tbody tr");

        let classes = []
        rows.each((i, row) => {
            const cols = $(row).find("td");
            const rowData = cols.map((i, col) => $(col).text().trim()).get();
            // [ '1.', 'SUNDAY( 08:30 AM-10:30 AM )', 'NBCS2305A', 'Students UnderiCEPS Only', 'First Timerand Repeater', 'BK01', 'CDCS230,CDCS253', 'CD' ]

            const class_group = rowData[2].trim()
            if (!classes.some(c => c.class_group === class_group)) {
                classes.push({
                    class_group: class_group,
                    select: false
                })
            }
        });

        const result = {
            "code": scrapped_course,
            "campus": scrapped_campus,
            "session": scrapped_session,
            "faculty": scrapped_faculty,
            "classes": classes
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ results: result })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message }),
        };
    }
}