import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { RootStackParamList } from '../navigation/types';
import { selectProductId, selectVisibleProducts } from '../store/catalogSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type ProductDetailRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const route = useRoute<ProductDetailRoute>();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectVisibleProducts);

  const product =
    products.find(item => item.id === route.params.productId) ?? null;

  useEffect(() => {
    dispatch(selectProductId(route.params.productId));

    return () => {
      dispatch(selectProductId(null));
    };
  }, [dispatch, route.params.productId]);

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Product not available in local state.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} />
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>${product.price.toFixed(2)}</Text>
        <Text style={styles.meta}>Rating {product.rating.toFixed(1)}</Text>
        <Text style={styles.meta}>Stock {product.stock}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EE',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  image: {
    height: 240,
    borderRadius: 14,
    backgroundColor: '#EFE7DD',
  },
  category: {
    marginTop: 14,
    textTransform: 'uppercase',
    fontSize: 11,
    color: '#0D6A57',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    color: '#1A1A1A',
    fontWeight: '900',
  },
  description: {
    marginTop: 10,
    color: '#51473D',
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: '#1A1A1A',
    fontSize: 13,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
