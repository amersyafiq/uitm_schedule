import { ScheduleItem } from "./ScheduleItem";

export function ScheduleRow({ index, classes, setShow, setModalData }) {
    const dayTop = {
        0: "top-15",
        1: "top-35",
        2: "top-55",
        3: "top-75",
        4: "top-95"
    }

    return (
        <div className={`absolute ${dayTop[index]} bg-black`}>
        { 
            classes.map((c) => {
                return (
                    <ScheduleItem key={c.timeslot.timeslot_id} c={c} setShow={setShow} setModalData={setModalData} />
                );
            })
        }
        </div>
    );
}