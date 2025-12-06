import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const ShowPartnership = ({ department, onClose }) => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const res = await api.get(`/viewing/partnerships/?department=${department.id}`);
        setPartnerships(res.data);
      } catch (err) {
        console.error("Error fetching partnerships", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerships();
  }, [department.id]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-transparent text-black dark:text-white rounded-xl p-8 w-full max-w-7xl max-h-[80vh] overflow-hidden relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-black dark:text-white">{department.name} Partnerships</h2>
            <button
              className="text-red-600 dark:text-red-400 font-bold text-2xl"
              onClick={onClose}
              title="Close"
            >
              X
            </button>
          </div>

          {/* Skeleton Loader */}
          {loading && (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-6 items-center">
                  <div className="w-32 h-32 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Partnerships List */}
          {!loading && partnerships.length === 0 && (
            <p className="text-gray-500 text-center text-xl">No partnerships found.</p>
          )}

          {!loading && partnerships.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {partnerships.map((p) => (
                <motion.div
                  key={p.id}
                  className="flex flex-col items-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src={p.logo}
                    alt={p.title}
                    className="w-32 h-32 object-cover rounded-lg shadow-sm mb-4"
                  />
                  <h3 className="text-xl font-semibold text-black dark:text-white text-center">{p.title}</h3>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShowPartnership;
