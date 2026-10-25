import AsyncStorage from "@react-native-async-storage/async-storage";

const STORIES_KEY = "@ai_story_generator:stories";
const MAX_STORIES = 50;

interface StoryPart {
  paragraph: string;
  promptToImage: string;
}

interface StoryResponse {
    title: string;
    paragraphs: StoryPart[];
}

export interface SavedStory extends StoryResponse {
    id: string;
    createdAt: number;
    prompt: string;
}

export const saveStory = async(story : StoryResponse, prompt: string): Promise<SavedStory> => {
    try {
        const savedStories = {
            ...story,
            id: Date.now().toString(),
            createdAt: Date.now(),
            prompt,
        }

        const existingStories = await getStories();
        const updatedStories = [savedStories, ...existingStories].slice(0, MAX_STORIES);

        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
        return savedStories;
    } catch (error) {
        throw new Error("Failed to save story");
    }
}
export const getStories = async() => {
    try {
        const data = await AsyncStorage.getItem(STORIES_KEY);

        if(!data){
            return [];
        }

        return JSON.parse(data) as SavedStory[];
    } catch (error) {
        throw new Error("Failed to get stories");
        
    }
}

export const getStory = async(id: string) => {
    try {
        const stories = await getStories();
        return stories.find(story => story.id === id) || null;
    } catch (error) {
        throw new Error("Failed to get story");
    }
}

export const deleteStory = async(id: string) => {
    try {
        const stories = await getStories();
        const updatedStories = stories.filter(story => story.id !== id);
        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
    } catch (error) {
        throw new Error("Failed to delete story");
    }
}

export const clearStories = async() => {
    try {
        await AsyncStorage.removeItem(STORIES_KEY);
    } catch (error) {
        throw new Error("Failed to clear stories");
    }
}

