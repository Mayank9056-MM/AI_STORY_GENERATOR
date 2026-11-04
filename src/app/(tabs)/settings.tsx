import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Settings2,
  Trash2,
  Type,
} from "lucide-react-native";

import { AppSettings, OpenRouterModelInfo } from "../../types/story";
import { AVAILABLE_MODELS } from "../../constants/models";
import { clearStories, DEFAULT_SETTINGS, getSettings, saveSettings } from "../../services/storage";
import { Badge } from "../../components/ui/Badge";
import { ModelSelectorModal } from "../../components/story/ModelSelectorModal";
import { triggerHaptic } from "../../lib/haptics";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getSettings();
      setSettings(data);
      setApiKeyInput(data.openRouterApiKey || "");
    })();
  }, []);

  const handleSaveApiKey = async () => {
    triggerHaptic("medium");
    const updated = await saveSettings({ openRouterApiKey: apiKeyInput.trim() });
    setSettings(updated);
    Alert.alert("API Key Saved", "Your OpenRouter API key has been securely saved to device storage.");
  };

  const handleTestApiKey = async () => {
    triggerHaptic("light");
    setTestingKey(true);
    setTestResult(null);

    const keyToTest = apiKeyInput.trim() || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "";
    if (!keyToTest) {
      setTestingKey(false);
      setTestResult({
        success: false,
        msg: "No API key found. Enter a key or use free models.",
      });
      return;
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: {
          Authorization: `Bearer ${keyToTest}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          msg: `Valid key! Usage limit: ${data.data?.limit != null ? `$${data.data.limit}` : "No limit"}`,
        });
      } else {
        setTestResult({
          success: false,
          msg: `Key invalid or expired (HTTP ${res.status}).`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.message || "Failed to reach OpenRouter servers.",
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleFontSizeChange = async (size: "small" | "medium" | "large" | "extra-large") => {
    triggerHaptic("light");
    const updated = await saveSettings({ readerFontSize: size });
    setSettings(updated);
  };

  const handleModelSelect = async (model: OpenRouterModelInfo) => {
    const updated = await saveSettings({ selectedModel: model.id });
    setSettings(updated);
  };

  const handleClearAll = () => {
    triggerHaptic("warning");
    Alert.alert(
      "Clear All Stories",
      "Are you sure you want to delete all saved stories? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            triggerHaptic("heavy");
            await clearStories();
            Alert.alert("Success", "All stories have been cleared.");
          },
        },
      ]
    );
  };

  const currentModelInfo =
    AVAILABLE_MODELS.find((m) => m.id === settings.selectedModel) || AVAILABLE_MODELS[0];

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-zinc-800/80">
        <View className="flex-row items-center space-x-2">
          <View className="w-9 h-9 rounded-2xl bg-amber-400/15 items-center justify-center border border-amber-400/30 mr-2.5">
            <Settings2 size={20} color="#fbbf24" />
          </View>
          <View>
            <Text className="text-zinc-100 font-extrabold text-lg tracking-tight">Settings</Text>
            <Text className="text-zinc-500 text-[10px] font-medium tracking-wide">
              Configuration & Engine
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Section: OpenRouter API */}
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
            OpenRouter Intelligence
          </Text>
          <View className="bg-zinc-900/90 rounded-3xl border border-zinc-800/90 p-4 mb-6 shadow-lg shadow-black/40">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Key size={16} color="#fbbf24" className="mr-2" />
                <Text className="text-zinc-200 font-semibold text-sm">OpenRouter API Key</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://openrouter.ai/keys")}
                className="flex-row items-center"
              >
                <Text className="text-amber-400 text-xs font-medium mr-1">Get Key</Text>
                <ExternalLink size={12} color="#fbbf24" />
              </TouchableOpacity>
            </View>

            <Text className="text-zinc-400 text-xs leading-4 mb-3">
              Optional for free models. Required for paid models (e.g. Claude 3.5, GPT-4o).
            </Text>

            <View className="flex-row items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 mb-3">
              <TextInput
                placeholder="sk-or-v1-..."
                placeholderTextColor="#52525b"
                secureTextEntry={!showApiKey}
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-zinc-100 text-xs font-mono"
              />
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} className="p-1">
                {showApiKey ? (
                  <EyeOff size={16} color="#71717a" />
                ) : (
                  <Eye size={16} color="#71717a" />
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center space-x-2 gap-2">
              <TouchableOpacity
                onPress={handleSaveApiKey}
                className="flex-1 bg-amber-400 py-2.5 rounded-xl items-center"
              >
                <Text className="text-zinc-950 font-bold text-xs">Save Key</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTestApiKey}
                disabled={testingKey}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 items-center justify-center flex-row"
              >
                {testingKey ? (
                  <ActivityIndicator size="small" color="#fbbf24" />
                ) : (
                  <Text className="text-zinc-300 font-medium text-xs">Verify</Text>
                )}
              </TouchableOpacity>
            </View>

            {testResult && (
              <View
                className={`mt-3 p-3 rounded-xl border ${
                  testResult.success
                    ? "bg-emerald-950/30 border-emerald-800/50"
                    : "bg-rose-950/30 border-rose-800/50"
                }`}
              >
                <Text
                  className={`text-xs ${testResult.success ? "text-emerald-300" : "text-rose-300"}`}
                >
                  {testResult.msg}
                </Text>
              </View>
            )}
          </View>

          {/* Section: Active Model */}
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
            Active LLM Model
          </Text>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic("light");
              setShowModelModal(true);
            }}
            activeOpacity={0.75}
            className="bg-zinc-900/90 rounded-3xl border border-zinc-800/90 p-4 mb-6 shadow-lg shadow-black/40 flex-row items-center justify-between"
          >
            <View className="flex-1 mr-3">
              <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
                <Text className="text-zinc-100 font-bold text-sm">{currentModelInfo.name}</Text>
                {currentModelInfo.badge && (
                  <Badge label={currentModelInfo.badge} variant="primary" size="sm" />
                )}
                {currentModelInfo.isFree && <Badge label="FREE" variant="success" size="sm" />}
              </View>
              <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                {currentModelInfo.description}
              </Text>
            </View>
            <ChevronRight size={18} color="#71717a" />
          </TouchableOpacity>

          {/* Section: Reader Preferences */}
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
            Reader Experience
          </Text>
          <View className="bg-zinc-900/90 rounded-3xl border border-zinc-800/90 p-4 mb-6 shadow-lg shadow-black/40">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Type size={16} color="#fbbf24" className="mr-2" />
                <Text className="text-zinc-200 font-semibold text-sm">Story Text Size</Text>
              </View>
              <Text className="text-zinc-400 text-xs capitalize">{settings.readerFontSize}</Text>
            </View>

            <View className="flex-row gap-2">
              {(["small", "medium", "large", "extra-large"] as const).map((size) => {
                const isSelected = settings.readerFontSize === size;
                const labels: Record<string, string> = {
                  small: "A",
                  medium: "A+",
                  large: "A++",
                  "extra-large": "XL",
                };
                return (
                  <TouchableOpacity
                    key={size}
                    onPress={() => handleFontSizeChange(size)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      isSelected
                        ? "bg-amber-400/20 border-amber-400/60"
                        : "bg-zinc-950 border-zinc-800"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        isSelected ? "text-amber-300" : "text-zinc-400"
                      } ${size === "extra-large" ? "text-sm" : "text-base"}`}
                    >
                      {labels[size]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Engine Details */}
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
            Engine & Pipeline
          </Text>
          <View className="bg-zinc-900/90 rounded-3xl border border-zinc-800/90 p-4 mb-6 shadow-lg shadow-black/40">
            <View className="flex-row items-center justify-between py-2 border-b border-zinc-800/60">
              <Text className="text-zinc-400 text-xs">LLM Gateway</Text>
              <Text className="text-zinc-200 text-xs font-semibold">OpenRouter.ai</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-b border-zinc-800/60">
              <Text className="text-zinc-400 text-xs">Art Visuals</Text>
              <Text className="text-zinc-200 text-xs font-semibold">Pollinations.ai (Flux)</Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-zinc-400 text-xs">Styling Framework</Text>
              <Text className="text-zinc-200 text-xs font-semibold">NativeWind v5 (Tailwind v4)</Text>
            </View>
          </View>

          {/* Danger Zone */}
          <Text className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
            Storage Maintenance
          </Text>
          <TouchableOpacity
            onPress={handleClearAll}
            activeOpacity={0.7}
            className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex-row items-center justify-between mb-8"
          >
            <View className="flex-row items-center">
              <Trash2 size={18} color="#f43f5e" className="mr-3" />
              <View>
                <Text className="text-rose-300 font-semibold text-sm">Clear Saved Stories</Text>
                <Text className="text-rose-400/70 text-xs">Remove all stories from device memory</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#f43f5e" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModelSelectorModal
        visible={showModelModal}
        selectedModelId={settings.selectedModel}
        onSelect={handleModelSelect}
        onClose={() => setShowModelModal(false)}
      />
    </View>
  );
}
