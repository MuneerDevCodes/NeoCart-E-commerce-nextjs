import type { Product } from "@/types";

export function normalizeProductSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isCloseMatch(query: string, word: string) {
  if (query.length < 4 || Math.abs(query.length - word.length) > 1) {
    return false;
  }

  let queryIndex = 0;
  let wordIndex = 0;
  let differences = 0;

  while (queryIndex < query.length && wordIndex < word.length) {
    if (query[queryIndex] === word[wordIndex]) {
      queryIndex += 1;
      wordIndex += 1;
      continue;
    }

    differences += 1;
    if (differences > 1) {
      return false;
    }

    if (query.length > word.length) {
      queryIndex += 1;
    } else if (query.length < word.length) {
      wordIndex += 1;
    } else {
      queryIndex += 1;
      wordIndex += 1;
    }
  }

  return differences + (query.length - queryIndex) + (word.length - wordIndex) <= 1;
}

export function getProductSearchRank(product: Product, rawQuery: string) {
  const query = normalizeProductSearchText(rawQuery);
  if (!query) {
    return Number.POSITIVE_INFINITY;
  }

  const name = normalizeProductSearchText(product.name);
  const category = normalizeProductSearchText(product.category);
  const sku = normalizeProductSearchText(product.sku);
  const description = normalizeProductSearchText(product.description);
  const queryTokens = query.split(" ");
  const nameTokens = name.split(" ");
  const categoryTokens = category.split(" ");
  const skuTokens = sku.split(" ");
  const descriptionTokens = description.split(" ");
  let rank = Number.POSITIVE_INFINITY;

  if (name.includes(query)) {
    rank = 0;
  } else if (category.includes(query) || sku.includes(query)) {
    rank = 1;
  } else if (description.includes(query)) {
    rank = 2;
  } else {
    const allTokensMatch = queryTokens.every((queryToken) => {
      const nameMatch = nameTokens.some(
        (word) => word.includes(queryToken) || queryToken.startsWith(word),
      );
      const categoryOrSkuMatch = [...categoryTokens, ...skuTokens].some(
        (word) => word.includes(queryToken) || queryToken.startsWith(word),
      );
      const descriptionMatch = descriptionTokens.some((word) =>
        word.includes(queryToken),
      );
      const fuzzyMatch = [...nameTokens, ...categoryTokens, ...skuTokens].some(
        (word) => isCloseMatch(queryToken, word),
      );

      if (nameMatch) {
        rank = Math.min(rank, 3);
        return true;
      }
      if (categoryOrSkuMatch) {
        rank = Math.min(rank, 4);
        return true;
      }
      if (descriptionMatch) {
        rank = Math.min(rank, 5);
        return true;
      }
      if (fuzzyMatch) {
        rank = Math.min(rank, 6);
        return true;
      }
      return false;
    });

    if (!allTokensMatch) {
      return Number.POSITIVE_INFINITY;
    }
  }

  return rank;
}
