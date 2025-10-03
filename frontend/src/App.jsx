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
        const response = await axios.get('/.netlify/functions/session')
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
      <main className="flex justify-center h-[calc(100vh-10rem)] px-5 pt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/course" replace />} />
          <Route path="/course" element={<Course
            currSession={currSession}
            isLoadingSession={isLoadingSession}
            schedCourses={schedCourses}
            setSchedCourses={setSchedCourses}
          />} />
        </Routes>
      </main>
    </>
  )
}

export default App
