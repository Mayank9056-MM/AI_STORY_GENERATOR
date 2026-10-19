import { BookOpen, Sparkles, Wand2 } from "lucide-react-native";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "./global.css";
import { useState } from "react";
import { Colors } from "../../constants/theme";

export default function Index() {

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {}

  const handleExamplePrompt = (example: string) => {
    setPrompt(example);
  }
 
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View>
            <View>
              <BookOpen color={""} size={32} />
            </View>
            <Text>Welcome to AI Story Generator</Text>
            <Text>Powered by OpenRouter</Text>
          </View>

          <View>
             <TextInput
             placeholder="Describe your story idea... (e.g., A young wizard discovers a hidden world of magic)"
             placeholderTextColor={"#71717a"}
             multiline
             numberOfLines={4}
             value={prompt}
             onChangeText={setPrompt}
             editable={!loading}
             />
          </View>
          <TouchableOpacity onPress={handleGenerate} disabled={loading} activeOpacity={0.8}
            >
              {
                loading ? (
                  <>
                   <ActivityIndicator color={Colors.zinc[950]} />
                   <Text>Generating...</Text>
                  </>
                ) : (
                 <>
                   <Wand2 color={Colors.zinc[950]} size={32} />
                  <Text>Generate Story</Text>
                  <Sparkles color={Colors.zinc[950]} size={32} />
                 </>
                )
              }

          </TouchableOpacity>

          {
            EXAMPLE_PROMPTS.length > 0 && (
              <View>
                 <Text>Example Prompts
                 </Text>
                 <View>
                  {
                    EXAMPLE_PROMPTS.map((example, index) => (
                      <TouchableOpacity key={index} onPress={() => handlePrompt(example)} disabled={loading}>
                        <Text numberOfLines={2}>
                          {example}
                        </Text>
                      </TouchableOpacity>
                    )
                  }
                 </View>
              </View>
            )
          }

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
