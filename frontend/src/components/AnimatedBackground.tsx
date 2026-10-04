"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="orb orb-1 top-[-200px] left-[-200px]" />
      <div className="orb orb-2 top-[30%] right-[-150px]" />
      <div className="orb orb-3 bottom-[-100px] left-[30%]" />
    </div>
  );
}
