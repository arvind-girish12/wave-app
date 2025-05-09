"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaPhone, FaShieldAlt, FaRobot, FaExclamationTriangle } from "react-icons/fa";

const FAQs = [
  {
    question: "Is Wave therapy?",
    answer: "No, Wave is not therapy. Wave is an AI-powered emotional support tool designed to help with reflection and self-awareness. While it can be helpful for managing daily stress and emotions, it's not a substitute for professional mental health care."
  },
  {
    question: "Is my data safe?",
    answer: "Yes, your data is encrypted and stored securely. We use industry-standard security measures to protect your information. Your conversations are private and we never share your personal data with third parties."
  },
  {
    question: "Can Wave give me medical advice?",
    answer: "No, Wave cannot provide medical advice, diagnosis, or treatment. The AI is designed to help with emotional support and reflection, but it's not qualified to give medical or therapeutic advice. Always consult healthcare professionals for medical concerns."
  },
  {
    question: "How does Wave's AI work?",
    answer: "Wave uses advanced AI to understand and respond to your emotions and thoughts. It learns your preferences for communication style and topics over time, but it cannot diagnose conditions or provide treatment. The AI is designed to be supportive and non-judgmental."
  }
];

const EMERGENCY_RESOURCES = [
  {
    region: "India",
    resources: [
      {
        name: "iCall",
        number: "022-25521111",
        hours: "24/7",
        description: "Professional telephone and email-based counseling service"
      },
      {
        name: "Vandrevala Foundation",
        number: "9999666555",
        hours: "24/7",
        description: "Free mental health counseling and support"
      }
    ]
  },
  {
    region: "Global",
    resources: [
      {
        name: "Befrienders Worldwide",
        website: "www.befrienders.org",
        description: "International emotional support network"
      },
      {
        name: "International Association for Suicide Prevention",
        website: "www.iasp.info/resources/Crisis_Centres",
        description: "Directory of crisis centers worldwide"
      }
    ]
  }
];

function AccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-4 text-left flex justify-between items-center"
        onClick={onClick}
      >
        <span className="font-medium text-wave-forest">{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-wave-forest" />
        ) : (
          <FaChevronDown className="text-wave-forest" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-4 text-gray-600"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}

function HelpCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-wave-forest" />
        <h3 className="font-medium text-wave-forest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const scrollToEmergency = () => {
    document.getElementById('emergency-resources')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-wave-offwhite p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* How Wave Works Section */}
        <section>
          <h2 className="text-2xl font-bold text-wave-forest mb-6">How Wave Works</h2>
          <div className="space-y-4 mb-8">
            <p className="text-gray-700">
              Wave uses AI to assist with emotional reflection. It's not a therapist or a substitute for one.
            </p>
            <p className="text-gray-700">
              Conversations are private and encrypted.
            </p>
            <p className="text-gray-700">
              The AI learns your preferences (tone, topic) but cannot diagnose or treat.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-wave-forest mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {FAQs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Privacy & Data Section */}
        <section>
          <h2 className="text-2xl font-bold text-wave-forest mb-6">Privacy & Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HelpCard icon={FaShieldAlt} title="Data Protection">
              <p className="text-gray-700">
                We do not sell your data. Your conversations are stored securely on encrypted servers.
              </p>
            </HelpCard>
            <HelpCard icon={FaRobot} title="AI & Privacy">
              <p className="text-gray-700">
                The AI learns from your interactions to provide better support, but your data remains private and secure.
              </p>
            </HelpCard>
          </div>
        </section>

        {/* Emergency Resources Section */}
        <section id="emergency-resources">
          <h2 className="text-2xl font-bold text-wave-forest mb-6">Emergency Resources</h2>
          <div className="space-y-6">
            {EMERGENCY_RESOURCES.map((region) => (
              <div key={region.region} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-medium text-wave-forest mb-4">{region.region}</h3>
                <div className="space-y-4">
                  {region.resources.map((resource, index) => (
                    <div key={index} className="border-l-4 border-wave-forest pl-4">
                      <h4 className="font-medium text-wave-forest">{resource.name}</h4>
                      {resource.number && (
                        <p className="text-gray-700 flex items-center gap-2">
                          <FaPhone className="text-wave-forest" />
                          {resource.number}
                        </p>
                      )}
                      {resource.website && (
                        <p className="text-gray-700">
                          Website: {resource.website}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      {resource.hours && (
                        <p className="text-sm text-gray-600">Available: {resource.hours}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Emergency Button */}
      <button
        onClick={scrollToEmergency}
        className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
      >
        <FaExclamationTriangle />
        In Crisis?
      </button>
    </div>
  );
} 