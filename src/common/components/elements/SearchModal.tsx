'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

import { useSearch } from '@/common/hooks/useSearch';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'blog' | 'project' | 'learn';
  slug: string;
  tags?: string[];
}

interface SearchModalProps {
  items: SearchItem[];
  isOpen: boolean;
  onClose: () => void;
}

const getItemUrl = (item: SearchItem) => {
  const baseUrls = {
    blog: '/blog',
    project: '/projects',
    learn: '/learn',
  };
  return `${baseUrls[item.category]}/${item.slug}`;
};

const getCategoryColor = (category: string) => {
  const colors = {
    blog: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    project:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    learn:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };
  return colors[category as keyof typeof colors] || colors.blog;
};

const SearchModal: React.FC<SearchModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const { query, setQuery, results, clearSearch, hasResults, isEmpty } =
    useSearch(items);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }

    if (e.key === 'Enter' && results[selectedIndex]) {
      window.location.href = getItemUrl(results[selectedIndex]);
    }
  };

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sora">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700">
            <HiOutlineSearch className="ml-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search blogs, projects, and tutorials..."
              className="w-full border-0 bg-transparent py-4 pl-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0"
              autoFocus
            />
            <button
              onClick={handleClose}
              className="absolute right-4 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HiOutlineX className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <SearchResults
            isEmpty={isEmpty}
            hasResults={hasResults}
            query={query}
            results={results}
            selectedIndex={selectedIndex}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

interface SearchResultsProps {
  isEmpty: boolean;
  hasResults: boolean;
  query: string;
  results: SearchItem[];
  selectedIndex: number;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  isEmpty,
  hasResults,
  query,
  results,
  selectedIndex,
  onClose,
}) => {
  return (
    <div className="max-h-96 overflow-y-auto p-2">
      {isEmpty && (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          Start typing to search...
        </div>
      )}

      {!isEmpty && !hasResults && (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {hasResults && (
        <div className="space-y-1">
          {results.map((item, index) => (
            <Link
              key={item.id}
              href={getItemUrl(item)}
              onClick={onClose}
              className={clsx(
                'block rounded-lg p-3 transition-colors',
                index === selectedIndex
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        getCategoryColor(item.category),
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchModal;
