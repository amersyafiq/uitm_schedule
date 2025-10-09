import { Droppable, Draggable } from "@hello-pangea/dnd";

export function CourseSchedule({ schedCourses }) {
    return (
        <div className="h-full mb-5">
            <div className="mt-2 border-2 border-dashed rounded-lg border-stone-300 bg-gray-100 p-3" >
                <table className="w-full border-separate border-spacing-y-1">
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
                                                        <svg width="16" height="16" viewBox="-3 0 14 14" id="meteor-icon-kit__solid-grip-vertical-s" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 3.5C0.67157 3.5 0 2.82843 0 2C0 1.17157 0.67157 0.5 1.5 0.5C2.3284 0.5 3 1.17157 3 2C3 2.82843 2.3284 3.5 1.5 3.5zM1.5 8.5C0.67157 8.5 0 7.8284 0 7C0 6.1716 0.67157 5.5 1.5 5.5C2.3284 5.5 3 6.1716 3 7C3 7.8284 2.3284 8.5 1.5 8.5zM1.5 13.5C0.67157 13.5 0 12.8284 0 12C0 11.1716 0.67157 10.5 1.5 10.5C2.3284 10.5 3 11.1716 3 12C3 12.8284 2.3284 13.5 1.5 13.5zM6.5 3.5C5.6716 3.5 5 2.82843 5 2C5 1.17157 5.6716 0.5 6.5 0.5C7.3284 0.5 8 1.17157 8 2C8 2.82843 7.3284 3.5 6.5 3.5zM6.5 8.5C5.6716 8.5 5 7.8284 5 7C5 6.1716 5.6716 5.5 6.5 5.5C7.3284 5.5 8 6.1716 8 7C8 7.8284 7.3284 8.5 6.5 8.5zM6.5 13.5C5.6716 13.5 5 12.8284 5 12C5 11.1716 5.6716 10.5 6.5 10.5C7.3284 10.5 8 11.1716 8 12C8 12.8284 7.3284 13.5 6.5 13.5z" fill="#555"/></svg>
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