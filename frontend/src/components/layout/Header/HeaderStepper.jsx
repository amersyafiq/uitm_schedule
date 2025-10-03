import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";

const stepConfig = [
  { id: 1, title: "Courses Selection", path: "/course" },
  { id: 2, title: "Classes Selection", path: "/class" },
  { id: 3, title: "Generate Schedule", path: "/generate" },
  { id: 4, title: "Export Schedule", path: "/export" },
];

export default function HeaderStepper() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const foundIndex = stepConfig.findIndex((s) => s.path === location.pathname);
    if (foundIndex !== -1) {
      setCurrentStep(foundIndex + 1);
    }
  }, [location]);

  return (
    <div className="flex justify-between items-center w-full max-w-4xl mx-auto mt-4">
      {stepConfig.map((step, idx) => {
        const isLast = idx === stepConfig.length - 1;

        let status = "pending";
        if (step.id < currentStep) status = "completed";
        else if (step.id === currentStep) status = "in-progress";

        return (
          <div key={step.id} className="flex-1 flex flex-col items-center">
            
            {/* Circle */}
            <div className="flex items-center w-full">
              <Link
                to={step.path}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${status === "completed" ? "bg-green-500 border-green-500 text-white" : ""}
                  ${status === "in-progress" ? "border-purple-500 text-purple-500" : ""}
                  ${status === "pending" ? "border-purple-200 text-purple-200" : ""}
                `}
              >
                {status === "completed" ? (
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </Link>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full
                    ${status === "completed" ? "bg-green-500" : ""}
                    ${status === "in-progress" ? "bg-purple-500" : ""}
                    ${status === "pending" ? "bg-purple-200" : ""}
                  `}
                />
              )}
            </div>

            {/* Labels */}
            <div className="text-center mt-3 flex flex-col items-start justify-start w-full">
              <p className="text-xs font-semibold text-gray-700">STEP {step.id}</p>
              <p className="font-bold text-gray-900">{step.title}</p>
              <p
                className={`
                  text-sm
                  ${status === "completed" ? "text-green-500" : ""}
                  ${status === "in-progress" ? "text-purple-500" : ""}
                  ${status === "pending" ? "text-gray-400" : ""}
                `}
              >
                {status === "completed"
                  ? "Completed"
                  : status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
