import axios from "axios";
import * as cheerio from "cheerio";
import { day_mapping } from "./utils/day.js";
import { choice } from "./utils/random.js";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { handler as iCressMainHandler } from "./iCressMain.js";

// ============================================================
//                  GENETIC ALGORITHM STEPS
// ------------------------------------------------------------
// 1. Initialize a random population
// 2. Fitness evaluation 
// 3. Selection
// 4. Crossover
// 5. Mutation
// 6. Termination
// ============================================================


// ============================================================
//                     JAVASCRIPT CLASSES
// ============================================================
class Course {
    #session; #code; #campus; #faculty;
    constructor(session, code, campus, faculty) {
        this.#session = session;
        this.#code = code;
        this.#campus = campus;
        this.#faculty = faculty;
    }

    get_session() { return this.#session }
    get_code() { return this.#code }
    get_campus() { return this.#campus }
    get_faculty() { return this.#faculty }

    toString() { return `${this.#code} (${this.#session})` }
}

class Class {
    #id; #class_group; #course; #timeslots;
    constructor(id, class_group, course, timeslots) {
        this.#id = id;
        this.#class_group = class_group;
        this.#course = course;
        this.#timeslots = timeslots;
    }

    get_id() { return this.#id }
    get_class_group() { return this.#class_group }
    get_course() { return this.#course }
    get_timeslots() { return this.#timeslots }

    toString() {
        return `${this.#class_group}, ${this.#course}, [${this.#timeslots.map(t => String(t)).join(" | ")}]`;
    }

    toObj() {
        return {
            class_id: this.#id,
            class_group: this.#class_group,
            course_session: this.#course.get_session(),
            course_code: this.#course.get_code(),
            course_campus: this.#course.get_campus(),
            timeslots: this.#timeslots.map(t => t.toObj())
        };
    }
}

class Timeslot {
    #id; #day_of_week; #start_time; #end_time; #room_code; #mode; #status;
    constructor(id, day_of_week, start_time, end_time, room_code, mode, status) {
        this.#id = id;
        this.#day_of_week = day_of_week;
        this.#start_time = start_time;
        this.#end_time = end_time;
        this.#room_code = room_code;
        this.#mode = mode;
        this.#status = status;
    }

    get_id() { return this.#id }
    get_day_of_week() { return this.#day_of_week }
    get_start_time() { return this.#start_time }
    get_end_time() { return this.#end_time }
    get_room_code() { return this.#room_code }
    get_mode() { return this.#mode }
    get_status() { return this.#status }

    print_day() {
        return { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun" }[this.#day_of_week] || null;
    }

    toString() { return `${this.print_day()} (${this.#start_time} - ${this.#end_time})`; }

    toObj() {
        return {
            timeslot_id: this.#id,
            day_of_week: this.#day_of_week,
            start_time: this.#start_time,
            end_time: this.#end_time,
            room_code: this.#room_code,
            mode: this.#mode,
            status: this.#status
        };
    }
}

class Conflict {
    #conflict_type; #conflict_between_classes;
    constructor(conflict_between_classes) {
        this.#conflict_type = "OVERLAP";
        this.#conflict_between_classes = conflict_between_classes;
    }

    get_conflict_type() { return this.#conflict_type }
    get_conflict_between_classes() { return this.#conflict_between_classes }
}

// ============================================================
//                     CLASSES SCRAPING
// ============================================================
class DataScraper {
    #selected_courses; #courses; #classes;
    constructor(selected_courses) {
        this.#selected_courses = selected_courses;
        this.#courses = this.select_courses(selected_courses);
        this.#classes = [];
    }

    // Since select_classes is async, it returns a promise
    // On initialize, perform select_classes and assign it to #classes
    async init() {
        this.#classes = await this.select_classes();
        return this;
    }

    select_courses(selected_courses) {
        if (!selected_courses || selected_courses.length === 0) return [];
        return selected_courses.map(
            (s) => new Course(s.session, s.code, s.campus, s.faculty || "")
        );
    }

    async select_classes() {
        const returnClasses = [];
        let classCounter = 1;
        let timeslotCounter = 1;

        for (const course of this.#courses) {
            const selectedCourse = this.#selected_courses.find(
                c =>
                    c.code === course.get_code() &&
                    c.campus === course.get_campus() &&
                    c.session === course.get_session()
            );

            const allowed_class_groups = selectedCourse?.classes
                ?.filter(cg => cg.select === true)
                .map(cg => cg.class_group) ?? [];

            if (!Array.isArray(allowed_class_groups) || allowed_class_groups.length === 0) {
                throw new Error("NO_CLASSES_SELECTED");
            }

            const jar = new CookieJar();
            const client = wrapper(axios.create({ jar }));

            const iCressResponse = await iCressMainHandler(); 
            const { payload: basePayload, cookies } = JSON.parse(iCressResponse.body);

            const cookieString = cookies
                .map((c) => `${c.key}=${c.value}`)
                .join("; ");

            const key1 = cookies.find(c => c.key === "KEY1")?.value;
            const key2 = cookies.find(c => c.key === "KEY2")?.value;
            const key3 = cookies.find(c => c.key === "KEY3")?.value;
            const url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/INDEX_RESULT_lII1II11I1lIIII11II1lI111I.cfm?id1=${key1}&id2=${key2}&id3=${key3}`;


            const payload = new URLSearchParams({
                ...basePayload,
                search_campus: course.get_campus(),
                search_faculty: course.get_faculty(),
                search_course: course.get_code()
            });

            const res = await client.post(url, payload, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm",
                    "Cookie": cookieString
                }
            });

            let $ = cheerio.load(res.data);
            const course_link = $('tr.gradeU').find('td').eq(2).find('a').attr('href')?.trim();
            if (!course_link) continue;

            const search_url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${course_link}`;
            const res2 = await client.get(search_url, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/",
                    "Cookie": cookieString
                }
            });

            const classTimeslot = {};
            $ = cheerio.load(res2.data);

            $("table tr").each((_, row) => {
                const cols = $(row).find("td");
                if (cols.length === 0) return;

                const class_group = $(cols[2]).text().trim();
                if (allowed_class_groups.includes(class_group)) {
                    const dayText = $(cols[1]).text().trim();
                    const day = dayText.split("(")[0].trim().toUpperCase();
                    const day_of_week = day_mapping[day] || null;

                    const timePart = dayText.split("(")[1];
                    const start_time = timePart?.split("-")[0]?.replace(/(AM|PM)/g, "").trim() || null;
                    const end_time = timePart?.split("-")[1]?.replace(")", "").replace(/(AM|PM)/g, "").trim() || null;

                    const mode = $(cols[3]).html()?.replace("<br>", " ").trim() || null;
                    const status = $(cols[4]).html()?.replace("<br>", " ").trim() || null;
                    const room_code = $(cols[5]).text().trim() || "ONLINE";

                    const timeslot = new Timeslot(
                        timeslotCounter++,
                        day_of_week,
                        start_time,
                        end_time,
                        room_code,
                        mode,
                        status
                    );

                    if (!classTimeslot[class_group]) classTimeslot[class_group] = [];
                    classTimeslot[class_group].push(timeslot);
                }
            });

            for (const class_group in classTimeslot) {
                const timeslots = classTimeslot[class_group];
                returnClasses.push(new Class(classCounter++, class_group, course, timeslots));
            }
        }

        return returnClasses;
    }

    get_classes_by_courses(course) {
        return this.#classes.filter(c =>
            c.get_course().get_session() === course.get_session() &&
            c.get_course().get_code() === course.get_code() &&
            c.get_course().get_campus() === course.get_campus()
        );
    }

    get_courses() { return this.#courses }
    get_classes() { return this.#classes }
}

// ============================================================
//                     GENETIC ALGORITHM
// ============================================================
const POPULATION_SIZE = 9;
const NUMB_OF_ELITE_SCHEDULES = 1;
const TOURNAMENT_SELECTION_SIZE = 3;
const MUTATION_RATE = 0.1;

class Schedule {
    #scraper; #classes; #conflicts; #fitness; #isFitnessChanged;
    constructor(scraper) {
        this.#scraper = scraper;
        this.#classes = [];
        this.#conflicts = [];
        this.$fitness = -1;
        this.#isFitnessChanged = true;
    }

    get_classes() {
        this.#isFitnessChanged = true
        return this.#classes
    }
    get_conflicts() { return this.#conflicts }

    get_fitness(arrangement) {
        if (this.#isFitnessChanged) {                       // Only calculate fitness if it has changed to improve performance
            this.#fitness = this.calculate_fitness(arrangement)
            this.#isFitnessChanged = false                  // set to false after each calculation
        }
        return this.#fitness
    }

    initialize() {
        const courses = this.#scraper.get_courses()
        for (const course of courses) {
            const classes = this.#scraper.get_classes_by_courses(course)
            const chosen_class = choice(classes) // Randomly choose any 1 of the classes for each course
            if (chosen_class) this.#classes.push(chosen_class)
        }
        return this
    }

    static timeslots_overlap(t1, t2) {
        if (t1.get_day_of_week() === t2.get_day_of_week()) {
            if (t1.get_start_time() < t2.get_end_time() && t2.get_start_time() < t1.get_end_time()) {
                return true
            }
        }
        return false
    }

    calculate_fitness(arrangement) {
        this.#conflicts = []
        const classes = this.get_classes()

        for (let i = 0; i < classes.length; i++) {
            for (let j = i + 1; j < classes.length; j++) {
                for (const t1 of classes[i].get_timeslots()) {
                    for (const t2 of classes[j].get_timeslots()) {
                        if (Schedule.timeslots_overlap(t1, t2)) {
                            this.#conflicts.push(
                                new Conflict([classes[i], classes[j]])
                            )
                        }
                    }
                }
            }
        }

        // Extra point depending on arrangement priority (morning / evening)
        let bonus_point = 0;
        for (const c of classes) {
            for (const t of c.get_timeslots()) {
                if (arrangement == 1) {
                    if (t.get_start_time() < "12:00") {
                        bonus_point += 1;
                    }
                }
                if (arrangement == 2) {
                    if (t.get_start_time() > "12:00") {
                        bonus_point += 1;
                    }
                }
            }
        }

        // Reward / Penalty
        return (1 + 0.01 * bonus_point) / (1.0 * this.#conflicts.length + 1)
    }

    toObj() {
        const schedule_obj = {};
        for (let i = 0; i < 7; i++) { schedule_obj[i + 1] = [] };
        for (const c of this.#classes) {
            for (const t of c.get_timeslots()) {
                schedule_obj[t.get_day_of_week()].push({
                    class_id: c.get_id(),
                    class_group: c.get_class_group(),
                    course_session: c.get_course().get_session(),
                    course_code: c.get_course().get_code(),
                    course_campus: c.get_course().get_campus(),
                    timeslot: t.toObj()
                })
            }
        }
        return schedule_obj
    }

}

class Population {
    #size; #schedules
    constructor(size, scraper) {
        this.#size = size
        this.#schedules = []
        for (let i = 0; i < this.#size; i++) {
            this.#schedules.push(new Schedule(scraper).initialize())
        }
    }
    get_schedules() { return this.#schedules }
}

class GeneticAlgorithm {
    #scraper;
    constructor(scraper) {
        this.#scraper = scraper;
    }

    evolve(population, arrangement) {
        return this.#mutate_population(this.#crossover_population(population, arrangement))
    }

    #crossover_population(population, arrangement) {
        const crossover_pop = new Population(0, this.#scraper)

        for (let i = 0; i < NUMB_OF_ELITE_SCHEDULES; i++) {
            crossover_pop.get_schedules().push(population.get_schedules()[i])
        }

        let i = NUMB_OF_ELITE_SCHEDULES;
        while (i < POPULATION_SIZE) {
            const schedule1 = GeneticAlgorithm.#select_tournament_population(population, this.#scraper, arrangement).get_schedules()[0];
            const schedule2 = GeneticAlgorithm.#select_tournament_population(population, this.#scraper, arrangement).get_schedules()[0];
            crossover_pop.get_schedules().push(
                GeneticAlgorithm.#crossover_schedule(schedule1, schedule2, this.#scraper)
            );
            i++;
        }
        return crossover_pop
    }

    #mutate_population(population) {
        for (let i = NUMB_OF_ELITE_SCHEDULES; i < POPULATION_SIZE; i++) {
            GeneticAlgorithm.#mutate_schedule(population.get_schedules()[i], this.#scraper);
        }
        return population;
    }

    static #crossover_schedule(schedule1, schedule2, scraper) {
        const crossoverSchedule = new Schedule(scraper).initialize();
        const classes = crossoverSchedule.get_classes();

        for (let i = 0; i < classes.length; i++) {
            if (Math.random() > 0.5) {
                classes[i] = schedule1.get_classes()[i];
            } else {
                classes[i] = schedule2.get_classes()[i];
            }
        }

        return crossoverSchedule;
    }

    static #mutate_schedule(mutate_schedule, scraper) {
        const schedule = new Schedule(scraper).initialize();
        const classes = mutate_schedule.get_classes();

        for (let i = 0; i < classes.length; i++) {
            if (MUTATION_RATE > Math.random()) {
                classes[i] = schedule.get_classes()[i];
            }
        }

        return mutate_schedule;
    }

    static #select_tournament_population(pop, scraper, arrangement) {
        const tournament_pop = new Population(0, scraper);

        for (let i = 0; i < TOURNAMENT_SELECTION_SIZE; i++) {
            const randIndex = Math.floor(Math.random() * POPULATION_SIZE);
            tournament_pop.get_schedules().push(pop.get_schedules()[randIndex]);
        }

        tournament_pop.get_schedules().sort(
            (a, b) => b.get_fitness(arrangement) - a.get_fitness(arrangement)
        );

        return tournament_pop;
    }
}

function find_fittest_schedule(scraper, arrangement) {
    const genetic_algorithm = new GeneticAlgorithm(scraper);

    let generation_number = 0;
    let plateau_count = 0;             // number of consecutive generations without improvement
    const MAX_GENERATIONS = 250;       // absolute limit (safety stop)
    const MAX_PLATEAU = 50;            // stop if no improvement for 30 gens

    // GA STEP 1: Initialize a random population
    let population = new Population(POPULATION_SIZE, scraper);

    // GA STEP 2: Fitness evaluation
    population.get_schedules().sort(
        (a, b) => b.get_fitness(arrangement) - a.get_fitness(arrangement)
    );

    let best_schedule = population.get_schedules()[0];
    let best_fitness = best_schedule.get_fitness(arrangement);
    let best_generation = 0;

    // GA LOOP: Until plateau or limit
    while (generation_number < MAX_GENERATIONS && plateau_count < MAX_PLATEAU) {
        generation_number++;

        // GA STEP 3, 4, 5: Selection, Crossover, Mutation
        population = genetic_algorithm.evolve(population, arrangement);

        population.get_schedules().sort(
            (a, b) => b.get_fitness(arrangement) - a.get_fitness(arrangement)
        );

        const current_schedule = population.get_schedules()[0];
        const current_fitness = current_schedule.get_fitness(arrangement);

        if (current_fitness > best_fitness) {
            best_schedule = current_schedule;
            best_fitness = current_fitness;
            best_generation = generation_number;
            plateau_count = 0; // reset plateau since improvement occurred
        } else {
            plateau_count++; // no improvement this generation
        }
    }

    return { schedule: best_schedule, generation: best_generation, generation_number: generation_number };
}

// Check for classes clash if user chose 1 class per course only
function find_clash(schedule) {
    const clashed = [];
    for (let i = 0; i < schedule.get_classes().length; i++) {
        for (let j = i + 1; j < schedule.get_classes().length; j++) {
            for (const t1 of schedule.get_classes()[i].get_timeslots()) {
                for (const t2 of schedule.get_classes()[j].get_timeslots()) {
                    if (Schedule.timeslots_overlap(t1, t2)) {
                        clashed.push([schedule.get_classes()[i].get_course().get_code(), schedule.get_classes()[j].get_course().get_code()])
                    }
                }
            }
        }
    }
    return clashed
}

export async function handler(event, context) {
    try {
        const selected = JSON.parse(event.body);
        const params = event.queryStringParameters;
        const arrangement_priority = Number(params.arrangement_priority) || 0;

        if (arrangement_priority !== 1 && arrangement_priority !== 2) {
            return {
                statusCode: 422,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    "code": "INVALID_PRIORITY",
                    "message": "Please select the arrangement priority"
                }),
            };
        }

        const scraper = await new DataScraper(selected).init();
        const { schedule, generation, generation_number } = find_fittest_schedule(scraper, arrangement_priority);

        const clashed_code = find_clash(schedule)
        if (clashed_code.length > 0) {
            return {
                statusCode: 422,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    "code": "CLASHED_CLASSES",
                    "message": "Some classes are clashing",
                    "clashes": clashed_code.map(([c1, c2]) => ({ class1: c1, class2: c2 }))
                }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                schedule: schedule.toObj(),
                fitness: schedule.get_fitness(1),
                generation: generation,
                generation_number: generation_number
            })
        };

    } catch (err) {
        if (err.message === "NO_CLASSES_SELECTED") {
            return {
                statusCode: 422,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    code: "NO_CLASSES_SELECTED",
                    message: "Please select at least one class for every course"
                }),
            };
        } else {
            return {
                statusCode: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    error: err.message,
                    line: err.stack?.split('\n')[1]?.trim() || "unknown",
                    stack: err.stack
                }),
            };
        }
    }
}