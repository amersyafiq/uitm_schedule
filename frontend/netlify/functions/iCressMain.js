import * as cheerio from 'cheerio'
import axios from 'axios'
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export async function handler(event, context) {
    try {
        const jar = new CookieJar();
        const client = wrapper(axios.create({ jar }));

        const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.cfm";
        const res = await client.get(url, {
        headers: {
            "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
        });
        const cookies = await jar.getCookies(url);

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
                cookies: cookies
            })
        };
    } catch (err) {
        console.log(err.message)
    }
}