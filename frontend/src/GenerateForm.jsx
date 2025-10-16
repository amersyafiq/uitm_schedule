import { style } from './utils/select';
import Select from 'react-select'

export function GenerateForm({ schedTitle, setSchedTitle, selectedPriority, setSelectedPriority, scheduleOut, handleFetchSchedule, hasWeekend, setHasWeekend, hasNight, setHasNight }) {
    return (
        <form>
            <div className='flex gap-4 flex-col lg:flex-row'>
                <div className='flex-1 flex flex-col'>
                    <label
                        className='font-bold text-xs text-gray-400 mb-1'
                        htmlFor='titleInput'
                    >
                        SCHEDULE TITLE
                    </label>
                    <input
                        id='titleInput'
                        className='border border-solid border-gray-300 rounded h-7 text-sm py-1 px-3 placeholder:text-[#808080] hover:border-[#2684FF] focus-visible:outline-none focus-visible:border-[#2684FF] '
                        type='text'
                        placeholder='e.g., My Schedule'
                        required
                        value={schedTitle}
                        onChange={(e) => setSchedTitle(e.target.value)}
                    />
                </div>
                <div className='flex flex-col'>
                    <label
                        className='font-bold text-xs text-gray-400 mb-1'
                    >
                        SESSION
                    </label>
                    <input
                        className='lg:w-fit border border-solid border-gray-300 bg-[#f2f2f2] rounded h-7 text-sm py-1 px-3 placeholder:text-[#808080] hover:border-[#2684FF] focus-visible:outline-none focus-visible:border-[#2684FF] '
                        type='text'
                        placeholder='e.g., My Schedule'
                        required
                        disabled
                        value={20254}
                    />
                </div>
                <div className='flex-1 flex flex-col'>
                    <label
                        className='font-bold text-xs text-gray-400 mb-1'
                    >
                        ARRANGEMENT PRIORITY
                    </label>
                    <Select
                        value={selectedPriority}
                        onChange={(option) => setSelectedPriority(option)}
                        options={[
                            {
                                value: 1,
                                label: "Morning Priority"
                            },
                            {
                                value: 2,
                                label: "Evening Priority"
                            }]}
                        isSearchable={false}
                        required
                        className="text-sm"
                        styles={style}
                    />
                </div>
            </div>
            <div className='flex justify-end mt-3 gap-2 items-center flex-col xl:flex-row gap-y-3'>
                <div className='flex'>
                    <div className='flex gap-2 items-center mr-3'>
                        <input 
                            onChange={() => setHasNight(!hasNight)}
                            value={hasNight}
                            type="checkbox" 
                            id="nightCheckbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="nightCheckbox" className="text-sm">Night Classes</label>
                    </div>
                    <div className='flex gap-2 items-center mr-3'>
                        <input 
                            onChange={() => setHasWeekend(!hasWeekend)}
                            value={hasWeekend}
                            type="checkbox" 
                            id="weekendCheckbox" 
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="weekendCheckbox" className="text-sm">Include Weekend</label>
                    </div>
                </div>
                {
                    scheduleOut?.length == 0 ? (
                        <button
                            className="flex items-center gap-1.5 bg-stone-700 text-white px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-500"
                            onClick={handleFetchSchedule}
                            type='button'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                            </svg>
                            Generate Schedule
                        </button>
                    ) : (
                        <>
                            <button
                                className="flex items-center gap-1.5 bg-stone-700 text-white px-3 py-1 rounded-sm cursor-pointer hover:bg-stone-500"
                                onClick={handleFetchSchedule}
                                type='button'
                            >
                                <svg className="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" stroke-linejoin="round" strokeWidth="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4" />
                                </svg>

                                Regenerate Schedule
                            </button>
                            <button
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-sm cursor-pointer hover:bg-green-500"
                                onClick={() => { }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z" />
                                    <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z" />
                                </svg>
                                Download
                            </button>
                        </>
                    )
                }
            </div>
            {
                (scheduleOut?.length != 0) &&
                <div className='flex gap-2 mt-3 justify-center xl:justify-start'>
                    <p className='bg-gray-300 text-xs rounded-2xl px-3 py-1'>Fitness: {scheduleOut.fitness}</p>
                    <p className='bg-gray-300 text-xs rounded-2xl px-3 py-1'>Generation: {scheduleOut.generation} / {scheduleOut.generation_number}</p>
                    <p className='bg-gray-300 text-xs rounded-2xl px-3 py-1'>No clash found</p>
                </div>
            }
        </form>
    );
}