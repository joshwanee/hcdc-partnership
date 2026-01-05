// Updated ViewingSection with dark/light themes + improved scroll animations
import React, { useState, useEffect } from "react";
import ImageWithFallback from "../components/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import ShowPartnership from "../components/modals/ShowPartnership";

const ViewingSection = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
  const loadData = async () => {

    // Get ALL colleges (public)
    const collegesRes = await api.get("/viewing/colleges/");
    const collegesData = collegesRes.data;

    // Get ALL departments (public)
    const deptRes = await api.get("/viewing/departments/");
    const allDepartments = deptRes.data;

    const finalData = await Promise.all(
      collegesData.map(async (college) => {
        
        // Filter departments belonging to this college
        const departmentsUnderCollege = allDepartments.filter(
          (dept) => dept.college === college.id
        );

        // Fetch partnerships for each department
        const departmentsWithPartnerships = await Promise.all(
          departmentsUnderCollege.map(async (dept) => {
            const partnersRes = await api.get(`/viewing/partnerships/?department=${dept.id}`);
            return { ...dept, partnerships: partnersRes.data };
          })
        );

        return {
          ...college,
          departments: departmentsWithPartnerships,
        };
      })
    );

    setColleges([...finalData].reverse());
    setLoading(false);
  };

  loadData();
}, []);


  const handleDeptClick = async (dept) => {
  // Toggle close
  if (selectedDept?.id === dept.id) {
    setSelectedDept(null);
    return;
  }

  // Fetch partnerships
  const res = await api.get(`/viewing/partnerships/?department=${dept.id}`);

  // Attach partnerships before setting state
  setSelectedDept({
    ...dept,
    partnerships: res.data,
  });
};


  return (
    <div className="relative w-full min-h-0 bg-gray-100 dark:bg-gray-900 text-black dark:text-white py-20 px-6 transition-colors duration-300">

      <h1 className="text-center text-3xl font-semibold mb-10">
        HCDC Partnerships
      </h1>

      {/* Vertical timeline line */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1 }}
        className="absolute left-1/2 top-40 h-[calc(100%-10rem)] w-[3px] bg-red-600 dark:bg-blue-500 -translate-x-1/2 hidden md:block origin-top"
      />

      <div className="flex flex-col items-center gap-28 mt-10">

        {colleges.map((college, index) => {
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: false, amount: 0.3 }}
              className="relative w-full max-w-[1200px] mx-auto md:w-[100%] grid grid-cols-1 md:grid-cols-2"
            >
              {/* Timeline Circle */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: false, amount: 0.4 }}
                className="
                  absolute top-0 left-1/2 
                  -translate-x-1/2 -translate-y-1/2
                  w-8 h-8 rounded-full border
                  border-red-600 dark:border-blue-300
                  bg-red-500 dark:bg-blue-400
                  hidden md:block
                "
              />

              {/* LEFT SIDE */}
              <div
                className={`flex ${
                  isLeft ? "justify-center pr-10 pt-8" : "justify-end pr-10 pt-15"
                } md:flex`}
              >
                {isLeft ? (
                  /* LOGO LEFT — animate individually */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: false, amount: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <ImageWithFallback
                      src={college.logo}
                      className="w-60 h-60 rounded-full object-cover shadow-lg mx-auto"
                      alt={college.name}
                    />
                    <p className="text-center mt-3 text-lg font-semibold">
                      {college.name}
                    </p>
                  </motion.div>
                ) : (
                  /* DEPARTMENTS LEFT — animate EACH BUTTON */
                  <div className="space-y-2 text-right w-full order-3 md:order-none">
                    {college.departments.map((department) => (
                      <motion.button
                        key={department.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.4 }}
                        transition={{ duration: 0.4 }}
                        onClick={() =>
                          setSelectedDept(
                            selectedDept?.id === department.id ? null : department
                          )
                        }
                        className={`text-left px-3 py-2 rounded transition-all flex items-center justify-between group w-full 
                          ${
                            selectedDept?.id === department.id
                              ? "bg-red-100 text-red-700 dark:bg-blue-100 dark:text-blue-700"
                              : "hover:bg-red-50 dark:hover:bg-blue-900 text-gray-700 dark:text-slate-300"
                          }
                        `}
                      >
                        <span className="flex items-center gap-2 flex-1 min-w-0 group-hover:text-red-500 dark:group-hover:text-blue-400">
                          <span className="flex-shrink-0 text-red-500 dark:text-blue-400">
                            🏛️
                          </span>
                          <span className="truncate">{department.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                            ({department.partnerships?.length || 0})
                          </span>
                        </span>

                        <span
                          className={`flex-shrink-0 ml-2 transition-transform 
                            ${
                              selectedDept?.id === department.id
                                ? "rotate-90 text-red-600 dark:text-blue-500"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
                            }
                          `}
                        >
                          ›
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div
                className={`flex ${
                  isLeft ? "justify-start pl-10 pt-10" : "justify-center pl-10 pt-10"
                } md:flex`}
              >
                {!isLeft ? (
                  /* LOGO RIGHT — animate individually */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: false, amount: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <ImageWithFallback
                      src={college.logo}
                      className="w-60 h-60 rounded-full object-cover shadow-lg mx-auto"
                      alt={college.name}
                    />
                    <p className="text-center mt-3 text-lg font-semibold">
                      {college.name}
                    </p>
                  </motion.div>
                ) : (
                  /* DEPARTMENTS RIGHT — animate EACH BUTTON */
                  <div className="space-y-2 text-left w-full order-3 md:order-none">
                    {college.departments.map((department) => (
                      <motion.button
                        key={department.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.4 }}
                        transition={{ duration: 0.4 }}
                        onClick={() =>
                          setSelectedDept(
                            selectedDept?.id === department.id ? null : department
                          )
                        }
                        className={`text-left px-3 py-2 rounded transition-all flex items-center justify-between group w-full 
                          ${
                            selectedDept?.id === department.id
                              ? "bg-red-100 text-red-700 dark:bg-blue-100 dark:text-blue-700"
                              : "hover:bg-red-50 dark:hover:bg-blue-900 text-gray-700 dark:text-slate-300"
                          }
                        `}
                      >
                        <span className="flex items-center gap-2 flex-1 min-w-0 group-hover:text-red-500 dark:group-hover:text-blue-400">
                          <span className="flex-shrink-0 text-red-500 dark:text-blue-400">
                            🏛️
                          </span>
                          <span className="truncate">{department.name}</span>
                          <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                            ({department.partnerships?.length || 0})
                          </span>
                        </span>

                        <span
                          className={`flex-shrink-0 ml-2 transition-transform 
                            ${
                              selectedDept?.id === department.id
                                ? "rotate-90 text-red-600 dark:text-blue-500"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
                            }
                          `}
                        >
                          ›
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedDept && (
          <ShowPartnership
            department={selectedDept}
            onClose={() => setSelectedDept(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewingSection;
