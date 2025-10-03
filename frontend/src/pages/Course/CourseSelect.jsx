import { tailspin } from 'ldrs'
import axios from 'axios';
import { Droppable, Draggable } from "@hello-pangea/dnd";

export function CourseSelect({ isLoading, isLoadingSession, courses, fetchCourses }) {
    tailspin.register()

    const handleDeleteCourse = async (code, session, campus, faculty) => {
        try {
            await axios.delete(`/api/courses?campus=${campus}&faculty=${faculty}&code=${code}&session=${session}`, {
                headers: { "X-API-Key": "67b09141-e39e-4e86-a729-fc45940c93e3" },
            })
            fetchCourses()
        } catch (err) {
            if (err.response) {
                const { code, message } = err.response.data?.detail || {}

                switch (code) {
                    case "COURSE_NOT_FOUND":
                        alert(message)
                        break
                    default:
                        alert(err.message)
                }
            }
        }
    }

    return (
        <div className="overflow-scroll no-scrollbar relative bg-white mb-5 h-fit">
            <table className="w-full border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-sm text-stone-500">
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
                                                className="bg-white rounded-lg overflow-hidden font-light select-none"
                                                {...provided.dragHandleProps}
                                                {...provided.draggableProps}
                                                ref={provided.innerRef}
                                            >
                                                <td className="py-3.5 px-4 border-b-1 border-gray-300 font-normal">{index + 1}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300">{course.code}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300">{course.session}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300">{course.campus}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300">{course.faculty}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300">{course.classes.length}</td>
                                                <td className="py-3.5 px-2 border-b-1 border-gray-300 flex items-center">
                                                    <svg
                                                        onClick={() => { handleDeleteCourse(course.code, course.session, course.campus, course.faculty) }}
                                                        className="hover:bg-gray-200 rounded-sm ml-auto p-0.5 cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="none" viewBox="0 0 24 24"
                                                    >
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                                                    </svg>
                                                    <svg className="hover:bg-gray-200 rounded-sm ml-auto mr-2 cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                    </svg>
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