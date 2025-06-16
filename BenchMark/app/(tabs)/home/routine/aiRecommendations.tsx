import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Exercise, RoutineParams } from "@/components/Types";
import { GoogleGenAI } from "@google/genai";

const AIRecommendationsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<RoutineParams>();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Exercise[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");

  const formatResponse = (text: string) => {
    // Split the text into paragraphs
    const paragraphs = text.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a list item
      if (paragraph.trim().startsWith("- ")) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listItemText}>
              {formatText(paragraph.substring(2))}
            </Text>
          </View>
        );
      }

      // Regular paragraph with formatting
      return (
        <Text key={index} style={styles.paragraph}>
          {formatText(paragraph)}
        </Text>
      );
    });
  };

  const formatText = (text: string) => {
    // First handle bold text (double asterisks)
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        // For bold text, we need to check for italic inside
        const boldText = part.slice(2, -2);
        const italicParts = boldText.split(/(\*.*?\*)/g);
        return (
          <Text key={i} style={styles.boldText}>
            {italicParts.map((italicPart, j) => {
              if (italicPart.startsWith("*") && italicPart.endsWith("*")) {
                return (
                  <Text key={j} style={[styles.boldText, styles.italicText]}>
                    {italicPart.slice(1, -1)}
                  </Text>
                );
              }
              return italicPart;
            })}
          </Text>
        );
      }

      // Then handle italic text (single asterisks)
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((italicPart, j) => {
        if (italicPart.startsWith("*") && italicPart.endsWith("*")) {
          return (
            <Text key={j} style={styles.italicText}>
              {italicPart.slice(1, -1)}
            </Text>
          );
        }
        return italicPart;
      });
    });
  };

  const getRecommendations = async () => {
    setLoading(true);
    setAiResponse("");
    try {
      const ai = new GoogleGenAI({
        apiKey: "ADD_API_KEY_HERE_KEVIN",
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents:
          "You have the following exercises: Decline Bench Press, Face Pull, Decline Dumbbell Press, Tricep Extension (Machine), Leg Press, Leg Curl (Lying), Incline Bench Press, Russian Twist, Incline Dumbbell Press, Leg Raise, Leg Curl (Seated), Dumbbell Press, Goblet Squat, Preacher Curl (Dumbbell), Tricep Extension (Rope), Front Squat, Leg Extension, Deadlift, Romanian Deadlift (Barbell), Preacher Curl (Machine), Sumo Deadlift, Hammer Curl, Push-Up, Crunch, Tricep Extension (Straight Bar), Bench Press, Tricep Extension (Dumbbell), Lat Pulldown, Romanian Deadlift (Dumbbell), Pull-Up. Create a workout routine with 4-6 exercises from this list. Format your response in the following way:\n\n" +
          "EXERCISES:\n" +
          "- [Exercise Name]\n" +
          "- [Exercise Name]\n" +
          "...\n\n" +
          "EXPLANATION:\n" +
          "[Your explanation of why these exercises were chosen and how they work together]",
      });

      setAiResponse(response.text || "No response received from AI.");
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      setAiResponse(
        "Sorry, there was an error generating recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const addToRoutine = (exercises: Exercise[]) => {
    const currentExercises = JSON.parse(
      params.exercises as string
    ) as Exercise[];
    const updatedExercises = [...currentExercises, ...exercises];

    router.push({
      pathname: "/home/routine",
      params: {
        id: params.id,
        routineName: params.routineName,
        description: params.description,
        started: params.started,
        exercises: JSON.stringify(updatedExercises),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">AI Exercise Recommendations</ThemedText>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={getRecommendations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Generating..." : "Generate Recommendations"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <ThemedText type="default" style={styles.loadingText}>
            Analyzing your routine...
          </ThemedText>
        </View>
      ) : aiResponse ? (
        <ScrollView style={styles.responseContainer}>
          <View style={styles.responseBox}>{formatResponse(aiResponse)}</View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              const exercises = aiResponse
                .split("EXERCISES:")[1]
                ?.split("EXPLANATION:")[0]
                ?.split("\n")
                .filter((line) => line.trim().startsWith("- "))
                .map((line) => ({
                  exerciseName: line.replace("- ", "").trim(),
                  sets: [
                    {
                      reps: 12,
                      weight: 0,
                    },
                  ],
                }));

              if (exercises && exercises.length > 0) {
                addToRoutine(exercises);
              }
            }}
          >
            <Text style={styles.buttonText}>Add Recommended Exercises</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText type="default">
            Click &quot;Generate Recommendations&quot; to get AI-suggested
            exercises based on your current routine.
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  responseContainer: {
    flex: 1,
  },
  responseBox: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  italicText: {
    fontStyle: "italic",
    fontSize: 16,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 16,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: "#6c5ce7",
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  addButton: {
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
});

export default AIRecommendationsScreen;
