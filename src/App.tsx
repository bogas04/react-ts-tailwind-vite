/**
 * Requirements:
 *
 * Make a tree view where items can be searched and renamed
 *
 *
 * Data Structure
 *
 * {
 *  id: "",
 *  title: "",
 *  children: [{
 *    ...
 *  }]
 * }
 */

import { useEffect, useState } from "react";

type Node = {
  id: number;
  title: string;
  children?: Node[];
};
let id = 0;
const data: Node = {
  id: ++id,
  title: "Home",
  children: [
    { id: ++id, title: "Documents", children: [] },
    {
      id: ++id,
      title: "Downloads",
      children: [
        { id: ++id, title: "Software", children: [] },
        { id: ++id, title: "Images", children: [] },
        {
          id: ++id,
          title: "Videos",
          children: [{ id: ++id, title: "Cool Video.mp4" }],
        },
      ],
    },
    { id: ++id, title: "Desktop", children: [] },
  ],
};

function NodeView(props: {
  node: Node;
  dataWithSearch: (Node & { path: string[] })[];
  query: string;
}) {
  const isInParentPath = Boolean(
    props.dataWithSearch.find((x) => x.path.includes(props.node.title))
  );
  const [open, setOpen] = useState(isInParentPath);
  const isMatch =
    props.node.title === props.query ||
    (props.node.title.toLowerCase().includes(props.query.toLowerCase()) &&
      props.dataWithSearch.length === 1);

  useEffect(() => {
    if (!props.query) {
      setOpen(false);
    }
  }, [props.query]);
  useEffect(() => {
    if (isInParentPath) {
      setOpen(true);
    }
  }, [isInParentPath]);

  if (!props.node.children) {
    return (
      <div className={`text-gray-50 ${isMatch ? "font-bold" : ""} font-bo`}>
        📄 {props.node.title}
      </div>
    );
  }

  return (
    <>
      <button
        className={`cursor-pointer text-gray-50 px-4 ${
          isMatch ? "font-bold" : ""
        }`}
        onClick={() => setOpen((x) => !x)}
      >
        {open && props.node.children.length > 0 ? "📂" : "📁"}{" "}
        {props.node.title}
      </button>
      <div className="px-3">
        {open
          ? props.node.children.map((x) => (
              <NodeView
                node={x}
                dataWithSearch={props.dataWithSearch}
                query={props.query}
              />
            ))
          : null}
      </div>
    </>
  );
}
export function App() {
  const [query, setQuery] = useState("");

  const dataWithSearch = searchFor(query, data);
  return (
    <main className="flex flex-col flex-1 mx-auto px-[30%] py-6 bg-black h-full gap-2">
      <input
        className="rounded-sm border-gray-700 border-1 p-2"
        placeholder="Search"
        type="search"
        onChange={(e) => setQuery(e.currentTarget.value)}
      />
      {dataWithSearch.map((x) => (
        <div key={x.id} className="bg-white">
          <p>
            {x.title}{" "}
            <small className="text-gray-600">{x.path.join("/")}</small>
          </p>
        </div>
      ))}
      <div className="flex flex-col items-start text-black max-w-[50%]">
        <NodeView node={data} dataWithSearch={dataWithSearch} query={query} />
      </div>
    </main>
  );
}

function searchFor(query: string, node: Node, parent: string[] = []) {
  if (query === "") {
    return [];
  }

  const path = parent.concat(node.title);
  const matches: (Node & { path: string[] })[] = [];
  if (node.title.toLowerCase().includes(query.toLowerCase())) {
    matches.push({ ...node, path });
  }

  if (node.children) {
    node.children.forEach((child) => {
      matches.push(...searchFor(query, child, path));
    });
  }

  return matches;
}
