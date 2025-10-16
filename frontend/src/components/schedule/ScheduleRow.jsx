import { ScheduleItem } from "./ScheduleItem";

export function ScheduleRow({ index, classes, setShow, setModalData, hasNight }) {
    const dayTop = {
        0: "top-15",
        1: "top-35",
        2: "top-55",
        3: "top-75",
        4: "top-95",
        5: "top-115",
        6: "top-135"
    }

    const filteredClasses = hasNight
        ? classes
        : classes.filter(c => {
            const start = c.timeslot.start_time;
            const [hour, minute] = start.split(":").map(Number);
            return hour < 18 || (hour === 18 && minute === 0);
        });

    if (filteredClasses.length === 0) return null;

    return (
        <div className={`absolute ${dayTop[index]} bg-black`}>
        { 
            filteredClasses.map((c) => {
                return (
                    <ScheduleItem 
                        key={c.timeslot.timeslot_id} 
                        c={c} 
                        setShow={setShow} 
                        setModalData={setModalData} 
                    />
                );
            })
        }
        </div>
    );
}