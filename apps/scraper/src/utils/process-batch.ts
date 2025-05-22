/**
 * Processes a batch of items in parallel
 * @param items - The items to process
 * @param processFn - The function to process each item
 * @param batchSize - The size of the batch to process
 * @returns An array of results
 */
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize: number = 5,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => processFn(item)),
    );
    results.push(...batchResults);
  }
  return results;
}

export { processBatch };
