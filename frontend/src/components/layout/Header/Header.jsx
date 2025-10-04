import uitmLogo from '../../../assets/uitm-logo.png'
import HeaderStepper from './HeaderStepper'
import { useState, useEffect } from 'react'

export function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768) // True for mobile

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener("resize", handleResize) // Mounts the event listener on load
        return () => window.removeEventListener("resize", handleResize); // Unmounts it on navigation away
    }, [])

    return (
        <header className="flex h-fit py-3 px-8 gap-5">

            {/* UiTM Schedule Generator Logo */}
            <div className='flex flex-col items-center justify-center'>
                <div className='flex items-center pt-2 justify-between'>
                    <img src={uitmLogo} alt='UiTM Logo' className="w-28" />
                    <span className='h-13 border-l-1 border-gray-400 mx-2'></span>
                    <p className='leading-4 text-gray-600 font-serif text-2sm w-18'>UiTM Schedule Generator</p>
                </div>
                <div className='bg-gray-200 rounded-2xl px-4 py-0.5 mt-2'>
                    <p className='text-xs'>v1.0.0</p>
                </div>
            </div>

            {/* Progress Step - Web Version */}
            {
                !isMobile ? (
                    <div className='flex-1 flex justify-center items-center relative'>
                        <HeaderStepper />
                    </div>
                ) : (
                    <div>Test</div>
                )
            }
            

        </header>
    );
}