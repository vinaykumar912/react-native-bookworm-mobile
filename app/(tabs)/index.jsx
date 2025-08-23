import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useFeedStore } from "../../store/useFeedStore";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";
import { formatPublishDate } from "../../lib/utils";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";

export default function Home() {
  const { token } = useAuthStore();
  // const { shuffledFeed, setShuffledFeed } = useFeedStore();

  //  API Call
  const fetchBooks = async ({ pageParam = 1 }) => {
    const response = await axios.get(`${API_URL}books`, {
      params: { page: pageParam, limit: 3 },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  // TanStack Infinite Query
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length < lastPage.totalPages) return allPages.length + 1;
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  //  Flatten paginated data
  const books = data?.pages.flatMap((page) => page.books) || [];

  // //  Update shuffled feed whenever data changes
  // useEffect(() => {
  //   if (data?.pages) {
  //     const allBooks = data.pages.flatMap((page) => page.books); // correct key
  //     setShuffledFeed(allBooks); // shuffle happens inside zustand
  //   }
  // }, [data]);

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image
          source={item.image}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  if (isLoading && !isRefetching) return <Loader />;

  if (isError)
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={COLORS.primary}
        />
        <Text style={styles.emptyText}>Something went wrong</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={books} // display shuffled feed
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch} // refetch
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community👇
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
      />
    </View>
  );
}
