import { useState, useEffect, useCallback } from "react";

interface ContinuousTypingEffectProps {
  text: string;
  speed?: number; // milliseconds per character
  pauseDuration?: number; // milliseconds to pause before restarting
  className?: string;
}

export function ContinuousTypingEffect({
  text,
  speed = 60,
  pauseDuration = 2000,
  className = "",
}: ContinuousTypingEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(speed);

  const handleType = useCallback(() => {
    const i = loopNum % 1; // Since we only have one text
    const fullText = text;

    setDisplayText(
      isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1)
    );

    setTypingSpeed(isDeleting ? speed / 2 : speed);

    if (!isDeleting && displayText === fullText) {
      setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setTypingSpeed(speed);
    }
  }, [displayText, isDeleting, loopNum, text, speed, pauseDuration]);

  useEffect(() => {
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [handleType, typingSpeed]);

  return (
    <span className={`inline-block ${className}`}>
      <span className="bg-gradient-to-r from-slate-900 via-sky-600 to-cyan-600 bg-clip-text text-transparent dark:from-white dark:via-sky-400 dark:to-cyan-400">
        {displayText}
      </span>
      <span className="inline-block w-0.5 h-[1em] bg-sky-600 dark:bg-sky-400 ml-1 animate-cursor-blink" />
    </span>
  );
}
