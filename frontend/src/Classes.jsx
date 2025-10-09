export function Classes({ classGroup, handleSelectClass }) {
    return classGroup.select ?
    (
        <div 
            onClick={() => handleSelectClass(classGroup.class_group)}
            className="flex w-fit px-3 py-1 justify-center items-center mb-1 rounded-sm bg-emerald-400 shadow-sm cursor-pointer select-none hover:transform hover:-translate-y-1 transition-transform ease-in duration-100"
        >
            <p className="text-sm text-white font-semibold">{classGroup.class_group}</p>
            <svg className="w-2 h-2 cursor-pointer ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path className="text-white" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
        </div>
    ) : (
        <div 
            onClick={() => handleSelectClass(classGroup.class_group)}
            className="flex w-fit px-3 py-1 justify-center mb-1 rounded-sm border-1 border-gray-300 bg-white shadow-sm cursor-pointer select-none hover:transform hover:-translate-y-1 transition-transform ease-in duration-100"
        >
            <p className="text-sm text-stone-700">{classGroup.class_group}</p>
        </div>
    )
}