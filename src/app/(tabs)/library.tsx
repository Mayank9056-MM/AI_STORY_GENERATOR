import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, Search, Sparkles, Star, X } from "lucide-react-native";

import { SavedStory } from "../../types/story";
import { deleteStory, getStories, toggleFavoriteStory } from "../../services/storage";
import { StoryCard } from "../../components/story/StoryCard";
import { triggerHaptic } from "../../lib/haptics";

const FILTER_PILLS = ["All", "Starred", "Fantasy", "Sci-Fi", "Mystery", "Adventure", "Cyberpunk"];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload stories whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  const handleDelete = async (id: string) => {
    await deleteStory(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleFavorite = async (id: string) => {
    const newState = await toggleFavoriteStory(id);
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: newState } : s))
    );
  };

  // Filtered stories logic
  const filteredStories = stories.filter((story) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      story.title.toLowerCase().includes(query) ||
      story.summary.toLowerCase().includes(query) ||
      story.genre.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeFilter === "All") return true;
    if (activeFilter === "Starred") return !!story.isFavorite;
    return story.genre.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-zinc-800/80">
        <View className="flex-row items-center space-x-2">
          <View className="w-9 h-9 rounded-2xl bg-amber-400/15 items-center justify-center border border-amber-400/30 mr-2.5">
            <BookOpen size={20} color="#fbbf24" />
          </View>
          <View>
            <Text className="text-zinc-100 font-extrabold text-lg tracking-tight">Story Library</Text>
            <Text className="text-zinc-500 text-[10px] font-medium tracking-wide">
              {stories.length} {stories.length === 1 ? "story" : "stories"} saved
            </Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-5 pt-3 pb-2">
        <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-2.5">
          <Search size={18} color="#71717a" className="mr-2" />
          <TextInput
            placeholder="Search stories by title, genre, keyword..."
            placeholderTextColor="#52525b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-zinc-100 text-sm"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic("light");
                setSearchQuery("");
              }}
              className="p-1"
            >
              <X size={16} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View className="py-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_PILLS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic("light");
                  setActiveFilter(item);
                }}
                activeOpacity={0.7}
                className={`px-3.5 py-1.5 rounded-full border flex-row items-center ${
                  isSelected
                    ? "bg-amber-400/20 border-amber-400/60"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                {item === "Starred" && (
                  <Star
                    size={12}
                    color={isSelected ? "#fbbf24" : "#71717a"}
                    fill={isSelected ? "#fbbf24" : "transparent"}
                    className="mr-1.5"
                  />
                )}
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-amber-300" : "text-zinc-400"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Stories List */}
      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fbbf24"
            colors={["#fbbf24"]}
          />
        }
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            onPress={() => router.push(`/story/${item.id}`)}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#fbbf24" />
              <Text className="text-zinc-500 text-xs mt-3">Loading your library...</Text>
            </View>
          ) : (
            <View className="items-center justify-center py-16 px-6">
            <View className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 items-center justify-center mb-4">
              <BookOpen size={30} color="#71717a" />
            </View>
            <Text className="text-zinc-200 font-bold text-lg text-center mb-1">
              {searchQuery || activeFilter !== "All"
                ? "No stories match your filter"
                : "No stories yet"}
            </Text>
            <Text className="text-zinc-500 text-xs text-center leading-5 max-w-[260px] mb-6">
              {searchQuery || activeFilter !== "All"
                ? "Try searching for different keywords or select 'All'."
                : "Ignite your imagination and craft your first illustrated story with OpenRouter AI."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.8}
              className="flex-row items-center bg-amber-400 px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20"
            >
              <Sparkles size={16} color="#09090b" className="mr-2" />
              <Text className="text-zinc-950 font-bold text-sm">Create New Story</Text>
            </TouchableOpacity>
          </View>
        )
      }
      />
    </View>
  );
}
