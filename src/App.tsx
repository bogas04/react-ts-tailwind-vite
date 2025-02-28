import { useEffect, useState } from "react";

export function App() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "failure"
  >("idle");
  const [data, setData] = useState<typeof chartData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setStatus("loading");
    setData(null);
    getData()
      .then((data) => {
        setData(data);
        setError(null);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("failure");
        setData(null);
        setError(err);
      });
  }, []);

  let content = null;
  if (error) {
    content = (
      <>
        <p>Something went wrong! 😭</p>
        <code>{error.message}</code>
      </>
    );
  }

  if (status === "loading") {
    content = <p>Loading ...</p>;
  }

  if (!data) {
    content = <p>Data is not ready!</p>;
  }

  content = <Chart data={data} />;

  return (
    <main className="flex flex-col flex-1 py-6 bg-black items-center text-white h-full gap-2">
      <h1>Chart Data</h1>
      {content}
    </main>
  );
}

const GUTTER = 12;
const PADDING_HORIZONTAL = 4;

function Chart(props: { data: typeof chartData | null }) {
  const [sortBy, setSortBy] = useState<"default" | "ascending" | "descending">(
    "default"
  );

  if (!props.data) {
    return null;
  }

  const maxTicketCount = Math.max(...props.data.map((x) => x.ticketCount));

  const dimensions = { height: 360, width: (360 * 16) / 9 };

  let chartData = props.data;

  if (sortBy === "ascending") {
    chartData = chartData.toSorted((a, b) => a.ticketCount - b.ticketCount);
  }

  if (sortBy === "descending") {
    chartData = chartData.toSorted((a, b) => b.ticketCount - a.ticketCount);
  }

  return (
    <div className="p-4 bg-gray-50 " style={{}}>
      <div className="flex gap-2 mb-2">
        <button
          className={
            "text-white border-1 border-blue-200 px-2 py-2 rounded-lg " +
            (sortBy === "ascending" ? "bg-blue-600" : "bg-blue-400")
          }
          onClick={() => setSortBy("ascending")}
        >
          Sort by Ascending
        </button>
        <button
          className={
            "text-white border-1 border-blue-200 px-2 py-2 rounded-lg " +
            (sortBy === "descending" ? "bg-blue-600" : "bg-blue-400")
          }
          onClick={() => setSortBy("descending")}
        >
          Sort by Descending
        </button>
        <button
          className={
            "text-white border-1 border-blue-200 px-2 py-2 rounded-lg " +
            (sortBy === "default" ? "bg-blue-600" : "bg-blue-400")
          }
          onClick={() => setSortBy("default")}
        >
          Reset
        </button>
      </div>
      <div
        className={`flex items-end`}
        style={{
          padding: `0px ${PADDING_HORIZONTAL}px`,
          gap: GUTTER,
          border: "1px solid #cacaca",
          height: dimensions.height,
          width: dimensions.width,
          maxHeight: dimensions.height,
          maxWidth: dimensions.width,
        }}
      >
        {chartData.map((x, i, arr) => {
          const barHeight =
            0.8 * (dimensions.height / maxTicketCount) * x.ticketCount;

          const barWidth = dimensions.width / arr.length - GUTTER;

          return (
            <div key={x.id}>
              <div
                aria-describedby={`${x.name} (${x.ticketCount})`}
                style={{
                  height: barHeight,
                  width: barWidth,
                  animation: "scaleY 0.25s",
                  transformOrigin: "bottom",
                  backgroundColor: x.color,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * In an issue tracking application, we’d like to visualize
 * the number of issues assigned to each company department
 * by building a bar chart.
 */

// data.js

const chartData = [
  { id: "dep-1", name: "Legal", ticketCount: 32, color: "#3F888F" },
  { id: "dep-2", name: "Sales", ticketCount: 20, color: "#FFA420" },
  { id: "dep-3", name: "Engineering", ticketCount: 60, color: "#287233" },
  { id: "dep-4", name: "Manufacturing", ticketCount: 5, color: "#4E5452" },
  { id: "dep-5", name: "Maintenance", ticketCount: 14, color: "#642424" },
  {
    id: "dep-6",
    name: "Human Resourcing",
    ticketCount: 35,
    color: "#1D1E33",
  },
  { id: "dep-7", name: "Events", ticketCount: 43, color: "#E1CC4F" },
];

const getData = (): Promise<typeof chartData> =>
  new Promise((resolve) => {
    setTimeout(resolve, 500, chartData);
  });
