import dayjs from 'dayjs'

export function ScheduleItemModal({ setShow, modalData }) {
    const colorMap = {
        1: "bg-blue-400",
        2: "bg-red-400",
        3: "bg-green-400",
        4: "bg-yellow-400",
        5: "bg-purple-400",
        6: "bg-pink-400",
        7: "bg-indigo-400",
        8: "bg-teal-400",
        9: "bg-orange-400",
        10: "bg-lime-400",
    };

    return (
        <div
            className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center"
            onClick={() => setShow(false)}
        >
            <div
                className="bg-white w-100 rounded-2xl shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <svg onClick={() => { setShow(false) }}
                    className="w-3 h-3 absolute top-6 right-6 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path className="text-white" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <div className={`${colorMap[modalData.color]} w-full rounded-t-2xl py-3 px-5 text-white`}>
                    <h1 className="font-bold leading-4 text-lg">{modalData.course_code}</h1>
                    <p>Class Details</p>
                </div>
                <div className="w-full p-5">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="w-25"></th>
                                <th className="w-5"></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Campus</td><td> : </td><td className="font-light">{modalData.course_campus}</td></tr>
                            <tr><td>Session</td><td> : </td><td className="font-light">{modalData.course_session}</td></tr>
                            <tr><td>Class Group</td><td> : </td><td className="font-light">{modalData.class_group}</td></tr>
                            <tr><td>Day</td><td> : </td><td className="font-light">{dayjs().day(modalData.timeslot.day_of_week).format('dddd')}</td></tr>
                            <tr><td>Time</td><td> : </td><td className="font-light">{modalData.timeslot.start_time} - {modalData.timeslot.end_time}</td></tr>
                            <tr><td>Venue</td><td> : </td><td className="font-light">{modalData.timeslot.room_code}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}