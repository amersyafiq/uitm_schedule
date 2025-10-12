import * as cheerio from 'cheerio'
import axios from 'axios'

export async function handler(event, context) {
    try {
        const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.cfm"
        const res = await axios.get(url)
        if (res.status !== 200) { throw new Error("iCress is currently inaccessible!"); }

        const setCookies = res.headers["set-cookie"] || [];
        const cookieHeader = setCookies
            .map((c) => c.split(";")[0])
            .join("; ");

        let $ = cheerio.load(res.data)
        const payload = {}
        $("input[type='hidden']").each((_, input) => {
            const name = $(input).attr("name");
            const value = $(input).attr("value") || "";
            if (name) payload[name] = value;
        })
        $("select").each((_, select) => {
            const name = $(select).attr("name")
            const selectedOption = $(select).find("option[selected]").attr("value")
                                    || $(select).find("option").first().attr("value")
                                    || "";
            if (name) payload[name] = selectedOption;
        })

        $('script').each((_, script) => {
            const document = $(script).html();
            const regex = /document\.getElementById\('([^']+)'\).value = '([^']+)'/g;
            let match;
            while ((match = regex.exec(document)) != null) {
                const [_, key, value] = match;
                payload[key] = value
            }
        })

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                payload: payload,
                cookies: cookieHeader
            })
        };
    } catch (err) {
        console.log(err.message)
    }
}