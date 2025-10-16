import { ScheduleRow } from "./ScheduleRow.jsx";
import { useState } from "react"
import { ScheduleItemModal } from "./ScheduleItemModal.jsx";
import { tailspin } from 'ldrs'

export function Schedule({ schedule, isLoadingSched, hasWeekend, hasNight, ref }) {
    const [show, setShow] = useState(false)
    const [modalData, setModalData] = useState({})

    const days = hasWeekend ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Mon", "Tue", "Wed", "Thu", "Fri"]

    tailspin.register()

    return (
        <div 
            ref={ref}
            className="overflow-scroll no-scrollbar relative bg-white border-t-1 border-gray-300 mb-2">
            {
                isLoadingSched ? (
                    <div className="flex justify-center items-center h-95 ">
                        <l-tailspin size="40" stroke="5" speed="0.9" color="black" />
                    </div>
                ) : (
                    <>
                        <table className="w-55 my-5 table-fixed">
                            <thead>
                                <tr className="h-10 ">
                                    <th className="font-light w-25">&nbsp;</th>
                                    <th className="font-light w-35 text-start">08:00</th>
                                    <th className="font-light w-35 text-start">10:00</th>
                                    <th className="font-light w-35 text-start">12:00</th>
                                    <th className="font-light w-35 text-start">14:00</th>
                                    <th className="font-light w-35 text-start">16:00</th>
                                    {
                                        hasNight ? (
                                            <>
                                                <th className="font-light w-35 text-start">18:00</th>
                                                <th className="font-light w-35 text-start">20:00</th>
                                                <th className="font-light text-start w-20">22:00</th>
                                            </>
                                        ) : (
                                            <th className="font-light text-start w-20">18:00</th>
                                        )
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((day) => {
                                    return (
                                        <tr key={day} className={`relative`}>
                                            <td className="h-20 text-center text-sm font-semibold text-stone-500">{day}</td>
                                            <td className="bg-gray-50 border-stone-200 border-l-1"></td>
                                            <td className="bg-gray-50 border-stone-200 border-l-1"></td>
                                            <td className="bg-gray-50 border-stone-200 border-l-1"></td>
                                            <td className="bg-gray-50 border-stone-200 border-l-1"></td>
                                            <td className="bg-gray-50 border-stone-200 border-l-1 border-r-1"></td>
                                            { hasNight &&
                                                <>
                                                    <td className="bg-gray-50 border-stone-200 border-l-1"></td>
                                                    <td className="bg-gray-50 border-stone-200 border-l-1 border-r-1"></td>
                                                </> 
                                            }
                                            <td className="h-15 text-center">&nbsp;</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {schedule &&
                            <div className="absolute w-full h-full left-0 bottom-0" >
                                {days.map((day, index) => {
                                    return (
                                        <ScheduleRow 
                                            key={day} 
                                            index={index} 
                                            classes={schedule[String(index + 1)]} 
                                            setShow={setShow} 
                                            setModalData={setModalData}
                                            hasNight={hasNight}
                                        />
                                    );
                                })}
                            </div>
                        }
                    </>
                )
            }

            {show &&
                <ScheduleItemModal setShow={setShow} modalData={modalData} />
            }
        </div>
    );
}