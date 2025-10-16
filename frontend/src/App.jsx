import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Header } from "./components/layout/Header/Header";
import { Schedule } from "./components/schedule/Schedule";
import { Selector } from './Selector';
import { GenerateForm } from "./GenerateForm";
import { GenerateError } from "./GenerateError";

function App() {
  const [selectedPriority, setSelectedPriority] = useState('');
  const [scheduleOut, setScheduleOut] = useState([]);
  const [isLoadingSchedOut, setIsLoadingSchedOut] = useState(false)
  const [errorModal, setErrorModal] = useState([])
  const [currSession, setCurrSession] = useState('');
  const [schedCourses, setSchedCourses] = useState(() => {
    const saved = localStorage.getItem("sched_courses");
    return saved ? JSON.parse(saved) : [];
  });
  const [hasWeekend, setHasWeekend] = useState(false)
  const [hasNight, setHasNight] = useState(false)

  const scheduleRef = useRef(null);

  const handleFetchSchedule = async () => {
    setIsLoadingSchedOut(true)
    try {
      const priority = selectedPriority.value ? selectedPriority.value : 0;
      const response = await axios.post(`/.netlify/functions/generate?arrangement_priority=${priority}`, schedCourses)
      setScheduleOut(response.data)
    } catch (err) {
      if (err.response) {
        const { code, message, clashes } = err.response.data || {}
        switch (code) {
          case "NO_CLASSES_SELECTED":
          case "INVALID_PRIORITY":
            setErrorModal([...errorModal, message])
            break
          case "CLASHED_CLASSES":
            {
              const clashMsg = clashes ? clashes.map(c => `${c.class1} ⟷ ${c.class2}`).join("\n") : ""
              setErrorModal([...errorModal, `${message}\n${clashMsg}`])
              break
            }
          default:
            setErrorModal([...errorModal, "Unexpected error occurred"])
        }

        setScheduleOut([])
      }

    } finally {
      setIsLoadingSchedOut(false)
    }
  }

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get('/.netlify/functions/session')
        setCurrSession(response.data)
      } catch (err) {
        setErrorModal([...errorModal, "Unable to fetch current session"])
      }
    }

    fetchSession()

  }, [])

  useEffect(() => {
    localStorage.setItem("sched_courses", JSON.stringify(schedCourses))
  }, [schedCourses])

  return (
    <>
      <main className={`flex justify-center h-full pt-4 ${!hasNight && 'xl:px-30'}`}>
        <div className="flex w-full flex-col lg:flex-row">

          {/* Courses and Classes Selector */}
          <Selector 
            schedCourses={schedCourses} 
            setSchedCourses={setSchedCourses}
            currSession={currSession} 
            setErrorModal={setErrorModal} 
          />

          {/* Generate Schedule */}
          <div className="flex-6 p-3">
            <div className="bg-white rounded-xl w-full pb-3 relative">
              <div className="flex flex-col px-6 py-6">
                <GenerateForm
                  scheduleRef={scheduleRef}
                  selectedPriority={selectedPriority}
                  setSelectedPriority={setSelectedPriority}
                  scheduleOut={scheduleOut}
                  handleFetchSchedule={handleFetchSchedule}
                  setHasWeekend={setHasWeekend}
                  hasWeekend={hasWeekend}
                  setHasNight={setHasNight}
                  hasNight={hasNight}
                  setErrorModal={setErrorModal}
                  errorModal={errorModal}
                />
              </div>
              <Schedule 
                ref={scheduleRef}
                schedule={scheduleOut.schedule} 
                isLoadingSched={isLoadingSchedOut} 
                hasWeekend={hasWeekend} 
                hasNight={hasNight} />
              <div className='fixed right-3 bottom-3 flex flex-col gap-2'>
                {
                  errorModal.map((err, idx) => {
                    return (
                      <GenerateError 
                        key={idx} 
                        err={err} 
                        setErrorModal={setErrorModal} 
                        idx={idx} />
                    );
                  })
                }

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
