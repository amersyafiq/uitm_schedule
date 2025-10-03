import axios from "axios";
import { Route, Routes, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header/Header";
import { Course } from "./pages/Course/Course";

function App() {

  const [currSession, setCurrSession] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [schedCourses, setSchedCourses] = useState(() => {
    const saved = localStorage.getItem("schedule_courses");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get('/api/icress/session', {
          headers: { "X-API-Key": "67b09141-e39e-4e86-a729-fc45940c93e3" }
        })
        setCurrSession(response.data)
      } catch (err) {
        console.log(err.message)
      } finally {
        setIsLoadingSession(false)
      }
    }

    fetchSession()

  }, [])

  useEffect(() => {
    localStorage.setItem("schedule_courses", JSON.stringify(schedCourses))
  }, [schedCourses])

  return (
    <>
      <Header />
      <div className="-z-10 bg-[url(./assets/main-wave-1.png)] absolute w-full h-full bg-center-top bg-no-repeat -top-10 opacity-10" />
      <div className="-z-10 bg-[url(./assets/main-wave-2.png)] absolute w-full h-full bg-center-top bg-no-repeat top-0 opacity-25" />
      <main className="flex justify-center h-[calc(100vh-10rem)] pb-5">
        <div className="h-full flex items-center justify-center w-25">
          <svg className="w-15 h-15 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M13.729 5.575c1.304-1.074 3.27-.146 3.27 1.544v9.762c0 1.69-1.966 2.618-3.27 1.544l-5.927-4.881a2 2 0 0 1 0-3.088l5.927-4.88Z" clip-rule="evenodd" />
          </svg>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/course" replace />} />
          <Route path="/course" element={<Course
            currSession={currSession}
            isLoadingSession={isLoadingSession}
            schedCourses={schedCourses}
            setSchedCourses={setSchedCourses}
          />} />
        </Routes>
        <div className="h-full flex items-center justify-center w-25">
          sss
        </div>
      </main>
    </>
  )
}

export default App
