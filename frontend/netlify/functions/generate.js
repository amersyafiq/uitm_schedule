import axios from "axios";
import * as cheerio from "cheerio";
import { basePayload } from "./utils/payload.js";
import { day_mapping } from "./utils/day.js";
import { choice } from "./utils/random.js";


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

            const allowed_class_groups = selectedCourse
                ? selectedCourse.classes
                    .filter(cg => cg.select)
                    .map(cg => cg.class_group)
                : [];

            const payload = basePayload(course.get_campus(), course.get_faculty(), course.get_code());
            const url = "https://simsweb4.uitm.edu.my/estudent/class_timetable/index_result.cfm";

            const res = await axios.post(url, payload.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/",
                },
            });

            let $ = cheerio.load(res.data);
            const course_link = $('tr.gradeU').find('td').eq(2).find('a').attr('href')?.trim();
            if (!course_link) continue;

            const search_url = `https://simsweb4.uitm.edu.my/estudent/class_timetable/${course_link}`;
            const res2 = await axios.get(search_url, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/"
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

                    console.log({dayText, class_group})

                    if (!classTimeslot[class_group]) classTimeslot[class_group] = [];
                    classTimeslot[class_group].push(timeslot);
                }
            });

            for (const class_group in classTimeslot) {
                const timeslots = classTimeslot[class_group];
                returnClasses.push(new Class(classCounter++, class_group, course, timeslots));
            }
        }

        this.#classes = returnClasses;
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
                    if (t.get_start_time < "12:00") {
                        bonus_point += 1;
                    }
                }
                if (arrangement == 2) {
                    if (t.get_start_time > "12:00") {
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
        for (let i = 0; i < 7; i++) { schedule_obj[i+1] = [] };
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
    let generation_number = 0;
    const genetic_algorithm = new GeneticAlgorithm(scraper);

    // GA STEP 1: Initialize a random population
    let population = new Population(POPULATION_SIZE, scraper);

    // GA STEP 2: Fitness evaluation
    population.get_schedules().sort(
        (a, b) => b.get_fitness(arrangement) - a.get_fitness(arrangement) // Sort by descending order
    );
    let best_schedule = population.get_schedules()[0];    // Top schedule should have the highest fitness
    let best_fitness = best_schedule.get_fitness(arrangement);
    let best_generation = 0;

    // GA STEP 7: Termination
    while (best_fitness != 1.10 && generation_number != 500) { // Limit to 100 generations only
        generation_number += 1;

        // GA STEP 3, 4, 5: Selection, Crossover, Mutation
        population = genetic_algorithm.evolve(population, arrangement);

        // Only return the schedule with the best fitness from all 100 generations
        population.get_schedules().sort(
            (a, b) => b.get_fitness(arrangement) - a.get_fitness(arrangement)
        );
        const current_schedule = population.get_schedules()[0];
        const current_fitness = current_schedule.get_fitness(arrangement);

        if (current_fitness > best_fitness) {
            best_schedule = current_schedule;
            best_fitness = current_fitness;
            best_generation = generation_number;
        }
    }

    return { schedule: best_schedule, generation: best_generation, generation_number: generation_number };
}

export async function handler(event, context) {
    try {
        const selected = [{ "code": "CSC508", "campus": "B", "session": "20254", "faculty": "CD", "classes": [{ "class_group": "NBCS2305A", "select": true }, { "class_group": "CDCS2304A", "select": true }, { "class_group": "CDCS2304B", "select": false }, { "class_group": "CDCS2534B", "select": false }, { "class_group": "CDCS2304C", "select": false }, { "class_group": "CDCS2304D", "select": false }, { "class_group": "CDCS2534A", "select": false }, { "class_group": "CDCS2536A", "select": false }] }, { "code": "CSC569", "campus": "B", "session": "20254", "faculty": "CD", "classes": [{ "class_group": "NBCS2305A", "select": false }, { "class_group": "CDCS2304C", "select": false }, { "class_group": "CDCS2304D", "select": false }, { "class_group": "CDCS2304A", "select": true }, { "class_group": "CDCS2304B", "select": false }] }, { "code": "CSC577", "campus": "B", "session": "20254", "faculty": "CD", "classes": [{ "class_group": "NBCS2305A", "select": false }, { "class_group": "CDCS2304A", "select": true }, { "class_group": "CDCS2304B", "select": false }, { "class_group": "CDCS2304C", "select": false }, { "class_group": "CDCS2304D", "select": false }, { "class_group": "CDCS2534A", "select": false }, { "class_group": "CDCS2534B", "select": false }] }, { "code": "CSC584", "campus": "B", "session": "20254", "faculty": "CD", "classes": [{ "class_group": "NBCS2306A", "select": false }, { "class_group": "NBCS2404A", "select": false }, { "class_group": "CDCS2304A", "select": false }, { "class_group": "CDCS2304B", "select": false }, { "class_group": "CDCS2304C", "select": false }, { "class_group": "CDCS2304D", "select": false }, { "class_group": "CDCS2404A", "select": true }, { "class_group": "CDCS2404B", "select": false }, { "class_group": "CDCS2404C", "select": false }, { "class_group": "CDCS2664A", "select": false }, { "class_group": "CDCS2664B", "select": false }, { "class_group": "CDCS2534B", "select": false }, { "class_group": "CDCS2534A", "select": false }, { "class_group": "CDCS2536A", "select": false }] }, { "code": "CTU554", "campus": "CITU", "session": "20254", "faculty": "CITU", "classes": [{ "class_group": "NAMAF4A", "select": false }, { "class_group": "NBCS2303A", "select": false }, { "class_group": "NBCS2303B", "select": false }, { "class_group": "NBCS2408A", "select": false }, { "class_group": "NBF9A", "select": false }, { "class_group": "NBF9B", "select": false }, { "class_group": "NBH9A", "select": false }, { "class_group": "NBH9B", "select": false }, { "class_group": "NBH9C", "select": false }, { "class_group": "NBI8A", "select": false }, { "class_group": "NBM8A", "select": false }, { "class_group": "NBO9A", "select": false }, { "class_group": "NBO9B", "select": false }, { "class_group": "NBSA7A", "select": false }, { "class_group": "NBSA7B", "select": false }, { "class_group": "NCCAE3", "select": false }, { "class_group": "NCCAG3", "select": false }, { "class_group": "NCIMBF2A", "select": false }, { "class_group": "NCIMBF5A", "select": false }, { "class_group": "NHMA4A", "select": false }, { "class_group": "NMCP9A", "select": false }, { "class_group": "NSRB2A", "select": false }, { "class_group": "NSRB2B", "select": false }, { "class_group": "NBENT5A", "select": false }, { "class_group": "NBTM5A", "select": false }, { "class_group": "NBTM5B", "select": false }, { "class_group": "NHSI5A", "select": false }, { "class_group": "NHSI5B", "select": false }, { "class_group": "NCIMBFP4A", "select": false }, { "class_group": "NIMBF4A", "select": false }, { "class_group": "554-CS01", "select": false }, { "class_group": "554-CS08", "select": false }, { "class_group": "554-CS16", "select": true }, { "class_group": "554-CS25", "select": false }, { "class_group": "554-CS27", "select": false }, { "class_group": "554-CS28", "select": false }, { "class_group": "554-CS31", "select": false }, { "class_group": "554-CS32", "select": false }, { "class_group": "554-CS33", "select": false }, { "class_group": "554-CS34", "select": false }, { "class_group": "554-CS35", "select": false }, { "class_group": "554-CS36", "select": false }, { "class_group": "554-CS43", "select": false }, { "class_group": "554-EC01", "select": false }, { "class_group": "554-EC02", "select": false }, { "class_group": "554-EC03", "select": false }, { "class_group": "554-EC04", "select": false }, { "class_group": "554-EM01", "select": false }, { "class_group": "554-EM02", "select": false }, { "class_group": "554-EM04", "select": false }, { "class_group": "554-IC01", "select": false }, { "class_group": "554-IC02", "select": false }, { "class_group": "554-IC03", "select": false }, { "class_group": "554-IC04", "select": false }, { "class_group": "554-IC05", "select": false }, { "class_group": "554-IC06", "select": false }, { "class_group": "554-IC07", "select": false }, { "class_group": "554-IC08", "select": false }, { "class_group": "554-IC09", "select": false }, { "class_group": "554-SR03", "select": false }, { "class_group": "554-SR04", "select": false }, { "class_group": "554-SR06", "select": false }, { "class_group": "554S-AD01", "select": false }, { "class_group": "554S-AD02", "select": false }, { "class_group": "554S-AD03", "select": false }, { "class_group": "554S-AD04", "select": false }, { "class_group": "554S-AD05", "select": false }, { "class_group": "554S-AP12", "select": false }, { "class_group": "554S-AP13", "select": false }, { "class_group": "554S-AP14", "select": false }, { "class_group": "554-AC15", "select": false }, { "class_group": "554-AC16", "select": false }, { "class_group": "554-HM03", "select": false }, { "class_group": "554-HM06", "select": false }, { "class_group": "554-HM09", "select": false }, { "class_group": "554-HM11", "select": false }, { "class_group": "554-PH01", "select": false }, { "class_group": "554-PH02", "select": false }, { "class_group": "554-PH03", "select": false }, { "class_group": "554-PH04", "select": false }, { "class_group": "554P-AD01", "select": false }, { "class_group": "554P-AD02", "select": false }, { "class_group": "554P-AD03", "select": false }, { "class_group": "554P-AD04", "select": false }, { "class_group": "554P-AD05", "select": false }, { "class_group": "554P-AD06", "select": false }, { "class_group": "554P-AD07", "select": false }, { "class_group": "554P-AD08", "select": false }, { "class_group": "554P-AD09", "select": false }, { "class_group": "554P-AD10", "select": false }, { "class_group": "554P-AD11", "select": false }, { "class_group": "554P-AP03", "select": false }, { "class_group": "554P-AP04", "select": false }, { "class_group": "554-CS20", "select": false }, { "class_group": "554-CS38", "select": false }, { "class_group": "554-EC06", "select": false }, { "class_group": "554-EE01", "select": false }, { "class_group": "554-EE02", "select": false }, { "class_group": "554-EE03", "select": false }, { "class_group": "554-EE04", "select": false }, { "class_group": "554-EE09", "select": false }, { "class_group": "554-EE10", "select": false }, { "class_group": "554-EE11", "select": false }, { "class_group": "554-EE12", "select": false }, { "class_group": "554-EH01", "select": false }, { "class_group": "554-LG08", "select": false }, { "class_group": "554-LG09", "select": false }, { "class_group": "554-LG10", "select": false }, { "class_group": "554-MU01", "select": false }, { "class_group": "554-SR02", "select": false }, { "class_group": "554-SR05", "select": false }, { "class_group": "554S-AP15", "select": false }, { "class_group": "554-BA22", "select": false }, { "class_group": "554-BA23", "select": false }, { "class_group": "554-BA24", "select": false }, { "class_group": "554-BA25", "select": false }, { "class_group": "554-BA26", "select": false }, { "class_group": "554-BA27", "select": false }, { "class_group": "554-BA28", "select": false }, { "class_group": "554-BA29", "select": false }, { "class_group": "554-BA30", "select": false }, { "class_group": "554-BA31", "select": false }, { "class_group": "554-BA32", "select": false }, { "class_group": "554-BA33", "select": false }, { "class_group": "554-BA34", "select": false }, { "class_group": "554-BA35", "select": false }, { "class_group": "554-BA36", "select": false }, { "class_group": "554-BA37", "select": false }, { "class_group": "554-BA38", "select": false }, { "class_group": "554-BA39", "select": false }, { "class_group": "554-HM01", "select": false }, { "class_group": "554-HM02", "select": false }, { "class_group": "554-HM05", "select": false }, { "class_group": "554-HM08", "select": false }, { "class_group": "554-HM12", "select": false }, { "class_group": "554-HS03", "select": false }, { "class_group": "554-PH05", "select": false }, { "class_group": "554-PH06", "select": false }, { "class_group": "554-PH07", "select": false }, { "class_group": "554-PH08", "select": false }, { "class_group": "554P-AP02", "select": false }, { "class_group": "554P-AP05", "select": false }, { "class_group": "554-FF05", "select": false }, { "class_group": "554-AS01", "select": false }, { "class_group": "554-AS02", "select": false }, { "class_group": "554-AS03", "select": false }, { "class_group": "554-AS04", "select": false }, { "class_group": "554-AS05", "select": false }, { "class_group": "554-AS06", "select": false }, { "class_group": "554-AS07", "select": false }, { "class_group": "554-AS08", "select": false }, { "class_group": "554-AS09", "select": false }, { "class_group": "554-AS10", "select": false }, { "class_group": "554-AS11", "select": false }, { "class_group": "554-AS12", "select": false }, { "class_group": "554-CS04", "select": false }, { "class_group": "554-CS05", "select": false }, { "class_group": "554-CS06", "select": false }, { "class_group": "554-CS18", "select": false }, { "class_group": "554-CS19", "select": false }, { "class_group": "554-CS22", "select": false }, { "class_group": "554-CS26", "select": false }, { "class_group": "554-CS37", "select": false }, { "class_group": "554-CS42", "select": false }, { "class_group": "554-EC05", "select": false }, { "class_group": "554-EE05", "select": false }, { "class_group": "554-EE06", "select": false }, { "class_group": "554-EE07", "select": false }, { "class_group": "554-EE08", "select": false }, { "class_group": "554-EE13", "select": false }, { "class_group": "554-EM03", "select": false }, { "class_group": "554-SR01", "select": false }, { "class_group": "554-AC01", "select": false }, { "class_group": "554-AC02", "select": false }, { "class_group": "554-AC03", "select": false }, { "class_group": "554-AC04", "select": false }, { "class_group": "554-AC05", "select": false }, { "class_group": "554-AC06", "select": false }, { "class_group": "554-AC07", "select": false }, { "class_group": "554-AC08", "select": false }, { "class_group": "554-AC09", "select": false }, { "class_group": "554-AC10", "select": false }, { "class_group": "554-AC11", "select": false }, { "class_group": "554-AC12", "select": false }, { "class_group": "554-AC13", "select": false }, { "class_group": "554-AC14", "select": false }, { "class_group": "554-BA01", "select": false }, { "class_group": "554-BA02", "select": false }, { "class_group": "554-BA03", "select": false }, { "class_group": "554-BA04", "select": false }, { "class_group": "554-BA05", "select": false }, { "class_group": "554-BA06", "select": false }, { "class_group": "554-BA07", "select": false }, { "class_group": "554-BA08", "select": false }, { "class_group": "554-BA09", "select": false }, { "class_group": "554-BA10", "select": false }, { "class_group": "554-BA11", "select": false }, { "class_group": "554-BA12", "select": false }, { "class_group": "554-BA13", "select": false }, { "class_group": "554-BA14", "select": false }, { "class_group": "554-BA15", "select": false }, { "class_group": "554-BA16", "select": false }, { "class_group": "554-BA17", "select": false }, { "class_group": "554-BA18", "select": false }, { "class_group": "554-BA19", "select": false }, { "class_group": "554-BA20", "select": false }, { "class_group": "554-BA21", "select": false }, { "class_group": "554-ED01", "select": false }, { "class_group": "554-ED02", "select": false }, { "class_group": "554-ED03", "select": false }, { "class_group": "554-ED04", "select": false }, { "class_group": "554-ED05", "select": false }, { "class_group": "554-ED06", "select": false }, { "class_group": "554-ED07", "select": false }, { "class_group": "554-ED08", "select": false }, { "class_group": "554-HM10", "select": false }, { "class_group": "554-HM14", "select": false }, { "class_group": "554-FF01", "select": false }, { "class_group": "554-FF04", "select": false }, { "class_group": "554-IM01", "select": false }, { "class_group": "554-IM02", "select": false }, { "class_group": "554-IM03", "select": false }, { "class_group": "554-IM04", "select": false }, { "class_group": "554-IM05", "select": false }, { "class_group": "554-IM06", "select": false }, { "class_group": "554-IM07", "select": false }, { "class_group": "554-IM08", "select": false }, { "class_group": "554-IM09", "select": false }, { "class_group": "554-IM10", "select": false }, { "class_group": "554-IM11", "select": false }, { "class_group": "554-IM12", "select": false }, { "class_group": "554-IM13", "select": false }, { "class_group": "554-IM14", "select": false }, { "class_group": "554-CS03", "select": false }, { "class_group": "554-CS07", "select": false }, { "class_group": "554-CS09", "select": false }, { "class_group": "554-CS10", "select": false }, { "class_group": "554-CS11", "select": false }, { "class_group": "554-CS12", "select": false }, { "class_group": "554-CS15", "select": false }, { "class_group": "554-CS17", "select": false }, { "class_group": "554-CS21", "select": false }, { "class_group": "554-CS24", "select": false }, { "class_group": "554-CS29", "select": false }, { "class_group": "554-CS30", "select": false }, { "class_group": "554-CS39", "select": false }, { "class_group": "554-CS40", "select": false }, { "class_group": "554-CS41", "select": false }, { "class_group": "554-LG01", "select": false }, { "class_group": "554-LG02", "select": false }, { "class_group": "554-LG03", "select": false }, { "class_group": "554-LG04", "select": false }, { "class_group": "554-LG05", "select": false }, { "class_group": "554-LG06", "select": false }, { "class_group": "554-LG07", "select": false }, { "class_group": "554-LW01", "select": false }, { "class_group": "554-LW02", "select": false }, { "class_group": "554-LW03", "select": false }, { "class_group": "554-LW04", "select": false }, { "class_group": "554-LW05", "select": false }, { "class_group": "554-LW06", "select": false }, { "class_group": "554-MC01", "select": false }, { "class_group": "554-MC02", "select": false }, { "class_group": "554-MC03", "select": false }, { "class_group": "554-MC04", "select": false }, { "class_group": "554-MC05", "select": false }, { "class_group": "554-MC06", "select": false }, { "class_group": "554-MC07", "select": false }, { "class_group": "554-MC08", "select": false }, { "class_group": "554-MC09", "select": false }, { "class_group": "554-MC10", "select": false }, { "class_group": "554-MC11", "select": false }, { "class_group": "554-MC12", "select": false }, { "class_group": "554-HM04", "select": false }, { "class_group": "554-HM07", "select": false }, { "class_group": "554-HM13", "select": false }, { "class_group": "554-FF03", "select": false }, { "class_group": "554-CS02", "select": false }, { "class_group": "554-CS13", "select": false }, { "class_group": "554-CS14", "select": false }, { "class_group": "554-CS23", "select": false }, { "class_group": "554S-AP01", "select": false }, { "class_group": "554S-AP02", "select": false }, { "class_group": "554S-AP03", "select": false }, { "class_group": "554S-AP04", "select": false }, { "class_group": "554S-AP05", "select": false }, { "class_group": "554S-AP06", "select": false }, { "class_group": "554S-AP07", "select": false }, { "class_group": "554S-AP08", "select": false }, { "class_group": "554S-AP09", "select": false }, { "class_group": "554S-AP10", "select": false }, { "class_group": "554S-AP11", "select": false }, { "class_group": "554-HS01", "select": false }, { "class_group": "554-HS02", "select": false }, { "class_group": "554P-AP01", "select": false }, { "class_group": "554-FF02", "select": false }, { "class_group": "LWSS6AY", "select": false }, { "class_group": "LWSS6BY", "select": false }, { "class_group": "NACAB7A", "select": false }, { "class_group": "NACAB7B", "select": false }, { "class_group": "NACAB7C", "select": false }, { "class_group": "NAP2465A", "select": false }, { "class_group": "NAS201F4A", "select": false }, { "class_group": "NCFAP2465A", "select": false }] }, { "code": "ICT502", "campus": "B", "session": "20254", "faculty": "CD", "classes": [{ "class_group": "NBCS2306A", "select": false }, { "class_group": "CDCS2305D", "select": false }, { "class_group": "CDCS2664A", "select": false }, { "class_group": "CDCS2664B", "select": false }, { "class_group": "CDCS2304A", "select": true }, { "class_group": "CDCS2304B", "select": false }, { "class_group": "CDCS2304C", "select": false }, { "class_group": "CDCS2306A", "select": false }, { "class_group": "CDCS2306C", "select": false }, { "class_group": "CDCS2304D", "select": false }, { "class_group": "CDCS2306B", "select": false }] }, { "code": "LCC500", "campus": "APB", "session": "20254", "faculty": "APB", "classes": [{ "class_group": "LWSS1AX", "select": false }, { "class_group": "LWSS1BX", "select": false }, { "class_group": "NACAB4A", "select": false }, { "class_group": "NACAB4B", "select": false }, { "class_group": "NAS211F2A", "select": false }, { "class_group": "NBCS2306A", "select": false }, { "class_group": "NBCS2405A", "select": false }, { "class_group": "NBCS2557A", "select": false }, { "class_group": "NCCAG5", "select": false }, { "class_group": "NCFAP2467A", "select": false }, { "class_group": "NHMA4A", "select": false }, { "class_group": "ACLCC500-14", "select": false }, { "class_group": "ACLCC500-15", "select": false }, { "class_group": "ADLCC500-01PA", "select": false }, { "class_group": "ADLCC500-02PA", "select": false }, { "class_group": "ADLCC500-03PA", "select": false }, { "class_group": "ADLCC500-04PA", "select": false }, { "class_group": "ADLCC500-05PA", "select": false }, { "class_group": "ADLCC500-06PA", "select": false }, { "class_group": "APLCC500-01", "select": false }, { "class_group": "APLCC500-02", "select": false }, { "class_group": "CSLCC500-01", "select": false }, { "class_group": "CSLCC500-02", "select": true }, { "class_group": "CSLCC500-03", "select": false }, { "class_group": "CSLCC500-04", "select": false }, { "class_group": "CSLCC500-05", "select": false }, { "class_group": "FFLCC500-04", "select": false }, { "class_group": "FFLCC500-05", "select": false }, { "class_group": "HMLCC500-02", "select": false }, { "class_group": "HSLCC500-03", "select": false }, { "class_group": "HSLCC500-04", "select": false }, { "class_group": "LWLCC500-01", "select": false }, { "class_group": "LWLCC500-02", "select": false }, { "class_group": "LWLCC500-03", "select": false }, { "class_group": "LWLCC500-04", "select": false }, { "class_group": "LWLCC500-05", "select": false }, { "class_group": "LWLCC500-06", "select": false }, { "class_group": "LWLCC500-07", "select": false }, { "class_group": "LWLCC500-08", "select": false }, { "class_group": "LWLCC500-09", "select": false }, { "class_group": "LWLCC500-10", "select": false }, { "class_group": "ADLCC500-01", "select": false }, { "class_group": "ADLCC500-02", "select": false }, { "class_group": "ADLCC500-03", "select": false }, { "class_group": "ADLCC500-04", "select": false }, { "class_group": "ADLCC500-05", "select": false }, { "class_group": "ADLCC500-06", "select": false }, { "class_group": "APLCC500-03", "select": false }, { "class_group": "APLCC500-04", "select": false }, { "class_group": "APLCC500-05PA", "select": false }, { "class_group": "APLCC500-06PA", "select": false }, { "class_group": "ASLCC500-01", "select": false }, { "class_group": "ASLCC500-02", "select": false }, { "class_group": "ASLCC500-03", "select": false }, { "class_group": "ASLCC500-04", "select": false }, { "class_group": "ASLCC500-05", "select": false }, { "class_group": "ASLCC500-06", "select": false }, { "class_group": "ASLCC500-07", "select": false }, { "class_group": "ASLCC500-08", "select": false }, { "class_group": "ASLCC500-09", "select": false }, { "class_group": "ASLCC500-10", "select": false }, { "class_group": "ASLCC500-11", "select": false }, { "class_group": "CSLCC500-06", "select": false }, { "class_group": "CSLCC500-07", "select": false }, { "class_group": "FFLCC500-06", "select": false }, { "class_group": "HMLCC500-03", "select": false }, { "class_group": "ICLCC500-01", "select": false }, { "class_group": "ICLCC500-02", "select": false }, { "class_group": "ICLCC500-03", "select": false }, { "class_group": "ICLCC500-05", "select": false }, { "class_group": "ICLCC500-06", "select": false }, { "class_group": "ICLCC500-07", "select": false }, { "class_group": "ICLCC500-08", "select": false }, { "class_group": "ICLCC500-09", "select": false }, { "class_group": "ICLCC500-10", "select": false }, { "class_group": "MULCC500-01", "select": false }, { "class_group": "APLCC500-01PA", "select": false }, { "class_group": "APLCC500-02PA", "select": false }, { "class_group": "APLCC500-03PA", "select": false }, { "class_group": "APLCC500-04PA", "select": false }, { "class_group": "APLCC500-05", "select": false }, { "class_group": "APLCC500-07PA", "select": false }, { "class_group": "APLCC500-08", "select": false }, { "class_group": "ASLCC500-12", "select": false }, { "class_group": "ASLCC500-13", "select": false }, { "class_group": "ASLCC500-14", "select": false }, { "class_group": "ASLCC500-15", "select": false }, { "class_group": "ASLCC500-16", "select": false }, { "class_group": "ASLCC500-17", "select": false }, { "class_group": "CSLCC500-08", "select": false }, { "class_group": "CSLCC500-09", "select": false }, { "class_group": "CSLCC500-10", "select": false }, { "class_group": "CSLCC500-11", "select": false }, { "class_group": "CSLCC500-12", "select": false }, { "class_group": "CSLCC500-13", "select": false }, { "class_group": "CSLCC500-14", "select": false }, { "class_group": "EDLCC500-01", "select": false }, { "class_group": "EDLCC500-02", "select": false }, { "class_group": "EDLCC500-03", "select": false }, { "class_group": "EDLCC500-04", "select": false }, { "class_group": "EDLCC500-05", "select": false }, { "class_group": "EDLCC500-06", "select": false }, { "class_group": "EDLCC500-07", "select": false }, { "class_group": "FFLCC500-02", "select": false }, { "class_group": "FFLCC500-07", "select": false }, { "class_group": "HMLCC500-04", "select": false }, { "class_group": "HMLCC500-05", "select": false }, { "class_group": "HMLCC500-06", "select": false }, { "class_group": "HMLCC500-07", "select": false }, { "class_group": "HMLCC500-08", "select": false }, { "class_group": "HSLCC500-01", "select": false }, { "class_group": "HSLCC500-02", "select": false }, { "class_group": "MDLCC500-01", "select": false }, { "class_group": "MDLCC500-02", "select": false }, { "class_group": "MDLCC500-03", "select": false }, { "class_group": "MDLCC500-04", "select": false }, { "class_group": "MDLCC500-05", "select": false }, { "class_group": "MDLCC500-06", "select": false }, { "class_group": "MDLCC500-07", "select": false }, { "class_group": "MDLCC500-08", "select": false }, { "class_group": "MDLCC500-09", "select": false }, { "class_group": "SRLCC500-01", "select": false }, { "class_group": "SRLCC500-02", "select": false }, { "class_group": "SRLCC500-03", "select": false }, { "class_group": "SRLCC500-04", "select": false }, { "class_group": "SRLCC500-05", "select": false }, { "class_group": "SRLCC500-06", "select": false }, { "class_group": "SRLCC500-07", "select": false }, { "class_group": "APLCC500-06", "select": false }, { "class_group": "APLCC500-07", "select": false }, { "class_group": "CSLCC500-15", "select": false }, { "class_group": "CSLCC500-16", "select": false }, { "class_group": "CSLCC500-17", "select": false }, { "class_group": "CSLCC500-18", "select": false }, { "class_group": "CSLCC500-19", "select": false }, { "class_group": "CSLCC500-20", "select": false }, { "class_group": "CSLCC500-21", "select": false }, { "class_group": "CSLCC500-22", "select": false }, { "class_group": "FFLCC500-01", "select": false }, { "class_group": "HMLCC500-09", "select": false }, { "class_group": "HMLCC500-10", "select": false }, { "class_group": "HMLCC500-11", "select": false }, { "class_group": "HMLCC500-12", "select": false }, { "class_group": "ACLCC500-01", "select": false }, { "class_group": "ACLCC500-02", "select": false }, { "class_group": "ACLCC500-03", "select": false }, { "class_group": "ACLCC500-04", "select": false }, { "class_group": "ACLCC500-05", "select": false }, { "class_group": "ACLCC500-06", "select": false }, { "class_group": "ACLCC500-07", "select": false }, { "class_group": "ACLCC500-08", "select": false }, { "class_group": "ACLCC500-09", "select": false }, { "class_group": "ACLCC500-10", "select": false }, { "class_group": "ACLCC500-11", "select": false }, { "class_group": "ACLCC500-12", "select": false }, { "class_group": "ACLCC500-13", "select": false }, { "class_group": "CSLCC500-23", "select": false }, { "class_group": "CSLCC500-24", "select": false }, { "class_group": "NACAB4C", "select": false }, { "class_group": "NCCAF5", "select": false }, { "class_group": "NSRB2A", "select": false }, { "class_group": "NSRB2B", "select": false }, { "class_group": "NHSP5A", "select": false }, { "class_group": "NHSP5B", "select": false }] }, { "code": "TFC451", "campus": "APB", "session": "20254", "faculty": "APB", "classes": [{ "class_group": "NHMC4A", "select": false }, { "class_group": "LWT2FA", "select": false }, { "class_group": "APT2FA", "select": false }, { "class_group": "APT2FA-PA", "select": false }, { "class_group": "CST2FA", "select": true }, { "class_group": "CST2FB", "select": false }, { "class_group": "CST2FC", "select": false }, { "class_group": "CST2FD", "select": false }, { "class_group": "CST2FE", "select": false }, { "class_group": "ACT2FA", "select": false }, { "class_group": "ACT2FB", "select": false }, { "class_group": "IMT2FA", "select": false }, { "class_group": "LGT2FA", "select": false }, { "class_group": "LGT2FB", "select": false }, { "class_group": "AST2FA", "select": false }, { "class_group": "AST2FB", "select": false }, { "class_group": "EDT2FA", "select": false }, { "class_group": "MCT2FA", "select": false }, { "class_group": "HMT2FA", "select": false }, { "class_group": "HMT2FB", "select": false }] }]
        const scraper = await new DataScraper(selected).init();
        const { schedule, generation, generation_number } = find_fittest_schedule(scraper, 1);

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