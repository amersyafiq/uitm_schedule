import { diffHours } from "../../utils/time";

export function ScheduleItem({ c, setShow, setModalData }) {
    const colorMap = {
        1: "border-l-4 border-blue-400 bg-blue-300",
        2: "border-l-4 border-red-400 bg-red-300",
        3: "border-l-4 border-green-400 bg-green-300",
        4: "border-l-4 border-yellow-400 bg-yellow-300",
        5: "border-l-4 border-purple-400 bg-purple-300",
        6: "border-l-4 border-pink-400 bg-pink-300",
        7: "border-l-4 border-indigo-400 bg-indigo-300",
        8: "border-l-4 border-teal-400 bg-teal-300",
        9: "border-l-4 border-orange-400 bg-orange-300",
        10: "border-l-4 border-lime-400 bg-lime-300",
    };

    const position = {
        "08:00": "left-25",
        "08:30": "left-33.75",
        "09:00": "left-42.5",
        "09:30": "left-51.25",
        "10:00": "left-60",
        "10:30": "left-68.75",
        "11:00": "left-77.5",
        "11:30": "left-86.25",
        "12:00": "left-95",
        "12:30": "left-103.75",
        "13:00": "left-112.5",
        "13:30": "left-121.25",
        "14:00": "left-130",
        "14:30": "left-138.75",
        "15:00": "left-147.5",
        "15:30": "left-156.25",
        "16:00": "left-165",
        "16:30": "left-173.75",
        "17:00": "left-182.5",
        "17:30": "left-191.25",
        "18:00": "left-200",
        "18:30": "left-208.75",
        "19:00": "left-217.5",
        "19:30": "left-226.25",
        "20:00": "left-235",
        "20:30": "left-243.75",
        "21:00": "left-252.5",
        "21:30": "left-261.25",
        "22:00": "left-270"
    };


    const length = {
        1: "w-18",
        2: "w-35",
        3: "w-74"
    }

    const colorMapParams = ((c.class_id * 7) - 1) % 10 + 1;

    return (
        <div
            className={`${position[c.timeslot.start_time]} ${length[diffHours(c.timeslot.start_time, c.timeslot.end_time)]} 
                        absolute h-20 p-1 flex flex-col justify-center`}
            onClick={() => {
                setShow(true)
                setModalData(() => ({
                    ...c,
                    color: colorMapParams,
                }))
            }}
        >
            <div className={`${colorMap[colorMapParams]} shadow-sm flex flex-col justify-center px-3 h-full w-full rounded-lg cursor-pointer select-none hover:transform hover:-translate-y-1 transition-transform ease-in duration-100 `}>
                <p className="text-xs font-bold dark:text-stone-700 text-white leading-3">{c.timeslot.room_code}</p>
                <h1 className="dark:text-black text-white">{c.course_code}</h1>
                <p className="leading-2 font-normal text-xs">{c.class_group}</p>
            </div>
        </div>
    );
}