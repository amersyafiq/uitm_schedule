import Select from 'react-select'
import { style } from './utils/style'
import { useEffect, useState } from 'react'
import axios from 'axios'

export function CourseFilter({ currSession, schedCourses, loadCourses, setErrorModal, isDropCourse, setIsDropCourse }) {
    const [optionsCam, setOptionsCam] = useState([]);
    const [optionsFac, setOptionsFac] = useState([]);
    const [optionsCode, setOptionsCode] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState({ "value": '', "label": 'Select...' });
    const [selectedFaculty, setSelectedFaculty] = useState({ "value": '', "label": 'Select...' });
    const [selectedCourse, setSelectedCourse] = useState({ "value": '', "label": 'Select...' });

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
                setErrorModal((prev) => ([...prev, "Failed to fetch filter data. Please try again later."]))
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
                setErrorModal((prev) => ([...prev, "Failed to fetch filter data. Please try again later."]))
            }
        };

        fetchFilterCode()
    }, [selectedCampus, selectedFaculty, currSession])

    const handleAddCourse = async (e) => {
        e.preventDefault()
        const campus = selectedCampus?.value ? selectedCampus.value : ''
        const faculty = selectedFaculty?.value ? selectedFaculty.value : ''
        const code = selectedCourse?.value ? selectedCourse.value.split('.').join("") : ''
        try {
            const response = await axios.get(`/.netlify/functions/addCourse?campus=${campus}&faculty=${faculty}&code=${code}`)
            const addedCourse = response.data.results

            let saved = [];
            try {
                const stored = localStorage.getItem("sched_courses");
                if (stored && stored.trim() !== "") {
                    saved = JSON.parse(stored);
                    if (!Array.isArray(saved)) saved = [];
                }
            } catch (err) {
                console.warn("Failed to parse sched_courses, resetting:", err);
                saved = [];
            }

            // Prevent adding more than 9 courses
            if (saved.length >= 9) {
                setErrorModal((prev) => ([...prev, "You can only add up to 9 courses."]))
                return;
            }

            // Check for duplicates
            const isDuplicate = saved.some(
                (course) =>
                    course.code === addedCourse.code &&
                    course.session === addedCourse.session &&
                    course.campus === addedCourse.campus &&
                    course.faculty === addedCourse.faculty
            );

            if (isDuplicate) {
                setErrorModal((prev) => ([...prev, "Course already added."]))
                return;
            }

            const updatedCourses = [...saved, addedCourse];
            localStorage.setItem("sched_courses", JSON.stringify(updatedCourses));
            setSelectedCourse({ "value": '', "label": 'Select...' })
            loadCourses()

        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="flex flex-col gap-5 p-6 pb-0">
            <div className='flex-1'>
                <h1 className='font-bold text-xs text-gray-400 mb-1'>SELECT CAMPUS</h1>
                <Select
                    value={selectedCampus}
                    onChange={(option) => {
                        setSelectedCampus(option);
                        setSelectedFaculty({ "value": '', "label": 'Select...' })
                        setSelectedCourse({ "value": '', "label": 'Select...' })
                    }}
                    options={optionsCam}
                    isSearchable={true}
                    styles={style}
                />
            </div>
            <div className='flex-1'>
                <h1 className='font-bold text-xs text-gray-400 mb-1'>SELECT FACULTY</h1>
                <Select
                    value={selectedCampus?.value === 'B' ? selectedFaculty : ""}
                    onChange={(option) => {
                        setSelectedFaculty(option)
                        setSelectedCourse({ "value": '', "label": 'Select...' })
                    }}
                    isDisabled={selectedCampus?.value === 'B' ? false : true}
                    options={optionsFac}
                    isSearchable={true}
                    styles={style}
                />
            </div>
            <div className='flex-1'>
                <h1 className='font-bold text-xs text-gray-400 mb-1'>SELECT COURSE</h1>
                <Select
                    value={selectedCourse}
                    onChange={(option) => setSelectedCourse(option)}
                    options={optionsCode}
                    isSearchable={true}
                    styles={style}
                />
            </div>
            <div className='flex gap-2'>
                <button
                    disabled={
                        isDropCourse ||
                        schedCourses.length > 9 ||
                        !selectedCourse?.value
                    }
                    className="flex items-center gap-2 flex-1 bg-purple-700 text-white text-sm px-3 py-1.5 rounded-sm cursor-pointer hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddCourse}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path stroke="currentColor" strokeWidth="0.5" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path stroke="currentColor" strokeWidth="0.5" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                    </svg>
                    Add Course
                </button>
                <button
                    disabled={
                        schedCourses.length == 0
                    }
                    className="flex items-center gap-2 flex-1 bg-red-700 text-white text-sm px-3 py-1.5 rounded-sm cursor-pointer hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsDropCourse(!isDropCourse)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path stroke="currentColor" strokeWidth="0.5" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path stroke="currentColor" strokeWidth="0.5" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                    </svg>
                    Drop Course
                </button>
            </div>
        </div>
    );
}