"use client"
import { motion } from "framer-motion"

interface AnimatedLogoProps {
  size?: number
  className?: string
}

export function AnimatedLogo({ size = 40, className = "" }: AnimatedLogoProps) {
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Background Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="50"
          className="fill-primary"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Outer Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="264"
          strokeDashoffset="264"
          fill="none"
          initial={{ strokeDashoffset: 264 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 1,
          }}
        />

        {/* Connection Lines */}
        <motion.path
          d="M30 50 L70 50"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2,
          }}
        />

        <motion.path
          d="M50 30 L50 70"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2,
          }}
        />

        {/* Connection Dots */}
        <motion.circle
          cx="30"
          cy="50"
          r="8"
          className="fill-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2.5,
          }}
        />

        <motion.circle
          cx="70"
          cy="50"
          r="8"
          className="fill-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2.5,
          }}
        />

        <motion.circle
          cx="50"
          cy="30"
          r="8"
          className="fill-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2.5,
          }}
        />

        <motion.circle
          cx="50"
          cy="70"
          r="8"
          className="fill-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            repeatDelay: 2.5,
          }}
        />
      </svg>
    </div>
  )
}
