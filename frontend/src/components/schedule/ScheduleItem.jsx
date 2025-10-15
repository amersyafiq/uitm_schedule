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
        "09:00": "left-42.5",
        "10:00": "left-60",
        "11:00": "left-77.5",
        "12:00": "left-95",
        "13:00": "left-112.5",
        "14:00": "left-130",
        "15:00": "left-147.5",
        "16:00": "left-165",
    }

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