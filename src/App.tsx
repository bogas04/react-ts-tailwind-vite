import { useEffect, useRef, useState } from "react";

function TreeViewItem({
  data,
  shouldExpandAll,
  expandedIdSet,
}: {
  data: TreeStructure;
  shouldExpandAll: boolean;
  expandedIdSet: Set<string>;
}) {
  const hasChildren = Array.isArray(data.children);
  const defaultIsOpen = useRef(expandedIdSet.has(data.id) || shouldExpandAll);
  const [isOpen, setIsOpen] = useState(defaultIsOpen.current);
  const icon = hasChildren ? (isOpen ? ">" : "_") : "*";
  const mounted = useRef(false);

  useEffect(() => {
    setIsOpen(mounted.current ? shouldExpandAll : defaultIsOpen.current);
  }, [defaultIsOpen, shouldExpandAll]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <>
      <button
        className="text-3xl"
        onClick={() => {
          setIsOpen((x) => !x);
        }}
      >
        {icon} {data.name}
      </button>
      {hasChildren && isOpen && data.children ? (
        <NestedTreeView
          expandedIdSet={expandedIdSet}
          data={data.children}
          shouldExpandAll={shouldExpandAll}
        />
      ) : null}
    </>
  );
}

function NestedTreeView({
  data,
  shouldExpandAll,
  expandedIdSet,
}: {
  data: TreeStructure[];
  shouldExpandAll: boolean;
  expandedIdSet: Set<string>;
}) {
  return (
    <ul className="pl-4">
      {data.map((item) => (
        <li key={item.id}>
          <TreeViewItem
            data={item}
            shouldExpandAll={shouldExpandAll}
            expandedIdSet={expandedIdSet}
          />
        </li>
      ))}
    </ul>
  );
}

function useIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

export function App() {
  const [data, setData] = useState<TreeStructure[] | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<Error | null>(null);
  const [isExpandAll, setIsExpandAll] = useState(false);
  const selectedId = useIdFromUrl();
  const expandedIdSet = useRef(new Set<string>([]));

  // fetch
  useEffect(() => {
    setStatus("loading");
    setData(null);
    setError(null);
    fetchData()
      .then((response) => {
        setError(null);
        setStatus("success");
        if (selectedId) {
          const set = createExpandedIdsSet(response, selectedId);
          set.forEach((x) => expandedIdSet.current.add(x));
        }

        setData(response);
      })
      .catch((error) => {
        setStatus("error");
        setData(null);
        setError(error);
      });
  }, [selectedId]);

  // set to state
  // maintain collapse/expand status for each item

  let content = null;

  if (status == "loading") {
    content = <h2 className="text-lg">Loading data... Please wait</h2>;
  }

  if (status === "error") {
    content = (
      <>
        <h2 className="text-lg">Oops! Something went wrong.</h2>
        <code>{JSON.stringify(error)}</code>
      </>
    );
  }

  if (status === "success" && data) {
    content = (
      <NestedTreeView
        data={data}
        shouldExpandAll={isExpandAll}
        expandedIdSet={expandedIdSet.current}
      />
    );
  }

  return (
    <main className="flex flex-col py-6  bg-black text-white h-full gap-2">
      <div>
        <button
          onClick={() => setIsExpandAll((x) => !x)}
          className="bg-gray-500 rounded-md px-4 py-2"
        >
          {isExpandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>
      {content}
    </main>
  );
}

// Arrow characters to use: ▼ ▶ •

type TreeStructure = {
  id: string;
  name: string;
  children?: Array<TreeStructure>;
};

const backendData: TreeStructure[] = [
  {
    id: "1",
    name: "Office Map",
  },
  {
    id: "2",
    name: "New Employee Onboarding",
    children: [
      {
        id: "8",
        name: "Onboarding Materials",
      },
      {
        id: "9",
        name: "Training",
      },
    ],
  },
  {
    id: "3",
    name: "Office Events",
    children: [
      {
        id: "6",
        name: "2018",
        children: [
          {
            id: "10",
            name: "Summer Picnic",
          },
          {
            id: "11",
            name: "Valentine's Day Party",
          },
          {
            id: "12",
            name: "New Year's Party",
          },
        ],
      },
      {
        id: "7",
        name: "2017",
        children: [
          {
            id: "13",
            name: "Company Anniversary Celebration",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Public Holidays",
  },
  {
    id: "5",
    name: "Vacations and Sick Leaves",
  },
];

function fetchData(): Promise<TreeStructure[]> {
  return new Promise((resolve) => {
    setTimeout(resolve, 100, backendData);
  });
}

function createExpandedIdsSet(
  data: TreeStructure[],
  selectedId: string,
  parentList: string[] = []
): string[] {
  let arr: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    // (Base Condition) Found the item, send the parentList
    if (item.id === selectedId) {
      return [...parentList, item.id];
    }

    // (Recursion) Have not yet found the item
    if (item.children && arr.length === 0) {
      arr = createExpandedIdsSet(item.children, selectedId, [
        ...parentList,
        item.id,
      ]);
    }
  }

  // Return the set
  return arr;
}
