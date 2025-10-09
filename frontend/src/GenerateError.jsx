export function GenerateError({ err, setErrorModal, idx }) {
    return (
        <div className="bg-red-500 rounded-lg z-50 flex justify-between items-center p-4 gap-3 text-white ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
            </svg>
            <p className='whitespace-pre-line mr-auto ml-2 leading-5'>{err}</p>
            <svg onClick={() => setErrorModal((prev) => prev.filter((_, i) => i !== idx))}
                className="w-3 h-3 cursor-pointer ml-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
        </div>
    );
}