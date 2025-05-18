"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaBug, FaLightbulb, FaComment, FaHeart, FaBars } from "react-icons/fa";
import { toast } from "react-hot-toast";
import DashboardSidebar from '../../components/DashboardSidebar';

const FEEDBACK_TYPES = [
  {
    value: "bug",
    label: "Bug",
    icon: FaBug,
    description: "Report something that's not working as expected"
  },
  {
    value: "feature",
    label: "Feature Request",
    icon: FaLightbulb,
    description: "Suggest a new feature or improvement"
  },
  {
    value: "feedback",
    label: "General Feedback",
    icon: FaComment,
    description: "Share your thoughts or concerns"
  },
  {
    value: "positive",
    label: "Something I Loved",
    icon: FaHeart,
    description: "Tell us what you enjoyed"
  }
];

export default function FeedbackPage() {
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!type || !message.trim()) {
      toast.error("Please select a type and enter your feedback");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim() }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast.success("Thank you for sharing. We read every message.");
      setType("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#2B176B] p-2 rounded-full shadow-lg border border-[#6B4EFF] text-white"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="w-6 h-6" />
      </button>
      <DashboardSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8 w-full md:ml-64 transition-all duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#1a1333]/80 rounded-xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-white mb-2">
              We'd love to hear from you
            </h1>
            <p className="text-white/80 mb-8">
              Share your thoughts, ideas, or report anything that felt off. We're always listening.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-4">
                  What would you like to share?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEEDBACK_TYPES.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          type === option.value
                            ? 'border-[#6B4EFF] bg-[#6B4EFF]/5 shadow-md'
                            : 'border-gray-200 hover:border-[#6B4EFF]/50 hover:shadow-sm'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={option.value}
                          checked={type === option.value}
                          onChange={(e) => setType(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${
                            type === option.value
                              ? 'text-[#6B4EFF]'
                              : 'text-gray-400'
                          }`} />
                          <span className="font-medium text-white">{option.label}</span>
                        </div>
                        <p className="text-sm text-white/70">{option.description}</p>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#6B4EFF] focus:ring-1 focus:ring-[#6B4EFF] outline-none resize-none text-black text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#6B4EFF] text-white py-2 px-6 rounded-lg hover:bg-[#6B4EFF]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 