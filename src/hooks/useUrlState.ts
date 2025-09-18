import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FilterQuery {
  id: string;
  type: 'event' | 'property' | 'cohort';
  display: string;
  query: any;
}

interface FilterState {
  searchTerm: string;
  filters: FilterQuery[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Memoize state to prevent unnecessary re-renders
  const state = useMemo((): FilterState => {
    try {
      const searchTerm = searchParams.get('search') || '';
      const filtersParam = searchParams.get('filters');
      const filters = filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : [];
      const sortBy = searchParams.get('sort_by') || undefined;
      const sortOrder = (searchParams.get('order') as 'asc' | 'desc') || undefined;
      const page = parseInt(searchParams.get('page') || '1');

      return {
        searchTerm,
        filters,
        sortBy,
        sortOrder,
        page
      };
    } catch (error) {
      console.warn('Failed to parse URL state:', error);
      return {
        searchTerm: '',
        filters: [],
        page: 1
      };
    }
  }, [searchParams]);

  const updateUrlState = useCallback((state: Partial<FilterState>) => {
    const newParams = new URLSearchParams(searchParams);
    console.log('🔧 useUrlState: updateUrlState called with:', state);
    
    // Update search term
    if (state.searchTerm !== undefined) {
      if (state.searchTerm) {
        newParams.set('search', state.searchTerm);
      } else {
        newParams.delete('search');
      }
    }
    
    // Update filters
    if (state.filters !== undefined) {
      if (state.filters.length > 0) {
        newParams.set('filters', encodeURIComponent(JSON.stringify(state.filters)));
      } else {
        newParams.delete('filters');
      }
    }
    
    // Update sorting
    if (state.sortBy !== undefined) {
      if (state.sortBy) {
        newParams.set('sort_by', state.sortBy);
      } else {
        newParams.delete('sort_by');
      }
    }
    
    if (state.sortOrder !== undefined) {
      if (state.sortOrder) {
        newParams.set('order', state.sortOrder);
      } else {
        newParams.delete('order');
      }
    }
    
    // Update page
    if (state.page !== undefined) {
      if (state.page > 1) {
        newParams.set('page', state.page.toString());
      } else {
        newParams.delete('page');
      }
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    state,
    updateState: updateUrlState
  };
};
