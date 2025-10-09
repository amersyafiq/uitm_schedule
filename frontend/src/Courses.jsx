import { useState } from 'react'
import { Classes } from './Classes';

export function Courses({ cc, setSchedCourses, isDropCourse, loadCourses }) {
    const [isActive, setIsActive] = useState(false)
    const [searchClass, setSearchClass] = useState('')

    const handleSelectClass = (class_group) => {
        setSchedCourses((prev) =>
            prev.map((course) => {
                if (
                    course.code === cc.code &&
                    course.session === cc.session &&
                    course.campus === cc.campus
                ) {
                    return {
                        ...course,
                        classes: course.classes.map((c) =>
                            c.class_group === class_group
                                ? { ...c, select: !c.select }
                                : c
                        ),
                    };
                }
                return course;
            })
        );
    };

    const handleRemoveCourse = () => {
        const saved = JSON.parse(localStorage.getItem("sched_courses") || '[]');
        const updatedCourses = saved.filter(
            c => 
                !(c.code === cc.code &&
                  c.session === cc.session &&
                  c.campus === cc.campus && 
                  c.faculty === cc.faculty
                )
            );
        localStorage.setItem("sched_courses", JSON.stringify(updatedCourses));
        loadCourses();
    }

    return (
        <div className="">

            {/* Accordion Header for Courses */}
            <div
                className="flex px-6 py-2 cursor-pointer"
                onClick={() => setIsActive(!isActive)}
            >
                <div className="w-15 flex justify-center items-center">
                    {
                        cc.classes.some(c => c.select) ? (
                            <svg className="text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clipRule="evenodd" />
                            </svg>
                        )
                    }

                </div>
                <div className="w-full ml-2">
                    <h1 className='font-bold text-xs text-stone-700 leading-4'>{cc.code}</h1>
                    <p className="text-xs text-gray-500">{cc.classes.length} Available Classes</p>
                </div>
                <div className="flex justify-center items-center mr-1 text-gray-400">
                    {!isActive ? (
                        <svg className="hover:bg-stone-200 rounded-2xl cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 10 4 4 4-4" />
                        </svg>
                    ) : (
                        <svg className="bg-stone-200 rounded-2xl cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 14-4-4-4 4" />
                        </svg>
                    )
                    }
                </div>
                {
                    isDropCourse &&
                    <button 
                        onClick={handleRemoveCourse}
                        className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-200 cursor-pointer'    
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash2-fill" viewBox="0 0 16 16">
                            <path d="M2.037 3.225A.7.7 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.7.7 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671zm9.89-.69C10.966 2.214 9.578 2 8 2c-1.58 0-2.968.215-3.926.534-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466-.18-.14-.498-.307-.975-.466z" />
                        </svg>
                    </button>
                }
            </div>

            {/* Accordion Dropdown for Classes List */}
            {isActive &&
                <div className="overflow-scroll no-scrollbar bg-gray-100 shadow-inner max-h-70 px-6 py-3 flex flex-wrap gap-x-1 justify-start">
                    <div className='w-full mb-3 relative'>
                        <svg className='absolute left-2 bottom-1/4 text-[#808080]' aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                        </svg>
                        <input
                            className='pl-7 border border-solid w-full bg-white border-gray-300 rounded h-8 text-sm py-1 px-3 placeholder:text-[#808080] hover:border-[#2684FF] focus-visible:outline-none focus-visible:border-[#2684FF] '
                            type='text'
                            placeholder='Search for classes'
                            value={searchClass}
                            onChange={(e) => setSearchClass(e.target.value)}
                        />
                    </div>
                    {
                        cc.classes.filter((classGroup) => classGroup.class_group.toLowerCase().includes(searchClass.toLowerCase()))
                            .map((classGroup) => (
                                <Classes
                                    key={classGroup.class_group}
                                    classGroup={classGroup}
                                    handleSelectClass={handleSelectClass}
                                />
                            ))
                    }
                </div>
            }
        </div>
    );
}