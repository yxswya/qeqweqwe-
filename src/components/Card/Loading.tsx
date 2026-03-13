export default function Loading() {
  return (
    <div className="flex items-center gap-1 px-5 py-2">
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0s]"></div>
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s]"></div>
      <div className="h-2 w-2 rounded-full bg-slate-400 animate-[pulse_1.4s_ease-in-out_infinite] [animation-delay:0.4s]"></div>
      <style>
        {`
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}
      </style>
    </div>
  )
}
