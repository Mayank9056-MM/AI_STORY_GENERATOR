import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={48} color="#fbbf24" />
        </View>
        <Text style={styles.title}>{"This screen doesn't exist."}</Text>
        <Text style={styles.subtitle}>The story you were looking for could not be found.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to Create</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#09090b",
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fafafa",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fbbf24",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#09090b",
  },
});
