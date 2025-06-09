import Typewriter from "typewriter-effect";
import { useState } from "react";

const TypewriterWrapper = () => {
  const [typingDone, setTypingDone] = useState(false);

  const finalMessage = "We've handpicked a pool of the best listeners for you. Swipe to find your vibe and start a convo with whoever feels right.";

  return (
      <div className="mb-6 text-center text-base sm:text-lg text-gray-700/80">
        {!typingDone ? (
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString(finalMessage)
                .pauseFor(250)
                .callFunction(() => setTypingDone(true))
                .start();
            }}
            options={{
              autoStart: true,
              loop: false,
              delay: 50,
              cursor: "",
            }}
          />
        ) : (
          <span>{finalMessage}</span>
        )}
      </div>
  );
};

export default TypewriterWrapper;
