function getMin(rotatedArray: number[]) {
  return Math.min(...rotatedArray);
}

function getMinOptimized(
  arr: number[],
  startIndex = 0,
  endIndex = arr.length - 1
) {
  const midIndex = Math.floor((startIndex + endIndex) / 2);

  if (startIndex === endIndex - 1) {
    return Math.min(arr[startIndex], arr[endIndex]);
  }

  if (startIndex === endIndex) {
    return arr[startIndex];
  }

  if (arr[startIndex] < arr[midIndex] && arr[midIndex] < arr[endIndex]) {
    return getMinOptimized(arr, startIndex, midIndex);
  }

  if (arr[startIndex] > arr[endIndex] && arr[midIndex] < arr[endIndex]) {
    return getMinOptimized(arr, startIndex, midIndex);
  }
  return getMinOptimized(arr, midIndex, endIndex);
}

[
  { input: [3, 4, 5, 1, 2], output: 1 },
  { input: [4, 5, 6, 7, 0, 1, 2], output: 0 },
  { input: [11, 13, 15, 17], output: 11 },
].forEach(({ input, output }) => {
  console.log(
    `For [${input}] min value should be ${output} check = ${getMinOptimized(
      input
    )}`
  );
});

class LRUCache {
  private store = new Map<number, { value: number; rank: number }>();
  private capacity: number;
  private rank = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    const value = this.store.get(key)?.value;
    if (!value) {
      return -1;
    }

    this.store.set(key, { value, rank: ++this.rank });

    return value;
  }

  put(key: number, value: number): void {
    const newRank = ++this.rank;
    if (this.store.size < this.capacity) {
      this.store.set(key, { value, rank: newRank });
      console.log(this.store);
      return;
    }

    let smallestRankKey = this.getSmallestRank();
    this.store.delete(smallestRankKey);
    this.store.set(key, { value, rank: newRank });

    console.log(this.store);
  }

  private getSmallestRank() {
    let smallestRank = this.rank;

    // naive approach. Since the ranks are rotated array we can use getMinOptimized to find the smallest rank,
    // however we will have to change the implementation to make it return the key
    let smallestRankKey: number | undefined = undefined;
    this.store.entries().forEach(([key, value]) => {
      if (value.rank < smallestRank) {
        smallestRank = value.rank;
        smallestRankKey = key;
      }
    });

    if (typeof smallestRankKey === "undefined") {
      throw new Error("Unexpected error");
    }

    return smallestRank;
  }
}

const lru = new LRUCache(2);

lru.put(1, 1); // {1: {value: 1, rank: 1}}
lru.put(2, 2); // {1: {value: 1, rank: 1}, 2: {value: 2, rank: 2}}
lru.put(3, 3); // {2: {value: 2, rank: 2}, 3: {value: 3, rank: 3}}
