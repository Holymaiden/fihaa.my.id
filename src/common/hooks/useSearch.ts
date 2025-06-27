import { useEffect, useMemo, useState } from 'react';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'blog' | 'project' | 'learn';
  slug: string;
  tags?: string[];
}

// Simple search implementation without external dependencies
const searchItems = (items: SearchItem[], query: string): SearchItem[] => {
  if (!query.trim()) return [];

  const searchQuery = query.toLowerCase();

  return items.filter((item) => {
    const searchableText = [
      item.title,
      item.description,
      item.content,
      ...(item.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });
};

export const useSearch = (items: SearchItem[]) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  const filteredResults = useMemo(() => {
    return searchItems(items, query);
  }, [items, query]);

  useEffect(() => {
    setResults(filteredResults);
  }, [filteredResults]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    clearSearch,
    hasResults: results.length > 0,
    isEmpty: query.trim() === '',
  };
};
