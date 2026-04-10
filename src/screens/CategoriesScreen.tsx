import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  loadCategories,
  selectCategories,
} from '../store/categoriesSlice';
import {
  fetchCatalogPage,
  setCatalogQuery,
} from '../store/catalogSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { RootStackParamList } from '../navigation/types';
import type { CategoryInfo } from '../api/categoriesApi';

type CategoriesNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Categories'
>;

export function CategoriesScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<CategoriesNavProp>();
  const { items, status, error } = useAppSelector(selectCategories);

  useEffect(() => {
    if (items.length === 0 && status === 'idle') {
      dispatch(loadCategories());
    }
  }, [dispatch, items.length, status]);

  const handleSelectCategory = useCallback(
    (category: CategoryInfo) => {
      dispatch(setCatalogQuery(category.slug));
      dispatch(
        fetchCatalogPage({
          query: category.slug,
          page: 1,
          replace: true,
        }),
      );
      navigation.navigate('Catalog');
    },
    [dispatch, navigation],
  );

  if (status === 'loading' && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D6A57" />
      </View>
    );
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => dispatch(loadCategories())}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => item.slug}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => handleSelectCategory(item)}
        >
          <Text style={styles.rowText}>{item.name}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0D6A57',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DBD2C8',
  },
  rowText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  arrow: {
    fontSize: 20,
    color: '#0D6A57',
    fontWeight: '700',
  },
  separator: {
    height: 0,
  },
});
