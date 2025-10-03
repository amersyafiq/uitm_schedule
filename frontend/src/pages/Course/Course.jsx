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
            const url =  "https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30";
            const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm"
            }})

            console.log(res.data)
            
            // try {
            //     const [rawCam, rawFac] = await Promise.all([
            //         axios.get("https://simsweb4.uitm.edu.my/estudent/class_timetable/cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111I&key=All&page=1&page_limit=30", {
            //             headers: {
            //                 'Content-Type': 'application/x-www-form-urlencoded',
            //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
            //                 'Referer': 'https://simsweb4.uitm.edu.my/estudent/class_timetable/index.htm'
            //             },
            //         }),
            //         axios.get("/api/icress/faculty", {
            //             headers: { "X-API-Key": "67b09141-e39e-4e86-a729-fc45940c93e3" },
            //         }),
            //     ]);

            //     setOptionsCam(
            //         rawCam.data.results.map((item) => ({
            //             value: item.id,
            //             label: item.text,
            //         }))
            //     );

            //     setOptionsFac(
            //         rawFac.data.results.map((item) => ({
            //             value: item.id,
            //             label: item.text,
            //         }))
            //     );
            // } catch (err) {
            //     console.error("Error fetching filter data:", err.message);
            // }
        };

        fetchFilterData();

    }, []);

    useEffect(() => {
        setOptionsCode([])
        if (!selectedCampus || !selectedFaculty) return;
        console.log(selectedCampus.value)
        console.log(selectedFaculty.value)
        const fetchFilterCode = async () => {
            try {
                const campus = selectedCampus.value ? selectedCampus.value : ""
                const faculty = selectedFaculty.value ? selectedFaculty.value : ""
                // const rawCode = await axios.get(`/api/icress/courses?campus=${campus}&session=${currSession}&faculty=${faculty}`, {
                //     headers: { "X-API-Key": "67b09141-e39e-4e86-a729-fc45940c93e3" },
                // })

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
        try {
            // const response = await axios.get(`/api/courses?campus=${selectedCampus.value}&faculty=${selectedFaculty.value}&session=${currSession.session}&code=${selectedCourse.value}`);
            setCourses(
                response.data.filter((course) =>                        // Exclude that course if course returned false
                    !schedCourses.some((sched) =>                   // Returns False if matches code, session & campus
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
        const code = selectedCourse?.value ? selectedCourse.value : ''
        const session = currSession.session
        try {
            // await axios.post(`/api/courses?campus=${campus}&faculty=${faculty}&code=${code}&session=${session}`, {}, {
            //     headers: { "X-API-Key": "67b09141-e39e-4e86-a729-fc45940c93e3" },
            // })
            fetchCourses()
            setSelectedCourse({ "value": '', "label": 'Select...' })
        } catch (err) {
            if (err.response) {
                const { code, message } = err.response.data?.detail || {}

                switch (code) {
                    case "EXISTING_COURSE":
                    case "UNKNOWN_COURSE":
                        alert(message)
                        break
                    default:
                        alert(err.message)
                }
            }
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragDrop}>
            <div className="flex w-full flex-col lg:flex-row">
                    AAAAAAAAAAAAAAAa
                <div className="flex flex-5 flex-col lg:flex-row p-3">
                    <div className="bg-white rounded-xl w-full shadow-sm p-8">
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
                    <div className="bg-white rounded-xl w-full">
                        <div className='px-4 py-4 flex flex-col'>
                            <h1 className='font-bold text-xs text-gray-400 mb-2'>SELECTED COURSES</h1>
                            <p className='leading-5'>Drag and drop the courses you wish to generate a schedule with </p>
                        </div>
                        <CourseSchedule
                            schedCourses={schedCourses}
                            setSchedCourses={setSchedCourses}
                        />
                        <hr />
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}