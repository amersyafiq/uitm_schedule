import Select from 'react-select'
import { style } from '../../utils/style'

export function CourseFilter({ selectedCampus, selectedFaculty, selectedCourse, setSelectedCampus, setSelectedFaculty, setSelectedCourse, optionsCam, optionsFac, optionsCode, courses, handleAddCourse }) {

    return (
        <div className="flex flex-col xl:flex-row xl:items-end gap-5 pb-3">
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
            {(!courses || courses.length === 0) && selectedCourse?.value && (
                <div className='w-fit h-full flex items-end'>
                    <button
                        onClick={handleAddCourse}
                        className='bg-stone-700 text-white px-3 py-1 rounded-sm cursor-pointer'
                    >
                        Add Course
                    </button>
                </div>
            )}
        </div>
    );
}