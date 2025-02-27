import { useEffect, useState } from "react";

export function App() {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <main className="flex flex-col flex-1 py-6 bg-black items-center text-white h-full gap-2">
      <h1 className="text-blue-500 text-5xl">Hello World</h1>
      <p>Current time is {new Date(time).toLocaleTimeString("en-in")}</p>
    </main>
  );
}
