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
        const campus = selectedCampus?.value ? selectedCampus.value : ''
        const faculty = selectedFaculty?.value ? selectedFaculty.value : ''
        const code = selectedCourse?.value ? selectedCourse.value.split('.').join("") : ''
        try {
            const saved = localStorage.getItem("courses");
            let courses = saved ? JSON.parse(saved) : [];
            setCourses(
                courses.filter(course => {
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
            );
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

    const handleAddCourse = async (e) => {
        e.preventDefault()
        const campus = selectedCampus?.value ? selectedCampus.value : ''
        const faculty = selectedFaculty?.value ? selectedFaculty.value : ''
        const code = selectedCourse?.value ? selectedCourse.value.split('.').join("") : ''
        try {
            const response = await axios.get(`/.netlify/functions/addCourse?campus=${campus}&faculty=${faculty}&code=${code}`)
            const addedCourse = response.data.results

            const saved = JSON.parse(localStorage.getItem("courses") || "[]");
            const updatedCourses = [...saved, addedCourse];

            localStorage.setItem("courses", JSON.stringify(updatedCourses));
            
            setSelectedCourse({ "value": '', "label": 'Select...' })
            fetchCourses()

        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragDrop}>
            <div className="flex w-full flex-col lg:flex-row">
                <div className="flex flex-5 flex-col lg:flex-row p-3">
                    <div className="bg-white rounded-xl w-full shadow-sm p-8 min-h-100">
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
                            handleAddCourse={handleAddCourse}
                        />
                        <CourseSelect
                            isLoading={isLoading}
                            isLoadingSession={isLoadingSession}
                            courses={courses}
                            fetchCourses={fetchCourses}
                        />
                    </div>
                </div>
                <div className="flex-2 flex-col lg:flex-row p-3">
                    <div className="bg-white rounded-xl w-full p-8 h-full shadow-sm">
                        <div className='flex flex-col mb-4'>
                            <h1 className='font-bold text-xs text-gray-400 mb-2'>SELECTED COURSES</h1>
                            <p className='leading-5'>Drag and drop the courses you wish to generate a schedule with </p>
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