import { tailspin } from 'ldrs'
import { Droppable, Draggable } from "@hello-pangea/dnd";

export function CourseSelect({ isLoading, isLoadingSession, courses, handleRemoveCourse }) {
    tailspin.register()

    return (
        <div className="bg-white mb-5 overflow-x-auto xl:no-scrollbar h-110 m-1">
            <table className="w-full border-separate border-spacing-y-2 min-w-max">
                <thead>
                    <tr className="text-xs text-stone-500">
                        <th className="px-4 text-start w-15 py-2 bg-gray-100 rounded-l-lg">#</th>
                        <th className="px-2 text-start w-30 py-2 bg-gray-100">COURSE</th>
                        <th className="px-2 text-start w-25 py-2 bg-gray-100">SESSION</th>
                        <th className="px-2 text-start w-20 py-2 bg-gray-100">CAMPUS</th>
                        <th className="px-2 text-start w-20 py-2 bg-gray-100">FACULTY</th>
                        <th className="px-2 text-start w-30 py-2 bg-gray-100">TOTAL CLASSES</th>
                        <th className="px-2 text-start w-20 py-2 bg-gray-100 rounded-r-lg">ACTION</th>
                    </tr>
                </thead>
                <Droppable droppableId="select" type="group">
                    {(provided) => (
                        <tbody
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {(isLoading || isLoadingSession) ? (
                                <tr>
                                    <td colSpan="100%" className="text-center">
                                        <div className="flex justify-center items-center h-95">
                                            <l-tailspin size="40" stroke="5" speed="0.9" color="black" />
                                        </div>
                                    </td>
                                </tr>
                            ) : courses?.length ? (
                                courses.map((course, index) => (
                                    <Draggable
                                        draggableId={`select-${course.code}-${course.session}-${course.campus}`}
                                        key={`${course.code}-${course.session}-${course.campus}`}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <tr
                                                className="bg-white rounded-lg overflow-hidden font-light select-none hover:bg-purple-200 hover:border-purple-400 hover:border-2"
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}
                                                ref={provided.innerRef}
                                            >
                                                <td className="py-2 px-4 border-b-1 border-gray-300 font-normal">{index + 1}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300">{course.code}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300">{course.session}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300">{course.campus}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300">{course.faculty}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300">{course.classes.length}</td>
                                                <td className="py-2 px-2 border-b-1 border-gray-300 flex gap-3 items-center text-[#555]">
                                                    <svg 
                                                        onClick={() => handleRemoveCourse(course.code, course.session, course.campus, course.faculty)}
                                                        className="rounded-full hover:bg-gray-300 p-2 cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                                    </svg>
                                                    <svg className="ml-auto" width="16" height="16" viewBox="-3 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M1.5 3.5C0.67157 3.5 0 2.82843 0 2C0 1.17157 0.67157 0.5 1.5 0.5C2.3284 0.5 3 1.17157 3 2C3 2.82843 2.3284 3.5 1.5 3.5zM1.5 8.5C0.67157 8.5 0 7.8284 0 7C0 6.1716 0.67157 5.5 1.5 5.5C2.3284 5.5 3 6.1716 3 7C3 7.8284 2.3284 8.5 1.5 8.5zM1.5 13.5C0.67157 13.5 0 12.8284 0 12C0 11.1716 0.67157 10.5 1.5 10.5C2.3284 10.5 3 11.1716 3 12C3 12.8284 2.3284 13.5 1.5 13.5zM6.5 3.5C5.6716 3.5 5 2.82843 5 2C5 1.17157 5.6716 0.5 6.5 0.5C7.3284 0.5 8 1.17157 8 2C8 2.82843 7.3284 3.5 6.5 3.5zM6.5 8.5C5.6716 8.5 5 7.8284 5 7C5 6.1716 5.6716 5.5 6.5 5.5C7.3284 5.5 8 6.1716 8 7C8 7.8284 7.3284 8.5 6.5 8.5zM6.5 13.5C5.6716 13.5 5 12.8284 5 12C5 11.1716 5.6716 10.5 6.5 10.5C7.3284 10.5 8 11.1716 8 12C8 12.8284 7.3284 13.5 6.5 13.5z" fill="#555" /></svg>
                                                    &nbsp;
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <tr className="bg-white overflow-hidden">
                                    <td colSpan={7} className="py-2 px-4 rounded-lg text-center">
                                        Cannot find any data
                                    </td>
                                </tr>
                            )}

                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
            </table>
        </div>
    );
}