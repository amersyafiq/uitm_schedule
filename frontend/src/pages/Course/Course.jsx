import axios from 'axios';
import { useEffect, useState } from 'react'
import { DragDropContext } from "@hello-pangea/dnd";
import { CourseFilter } from './CourseFilter';
import { CourseSelect } from './CourseSelect';
import { CourseSchedule } from './CourseSchedule';

export function Course({ currSession, isLoadingSession, schedCourses, setSchedCourses }) {

    const [optionsCam, setOptionsCam] = useState([]);
    const [optionsFac, setOptionsFac] = useState([]);
    const [optionsCode, setOptionsCode] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState({ "value": '', "label": 'Select...' });
    const [selectedFaculty, setSelectedFaculty] = useState({ "value": '', "label": 'Select...' });
    const [selectedCourse, setSelectedCourse] = useState({ "value": '', "label": 'Select...' });
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFilterData = async () => {
            const urlCampus = "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30"
            const urlFaculty = "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30"
            try {
                const [rawCam, rawFac] = await Promise.all([
                    await axios.get(`/.netlify/functions/proxy?url=${encodeURIComponent(urlCampus)}`),
                    await axios.get(`/.netlify/functions/proxy?url=${encodeURIComponent(urlFaculty)}`),
                ]);

                setOptionsCam(
                    rawCam.data.results.map((item) => ({
                        value: item.id,
                        label: item.text,
                    }))
                );

                setOptionsFac(
                    rawFac.data.results.map((item) => ({
                        value: item.id,
                        label: item.text,
                    }))
                );
            } catch (err) {
                console.error("Error fetching filter data:", err.message);
            }
        };

        fetchFilterData();

    }, []);

    useEffect(() => {
        setOptionsCode([])
        if (!selectedCampus || !selectedFaculty) return;
        const fetchFilterCode = async () => {
            try {
                const campus = selectedCampus.value ? selectedCampus.value : ""
                const faculty = selectedFaculty.value ? selectedFaculty.value : ""
                const rawCode = await axios.get(`/.netlify/functions/courseCodes?campus=${campus}&faculty=${faculty}`)

                setOptionsCode(
                    rawCode.data.results.map((item) => ({
                        value: item,
                        label: item,
                    }))
                );
            } catch (err) {
                console.log(err.message)
            }
        };

        fetchFilterCode()
    }, [selectedCampus, selectedFaculty, currSession])

    const fetchCourses = async () => {
        setIsLoading(true);
        const campus = selectedCampus?.value ? selectedCampus.value : null
        const faculty = selectedFaculty?.value ? selectedFaculty.value : null
        const code = selectedCourse?.value ? selectedCourse.value.split('.').join("") : null

        try {
            const saved = localStorage.getItem("courses");
            let courses = saved ? JSON.parse(saved) : [];
            const updatedCourses = courses
                .filter(course => {
                    if (campus && course.campus !== campus) return false;
                    if (faculty && course.faculty !== faculty) return false;
                    if (code && course.code !== code) return false;
                    return true;
                })
                .filter(course =>
                    !schedCourses.some(sched =>
                        sched.code === course.code &&
                        sched.session === course.session &&
                        sched.campus === course.campus
                    )
                )
            setCourses(updatedCourses);
        } catch (err) {
            console.error("Error fetching courses:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currSession || !currSession.session) return;
        fetchCourses();
    }, [selectedCampus, selectedFaculty, selectedCourse, currSession, schedCourses]);

    const handleDragDrop = (results) => {
        const { source, destination, type } = results;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === "group") {
            // Reordering within the same list
            if (source.droppableId === destination.droppableId) {
                const reordered = source.droppableId === "select" ? [...courses] : [...schedCourses];
                const [movedItem] = reordered.splice(source.index, 1);
                reordered.splice(destination.index, 0, movedItem);

                if (source.droppableId === "select") {
                    setCourses(reordered);
                } else {
                    setSchedCourses(reordered);
                }
            } else {
                // Moving between lists
                const sourceList = source.droppableId === "select" ? [...courses] : [...schedCourses];
                const destList = destination.droppableId === "select" ? [...courses] : [...schedCourses];

                const [movedItem] = sourceList.splice(source.index, 1);

                // Only 9 courses can be selected for schedule
                if (destination.droppableId === "schedule" && destList.length == 9) {
                    destList.splice(0, 1) // Automatically remove the first one
                }

                destList.splice(destination.index, 0, movedItem);

                if (source.droppableId === "select") {
                    setCourses(sourceList);
                    setSchedCourses(destList);
                } else {
                    setSchedCourses(sourceList);
                    setCourses(destList);
                }
            }
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragDrop}>
            <div className="flex w-full flex-col lg:flex-row h-140 gap-y-4">
                <div className="flex flex-5 flex-col lg:flex-row p-3 h-full">
                    <div className="bg-white rounded-xl w-full shadow-sm p-8 h-full overflow-x-auto no-scrollbar">
                        <CourseFilter
                            currSession={currSession}
                            selectedCampus={selectedCampus}
                            selectedFaculty={selectedFaculty}
                            selectedCourse={selectedCourse}
                            setSelectedCampus={setSelectedCampus}
                            setSelectedFaculty={setSelectedFaculty}
                            setSelectedCourse={setSelectedCourse}
                            optionsCam={optionsCam}
                            optionsFac={optionsFac}
                            optionsCode={optionsCode}
                            courses={courses}
                            fetchCourses={fetchCourses}
                        />
                        <CourseSelect
                            isLoading={isLoading}
                            isLoadingSession={isLoadingSession}
                            courses={courses}
                            handleRemoveCourse={handleRemoveCourse}
                        />
                    </div>
                </div>
                <div className="flex-2 flex-col lg:flex-row p-3 h-full">
                    <div className="bg-white rounded-xl w-full p-8 shadow-sm h-full">
                        <div className='flex flex-col'>
                            <div className='flex flex-col mb-4'>
                                <h1 className='font-bold text-xs text-gray-400 mb-1'>SELECTED COURSES</h1>
                                <p className='leading-5 text-justify'>Drag and drop the courses you wish to generate a schedule with </p>
                            </div>
                            {schedCourses?.length > 0 &&
                                <div className="flex justify-end items-end gap-2 mb-1">
                                    <button
                                        className="flex flex-col items-center justify-center gap-1 w-15 h-15 bg-gray-100 border-gray-300 border-1 text-black px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-200"
                                        onClick={() => setSchedCourses([])}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                        </svg>
                                        Clear
                                    </button>
                                    <button
                                        className="flex flex-col items-center justify-center gap-1 w-15 h-15 bg-gray-100 border-gray-300 border-1 text-black px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-200"
                                        onClick={() => setSchedCourses([...schedCourses].sort((a, b) => a.code.localeCompare(b.code)))}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                                        </svg>
                                        Sort
                                    </button>
                                </div>
                            }
                        </div>
                        <CourseSchedule
                            schedCourses={schedCourses}
                            setSchedCourses={setSchedCourses}
                        />
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}