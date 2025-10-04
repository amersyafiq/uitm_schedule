import { Droppable, Draggable } from "@hello-pangea/dnd";

export function CourseSchedule({ schedCourses, setSchedCourses }) {
    return (
        <div className="overflow-scroll no-scrollbar relative h-fit mb-5">
            {schedCourses?.length > 0 &&
                <div className="flex justify-end gap-2 mb-3">
                    <button
                        className="bg-stone-700 text-white px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-500"
                        onClick={() => setSchedCourses([])}
                    >
                        Clear
                    </button>
                    <button
                        className="bg-stone-700 text-white px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-500"
                        onClick={() => setSchedCourses([...schedCourses].sort((a, b) => a.code.localeCompare(b.code)))}
                    >
                        Sort
                    </button>
                </div>
            }
            <div className="mt-2 border-2 border-dashed rounded-lg border-stone-300 h-fit bg-gray-100" >
                <table className="w-full border-separate border-spacing-y-1 ">
                    <Droppable droppableId="schedule" type="group">
                        {(provided) => (
                            <tbody
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {schedCourses?.length ? (
                                    schedCourses.map((sched, index) => (
                                        <Draggable
                                            draggableId={`schedule-${sched.code}-${sched.session}-${sched.campus}`}
                                            key={`${sched.code}-${sched.session}-${sched.campus}`}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <tr
                                                    className="bg-white shadow rounded-lg overflow-hidden font-light select-none"
                                                    {...provided.dragHandleProps}
                                                    {...provided.draggableProps}
                                                    ref={provided.innerRef}
                                                >
                                                    <td className="py-1 px-4 rounded-l-lg">{index + 1}</td>
                                                    <td className="py-1 px-2">{sched.code}</td>
                                                    <td className="py-1 px-2">{sched.session}</td>
                                                    <td className="py-1 px-2">{sched.campus}</td>
                                                    <td className="py-1 px-2 rounded-r-lg">
                                                        <svg className="hover:bg-gray-200 rounded-sm ml-auto mr-2 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                                                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="1" d="M5 7h14M5 12h14M5 17h14" />
                                                        </svg>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))

                                ) : (
                                    <tr className="overflow-hidden">
                                        <td colSpan={7} className="py-2 px-4 rounded-lg text-center text-stone-400">
                                            Drag and drop courses here
                                        </td>
                                    </tr>
                                )}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </table>
            </div>
        </div >
    );
}