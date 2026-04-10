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
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search products"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.searchInput}
        />
      </View>

      {catalog.error ? <Text style={styles.error}>{catalog.error}</Text> : null}

      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.content,
          products.length === 0 && styles.emptyContent,
        ]}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={catalog.status === 'refreshing'}
            onRefresh={refresh}
          />
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
          ) : (
            <View style={styles.centered}>
              <Text>No products found.</Text>
            </View>
          )
        }
        ListFooterComponent={
          catalog.status === 'loadingMore' ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#0D6A57" />
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
  error: {
    color: '#B42318',
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 18,
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
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
