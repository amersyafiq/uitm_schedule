import { Courses } from './Courses';
import { CourseFilter } from './CourseFilter';
import { useState } from 'react';

export function Selector({ setSchedCourses, schedCourses, currSession, setErrorModal }) {
    const [isDropCourse, setIsDropCourse] = useState(false)

    const handleSelectAll = (bool) => {
        setSchedCourses((prev) =>
            prev.map((course) => ({
                ...course,
                classes: course.classes.map((c) => ({
                    ...c,
                    select: bool,
                })),
            }))
        );
    };

    const loadCourses = () => {
        const saved = localStorage.getItem("sched_courses");
        const updatedCourses = saved ? JSON.parse(saved) : [];
        setSchedCourses(updatedCourses)
    }

    return (
        <div className="flex-3 flex p-3 gap-3 h-fit min-w-70">
            <div className="bg-white rounded-xl w-full pb-4">
                <CourseFilter currSession={currSession} schedCourses={schedCourses} loadCourses={loadCourses} setErrorModal={setErrorModal} isDropCourse={isDropCourse} setIsDropCourse={setIsDropCourse} />
                <div className="p-6 pb-3">
                    <h1 className='font-bold text-xs text-gray-400 mb-1'>SELECT CLASSES</h1>
                    <p className='leading-5'>Choose which classes to be included in the generation process</p>
                </div>
                {
                    schedCourses.length > 0 &&
                    <div className='px-6 mb-1 flex gap-2'>
                        <button
                            className="flex flex-col items-center justify-center gap-1 w-12 h-12 bg-gray-100 border-gray-300 border-1 text-gray-500 px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-200"
                            onClick={() => handleSelectAll(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5z" />
                                <path d="m8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0" />
                            </svg>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center gap-1 w-12 h-12 bg-gray-100 border-gray-300 border-1 text-gray-500 px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-200"
                            onClick={() => handleSelectAll(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
                                <path stroke="currentColor" strokeWidth="0.2" d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                <path stroke="currentColor" strokeWidth="0.2" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                            </svg>
                        </button>
                        <button
                            className="flex flex-col items-center justify-center gap-1 w-12 h-12 bg-gray-100 border-gray-300 border-1 text-gray-500 px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-200"
                            onClick={() => setSchedCourses([...schedCourses].sort((a, b) => a.code.localeCompare(b.code)))}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                            </svg>
                        </button>
                    </div>
                }
                {schedCourses.map((cc) => (
                    <Courses key={cc.code} cc={cc} setSchedCourses={setSchedCourses} isDropCourse={isDropCourse} loadCourses={loadCourses} />
                ))}
            </div>
        </div>
    )
}