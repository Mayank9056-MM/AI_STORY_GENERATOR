import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AlertCircle,
  ChevronDown,
  Clipboard,
  Compass,
  Cpu,
  Crown,
  Heart,
  Moon,
  Rocket,
  Scroll,
  Search,
  Smile,
  Sparkles,
  Wand2,
  X,
} from "lucide-react-native";
import { safeGetStringAsync } from "../../lib/safeClipboard";

import { EXAMPLE_PROMPTS, GENRES, LENGTHS, TONES } from "../../constants/models";
import { StoryGenre, StoryLength, StoryTone } from "../../types/story";
import { generateStory } from "../../services/openrouter";
import { getSettings, saveStory } from "../../services/storage";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { GenerationProgress } from "../../components/story/GenerationProgress";
import { ModelSelectorModal } from "../../components/story/ModelSelectorModal";
import { triggerHaptic } from "../../lib/haptics";

// Map genre icon names to Lucide icons
const GENRE_ICONS: Record<string, any> = {
  Sparkles,
  Rocket,
  Search,
  Compass,
  Cpu,
  Moon,
  Crown,
  Heart,
  Scroll,
  Smile,
};

export default function CreateStoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState<StoryGenre>("Fantasy");
  const [tone, setTone] = useState<StoryTone>("Epic & Heroic");
  const [length, setLength] = useState<StoryLength>("Short");
  const [selectedModel, setSelectedModel] = useState<string>("meta-llama/llama-3.3-70b-instruct:free");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);

  // Load user default settings on mount
  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      if (settings.preferredGenre) setGenre(settings.preferredGenre);
      if (settings.preferredTone) setTone(settings.preferredTone);
      if (settings.preferredLength) setLength(settings.preferredLength);
      if (settings.selectedModel) setSelectedModel(settings.selectedModel);
    })();
  }, []);

  const handlePaste = async () => {
    triggerHaptic("light");
    try {
      const text = await safeGetStringAsync();
      if (text) {
        setPrompt(text);
      }
    } catch {
      // Ignore
    }
  };

  const handleApplyExample = (item: (typeof EXAMPLE_PROMPTS)[0]) => {
    triggerHaptic("medium");
    setPrompt(item.prompt);
    setGenre(item.genre);
    setTone(item.tone);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      triggerHaptic("warning");
      Alert.alert("Story Idea Required", "Please describe a story idea, characters, or setting to ignite the story.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setErrorMessage(null);
    triggerHaptic("medium");

    try {
      const generated = await generateStory({
        prompt: prompt.trim(),
        genre,
        tone,
        length,
        model: selectedModel,
      });

      // Save to device storage
      const saved = await saveStory(generated, prompt.trim(), selectedModel);
      triggerHaptic("success");

      // Navigate to reader screen
      router.push(`/story/${saved.id}`);
    } catch (err: any) {
      triggerHaptic("error");
      const message = err?.message || "Failed to generate story. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const getCleanModelName = (id: string) => {
    const parts = id.split("/");
    const name = parts[parts.length - 1].replace(":free", " (Free)");
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
        {/* Top Header */}
        <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-zinc-800/80">
          <View className="flex-row items-center space-x-2">
            <View className="w-9 h-9 rounded-2xl bg-amber-400/15 items-center justify-center border border-amber-400/30 mr-2.5">
              <Sparkles size={20} color="#fbbf24" />
            </View>
            <View>
              <Text className="text-zinc-100 font-extrabold text-lg tracking-tight">Story Muse</Text>
              <Text className="text-zinc-500 text-[10px] font-medium tracking-wide">
                AI Narrative Studio
              </Text>
            </View>
          </View>

          {/* Model selector pill */}
          <TouchableOpacity
            onPress={() => {
              triggerHaptic("light");
              setShowModelModal(true);
            }}
            activeOpacity={0.75}
            className="flex-row items-center bg-zinc-900 border border-zinc-700/80 rounded-full px-3 py-1.5"
          >
            <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
            <Text numberOfLines={1} className="text-zinc-300 font-medium text-xs max-w-[120px]">
              {getCleanModelName(selectedModel)}
            </Text>
            <ChevronDown size={14} color="#a1a1aa" className="ml-1" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            className="flex-1 px-5 pt-4"
          >
            {/* Error Banner if any */}
            {errorMessage && (
              <View className="mb-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex-row items-start">
                <AlertCircle size={20} color="#f43f5e" className="mr-3 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-rose-200 font-semibold text-xs mb-1">Generation Issue</Text>
                  <Text className="text-rose-300/90 text-xs leading-4">{errorMessage}</Text>
                  {errorMessage.includes("Settings") && (
                    <TouchableOpacity
                      onPress={() => router.push("/(tabs)/settings")}
                      className="mt-2.5 self-start bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-700"
                    >
                      <Text className="text-rose-200 text-xs font-semibold">Open Settings</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => setErrorMessage(null)} className="p-1">
                  <X size={16} color="#fda4af" />
                </TouchableOpacity>
              </View>
            )}

            {/* Prompt Input Container */}
            <View className="mb-5 bg-zinc-900/90 rounded-3xl border border-zinc-800/90 p-4 shadow-xl shadow-black/40">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  Story Premise
                </Text>
                <View className="flex-row items-center space-x-2">
                  {prompt.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic("light");
                        setPrompt("");
                      }}
                      className="mr-3"
                    >
                      <Text className="text-zinc-500 text-xs hover:text-zinc-300">Clear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handlePaste}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-zinc-800 px-2 py-1 rounded-md"
                  >
                    <Clipboard size={11} color="#a1a1aa" />
                    <Text className="text-zinc-400 text-[11px] font-medium ml-1">Paste</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                placeholder="What tale will we tell? e.g. An astronomer on Mars discovers a mysterious signal emanating from an underground ocean..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={4}
                value={prompt}
                onChangeText={setPrompt}
                editable={!loading}
                className="text-zinc-100 text-base leading-6 min-h-[110px] text-top"
                textAlignVertical="top"
              />

              <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-zinc-800/60">
                <Text className="text-zinc-600 text-[11px]">Tap an example below or write your own</Text>
                <Text className="text-zinc-500 text-[11px] font-mono">{prompt.length} chars</Text>
              </View>
            </View>

            {/* Genre Selection */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-zinc-300 font-bold text-sm">Choose Genre</Text>
                <Text className="text-amber-400 text-xs font-semibold">{genre}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {GENRES.map((g) => {
                  const IconComp = GENRE_ICONS[g.iconName] || Sparkles;
                  const isSelected = genre === g.label;
                  return (
                    <Chip
                      key={g.label}
                      label={g.label}
                      selected={isSelected}
                      icon={<IconComp size={15} color={isSelected ? "#fbbf24" : g.color} />}
                      onPress={() => setGenre(g.label)}
                    />
                  );
                })}
              </ScrollView>
            </View>

            {/* Tone Selection */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-zinc-300 font-bold text-sm">Narrative Tone</Text>
                <Text className="text-amber-400 text-xs font-semibold">{tone}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {TONES.map((t) => (
                  <Chip
                    key={t.label}
                    label={t.label}
                    selected={tone === t.label}
                    onPress={() => setTone(t.label)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Length Selection */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="text-zinc-300 font-bold text-sm">Story Scope</Text>
                <Text className="text-zinc-500 text-xs">
                  {LENGTHS.find((l) => l.label === length)?.desc}
                </Text>
              </View>
              <View className="flex-row space-x-2 gap-2">
                {LENGTHS.map((len) => (
                  <View key={len.label} className="flex-1">
                    <Chip
                      label={len.label}
                      subtitle={len.readingTime}
                      selected={length === len.label}
                      onPress={() => setLength(len.label)}
                      className="w-full justify-center items-center py-3"
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Loading Progress or Generate Button */}
            {loading ? (
              <GenerationProgress genre={genre} tone={tone} />
            ) : (
              <Button
                onPress={handleGenerate}
                title="Generate Illustrated Story"
                variant="primary"
                size="lg"
                leftIcon={<Wand2 size={20} color="#09090b" />}
                rightIcon={<Sparkles size={18} color="#09090b" />}
                disabled={!prompt.trim()}
                className="mb-8 shadow-amber-500/20 shadow-lg"
              />
            )}

            {/* Example Sparks / Inspiration */}
            <View className="mt-2 mb-6">
              <View className="flex-row items-center mb-3">
                <Sparkles size={16} color="#fbbf24" className="mr-2" />
                <Text className="text-zinc-300 font-bold text-sm">Story Sparks (Inspirations)</Text>
              </View>

              <View className="gap-3">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleApplyExample(ex)}
                    activeOpacity={0.7}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 active:bg-zinc-800/60"
                  >
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-amber-300 font-bold text-sm">{ex.title}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-zinc-500 text-[11px] mr-2">{ex.genre}</Text>
                        <Text className="text-zinc-600 text-[10px]">• {ex.tone}</Text>
                      </View>
                    </View>
                    <Text numberOfLines={2} className="text-zinc-400 text-xs leading-5">
                      {ex.prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Model Selector Modal */}
        <ModelSelectorModal
          visible={showModelModal}
          selectedModelId={selectedModel}
          onSelect={(m) => setSelectedModel(m.id)}
          onClose={() => setShowModelModal(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
