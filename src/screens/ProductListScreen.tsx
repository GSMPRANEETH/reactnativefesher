import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  fetchCatalogPage,
  selectCatalog,
  selectCatalogHasMore,
  selectVisibleProducts,
  setCatalogQuery,
} from '../store/catalogSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootStackParamList } from '../navigation/types';

const SEARCH_DEBOUNCE_MS = 350;

export function ProductListScreen() {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const catalog = useAppSelector(selectCatalog);
  const products = useAppSelector(selectVisibleProducts);
  const hasMore = useAppSelector(selectCatalogHasMore);
  const [searchText, setSearchText] = useState(catalog.query);

  const runSearch = (nextQuery: string) => {
    const normalized = nextQuery.trim();

    setSearchText(nextQuery);
    dispatch(setCatalogQuery(normalized));
    dispatch(
      fetchCatalogPage({
        query: normalized,
        page: 1,
        replace: true,
      }),
    );
  };

  const retryCurrentQuery = () => {
    dispatch(
      fetchCatalogPage({
        query: catalog.query,
        page: 1,
        replace: true,
      }),
    );
  };

  useEffect(() => {
    if (!catalog.hydrated) {
      return;
    }

    if (catalog.ids.length === 0) {
      dispatch(
        fetchCatalogPage({
          query: catalog.query,
          page: 1,
          replace: true,
        }),
      );
    }
  }, [catalog.hydrated, catalog.ids.length, catalog.query, dispatch]);

  useEffect(() => {
    if (!catalog.hydrated) {
      return;
    }

    const timer = setTimeout(() => {
      const normalized = searchText.trim();

      if (normalized === catalog.query) {
        return;
      }

      dispatch(setCatalogQuery(normalized));
      dispatch(
        fetchCatalogPage({
          query: normalized,
          page: 1,
          replace: true,
        }),
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [catalog.hydrated, catalog.query, dispatch, searchText]);

  const loadMore = () => {
    if (
      catalog.status === 'loading' ||
      catalog.status === 'loadingMore' ||
      !hasMore
    ) {
      return;
    }

    dispatch(
      fetchCatalogPage({
        query: catalog.query,
        page: catalog.page + 1,
        replace: false,
      }),
    );
  };

  const refresh = () => {
    if (catalog.status === 'loading' || catalog.status === 'loadingMore') {
      return;
    }

    dispatch(
      fetchCatalogPage({
        query: catalog.query,
        page: 1,
        replace: true,
      }),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Product Catalog</Text>
        <Text style={styles.subtitle}>
          Search a large catalog, load more as you scroll, and keep state after
          you reopen the app.
        </Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search products"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.searchInput}
        />
      </View>

      {catalog.error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorTitle}>Could not load products</Text>
          <Text style={styles.errorBody}>{catalog.error}</Text>
          <Pressable style={styles.errorButton} onPress={retryCurrentQuery}>
            <Text style={styles.errorButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.content,
          products.length === 0 && styles.emptyContent,
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.45}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={catalog.status === 'refreshing'}
            onRefresh={refresh}
          />
        }
        ListHeaderComponent={
          catalog.query || products.length > 0 ? (
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryTitle}>
                {catalog.query ? 'Filtered results' : 'Catalog overview'}
              </Text>
              <Text style={styles.summaryBody}>
                {catalog.query
                  ? `Showing ${products.length} products for “${catalog.query}”.`
                  : `Showing ${products.length} of ${catalog.total} products.`}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: item.id })
            }
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardMeta}>${item.price.toFixed(2)}</Text>
              <Text style={styles.cardMeta}>
                Rating {item.rating.toFixed(1)}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          catalog.status === 'loading' ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#0D6A57" />
            </View>
          ) : catalog.status === 'failed' ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>Something went wrong</Text>
              <Text style={styles.emptyBody}>
                Check your connection and try again.
              </Text>
              <Pressable style={styles.retryButton} onPress={retryCurrentQuery}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : catalog.query ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptyBody}>
                Try a different search term or clear the filter.
              </Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => runSearch('')}
              >
                <Text style={styles.retryButtonText}>Clear search</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No products available</Text>
              <Text style={styles.emptyBody}>
                Pull to refresh or try again later.
              </Text>
              <Pressable style={styles.retryButton} onPress={retryCurrentQuery}>
                <Text style={styles.retryButtonText}>Reload</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          catalog.status === 'loadingMore' ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#0D6A57" />
              <Text style={styles.footerText}>Loading more products</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EE',
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#665A4F',
  },
  searchInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DBD2C8',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF4F3',
    borderWidth: 1,
    borderColor: '#FEC0BA',
  },
  errorTitle: {
    color: '#8B1D18',
    fontSize: 14,
    fontWeight: '800',
  },
  errorBody: {
    marginTop: 6,
    color: '#7A2C27',
    fontSize: 13,
    lineHeight: 18,
  },
  errorButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#8B1D18',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  summaryBlock: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF8EF',
    borderWidth: 1,
    borderColor: '#E8D8C1',
  },
  summaryTitle: {
    fontSize: 13,
    color: '#0D6A57',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryBody: {
    marginTop: 6,
    color: '#51473D',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBD2C8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    marginTop: 6,
    color: '#51473D',
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {
    color: '#51473D',
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 8,
    color: '#665A4F',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#0D6A57',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  footerText: {
    marginTop: 6,
    color: '#665A4F',
    fontSize: 12,
    fontWeight: '600',
  },
});
