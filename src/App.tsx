export function App() {
  return (
    <main className="flex flex-col flex-1 py-6 bg-black items-center text-white h-full gap-2">
      <h1 className="text-blue-500 text-5xl">Hello World</h1>
    </main>
  );
}

let counter = 0;
// returns the state of *all* features for current user
function fetchAllFeatures(): Promise<Record<string, boolean>> {
  // in reality, this would have been a `fetch` call:
  // `fetch("/api/features/all")`
  return new Promise((resolve) => {
    console.log("Fetching");
    const sampleFeatures =
      counter % 2 === 0
        ? {
            "extended-summary": true,
            "feedback-dialog": false,
          }
        : {
            "extended-summary": !true,
            "feedback-dialog": !false,
          };

    counter++;
    setTimeout(resolve, 100, sampleFeatures);
  });
}

// lib.ts
let internal_do_not_use_featureStatePromise: Promise<
  Record<string, boolean>
> | null = null;

async function getFeatureState(
  featureName: string,
  force = false
): Promise<boolean> {
  let promise: Promise<Record<string, boolean>> | null = null;
  if (force === false && internal_do_not_use_featureStatePromise) {
    promise = internal_do_not_use_featureStatePromise;
  } else {
    promise = fetchAllFeatures();
    internal_do_not_use_featureStatePromise = promise;
  }

  const result = await promise;
  const returnValue = result[featureName] ?? false;
  return returnValue;
}

const POLLING_INTERVAL_MS = 2000;

function subscribeToFeatureChanges_Old(
  featureName: string,
  callback: (isEnabled: boolean) => void
) {
  let previousIsEnabled: boolean | null = null;

  function fetcher() {
    getFeatureState(featureName, true).then((isEnabled) => {
      const hasChanged = previousIsEnabled !== isEnabled;
      if (hasChanged) {
        callback(isEnabled /*, previousIsEnabled*/);
      }

      previousIsEnabled = isEnabled;
    });
  }

  const id = setInterval(() => {
    fetcher();
  }, POLLING_INTERVAL_MS);

  fetcher();

  return () => clearInterval(id);
}

function subscribeToAllFeatureChanges(
  callback: (allFeatures: Record<string, boolean>) => void
) {
  function fetcher() {
    fetchAllFeatures().then((allFeatures) => {
      callback(allFeatures);
    });
  }

  const id = setInterval(() => {
    fetcher();
  }, POLLING_INTERVAL_MS);

  fetcher();

  return () => clearInterval(id);
}

class FeatureSubscription {
  listeners = new Set<{
    featureName: string;
    cb: (isEnabled: boolean) => void;
  }>();
  previousFeatures: Record<string, boolean> | null = null;

  unsubscribe = () => {
    /**/
  };

  constructor() {
    this.unsubscribe = subscribeToAllFeatureChanges((newFeatures) => {
      this.listeners.forEach(({ featureName, cb }) => {
        cb(
          newFeatures[featureName] !==
            (this.previousFeatures?.[featureName] ?? false)
        );
      });
    });
  }

  stop = () => this.unsubscribe();

  add(obj: { featureName: string; cb: (isEnabled: boolean) => void }) {
    const unsubcribe = () => {
      this.listeners.delete(obj);
    };

    if (this.listeners.has(obj)) {
      return unsubcribe;
    }

    this.listeners.add(obj);

    return unsubcribe;
  }
}
const instance = new FeatureSubscription();

function subscribeToFeatureChangesNew(
  featureName: string,
  cb: (isEnabled: boolean) => void
) {
  const unsub = instance.add({ featureName, cb });

  return unsub;
}

/**
 * what we want:
 * subscribeToFeatureChanges should report to callback whenever given featureName changes
 * it should create only one interval
 */

// usage.ts
async function test() {
  try {
    const conditions = [
      (await getFeatureState("extended-summary")) === true,
      (await getFeatureState("feedback-dialog")) === false,
      (await getFeatureState("does-not-exist")) === false,
    ];

    console.log(
      conditions
        .map((x, i) => `Test ${i + 1}: ${x ? "Pass" : "Fail"}`)
        .join("\n")
    );
  } catch (e) {
    console.error(e);
  }

  const unsubcriptions = [
    subscribeToFeatureChangesNew("extended-summary", (isEnabled) =>
      console.log({ featureName: "extended-summary 1", isEnabled })
    ),
    subscribeToFeatureChangesNew("extended-summary", (isEnabled) =>
      console.log({ featureName: "extended-summary 2", isEnabled })
    ),
    subscribeToFeatureChangesNew("extended-summary", (isEnabled) =>
      console.log({ featureName: "extended-summary 3", isEnabled })
    ),
    subscribeToFeatureChangesNew("extended-summary", (isEnabled) =>
      console.log({ featureName: "extended-summary 4", isEnabled })
    ),
  ];

  setTimeout(() => {
    unsubcriptions.forEach((x) => x());
    instance.stop();
  }, 10000);
}

test();
