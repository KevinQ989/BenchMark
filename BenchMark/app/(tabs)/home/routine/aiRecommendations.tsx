import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Exercise, ExerciseInfo } from "@/constants/Types";
import Constants from "expo-constants";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";

type WorkoutType = "push" | "pull" | "legs" | "full-body";

const AIRecommendationsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const db = getFirestore();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Exercise[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedWorkoutType, setSelectedWorkoutType] =
    useState<WorkoutType | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState<string>("45");
  const [availableExercises, setAvailableExercises] = useState<ExerciseInfo[]>(
    []
  );
  const [fetchingExercises, setFetchingExercises] = useState(true);

  const workoutTypes: {
    type: WorkoutType;
    label: string;
    description: string;
  }[] = [
    {
      type: "push",
      label: "Push Workout",
      description: "Chest, shoulders, and triceps focus",
    },
    {
      type: "pull",
      label: "Pull Workout",
      description: "Back, biceps, and rear delts focus",
    },
    {
      type: "legs",
      label: "Legs Workout",
      description: "Quads, hamstrings, and calves focus",
    },
    {
      type: "full-body",
      label: "Full-Body Workout",
      description: "Complete body workout",
    },
  ];

  // Fetch exercises from Firestore catalog
  const fetchExercises = async () => {
    try {
      setFetchingExercises(true);
      const querySnapshot = await getDocs(collection(db, "exercises"));
      const exercises = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          exerciseName: data.exerciseName,
          target: data.target,
          subTarget: data.subTarget,
          equipment: data.equipment,
        } as ExerciseInfo;
      });
      setAvailableExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      const err = error as FirebaseError;
      alert("Failed to fetch exercises: " + err.message);
    } finally {
      setFetchingExercises(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

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

  const getWorkoutTypePrompt = (workoutType: WorkoutType): string => {
    switch (workoutType) {
      case "push":
        return "Create a PUSH workout routine focusing on chest, shoulders, and triceps. Include exercises that target these muscle groups effectively.";
      case "pull":
        return "Create a PULL workout routine focusing on back, biceps, and rear deltoids. Include exercises that target these muscle groups effectively.";
      case "legs":
        return "Create a LEGS workout routine focusing on quadriceps, hamstrings, glutes, and calves. Include exercises that target these muscle groups effectively.";
      case "full-body":
        return "Create a FULL-BODY workout routine that targets all major muscle groups. Include a balanced mix of exercises for upper body, lower body, and core.";
      default:
        return "Create a workout routine with a good mix of exercises.";
    }
  };

  const getRecommendations = async () => {
    if (!selectedWorkoutType) {
      alert("Please select a workout type first.");
      return;
    }

    if (availableExercises.length === 0) {
      alert(
        "No exercises available in the catalog. Please add some exercises first."
      );
      return;
    }

    setLoading(true);
    setAiResponse("");
    try {
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Google Gemini API key not found. Please check your environment configuration."
        );
      }

      const workoutTypePrompt = getWorkoutTypePrompt(selectedWorkoutType);
      const duration = parseInt(workoutDuration) || 45;

      // Create exercise list from catalog
      const exerciseList = availableExercises
        .map((ex) => ex.exerciseName)
        .join(", ");

      const prompt = `You have the following exercises available in the catalog: ${exerciseList}. ${workoutTypePrompt} The workout should be designed for approximately ${duration} minutes. Choose 4-6 exercises that fit the workout type and can be completed within the time frame. Only use exercises from the provided list. Format your response in the following way:

EXERCISES:
- [Exercise Name]
- [Exercise Name]
...

EXPLANATION:
[Your explanation of why these exercises were chosen for this specific workout type and how they work together within the time constraint]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "API request failed");
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiResponse(generatedText || "No response received from AI.");
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
        <ThemedText type="title" style={styles.title}>
          AI Recommendations
        </ThemedText>
        {!fetchingExercises && (
          <View style={styles.headerInfo}>
            <ThemedText type="default" style={styles.exerciseCount}>
              {availableExercises.length} exercises available in catalog
            </ThemedText>
            <TouchableOpacity
              onPress={fetchExercises}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>↻</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {fetchingExercises ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <ThemedText type="default" style={styles.loadingText}>
            Loading exercise catalog...
          </ThemedText>
        </View>
      ) : availableExercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText type="default" style={styles.emptyText}>
            No exercises available in the catalog.
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            Please add some exercises to the exercise catalog first.
          </ThemedText>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => router.push("/exercises/newExercise")}
          >
            <Text style={styles.buttonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      ) : !aiResponse && !loading ? (
        <ScrollView style={styles.setupContainer}>
          {/* Workout Type Selection */}
          <View style={styles.section}>
            <ThemedText type="default" style={styles.sectionTitle}>
              Choose Workout Type
            </ThemedText>
            <View style={styles.workoutTypeGrid}>
              {workoutTypes.map((workout) => (
                <TouchableOpacity
                  key={workout.type}
                  style={[
                    styles.workoutTypeCard,
                    selectedWorkoutType === workout.type && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedWorkoutType(workout.type)}
                >
                  <Text
                    style={[
                      styles.workoutTypeLabel,
                      selectedWorkoutType === workout.type &&
                        styles.selectedText,
                    ]}
                  >
                    {workout.label}
                  </Text>
                  <Text
                    style={[
                      styles.workoutTypeDescription,
                      selectedWorkoutType === workout.type &&
                        styles.selectedText,
                    ]}
                  >
                    {workout.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* duration button */}
          <View style={styles.section}>
            <ThemedText type="default" style={styles.sectionTitle}>
              Workout Duration (minutes)
            </ThemedText>
            <TextInput
              style={styles.durationInput}
              value={workoutDuration}
              onChangeText={setWorkoutDuration}
              placeholder="45"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* generate button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              !selectedWorkoutType && styles.disabledButton,
            ]}
            onPress={getRecommendations}
            disabled={!selectedWorkoutType}
          >
            <Text style={styles.buttonText}>Generate Recommendations</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <ThemedText type="default" style={styles.loadingText}>
            Analyzing your routine...
          </ThemedText>
        </View>
      ) : (
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

          {/* back to setup button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setAiResponse("");
              setSelectedWorkoutType(null);
            }}
          >
            <Text style={styles.backButtonText}>Choose Different Options</Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  setupContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  workoutTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  workoutTypeCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#6c5ce7",
    backgroundColor: "#f0f0ff",
  },
  workoutTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  workoutTypeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  selectedText: {
    color: "#6c5ce7",
  },
  durationInput: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  generateButton: {
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
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
    marginHorizontal: 8,
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
  addButton: {
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 8,
  },
  backButton: {
    backgroundColor: "transparent",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 80,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#6c5ce7",
  },
  backButtonText: {
    color: "#6c5ce7",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6c5ce7",
  },
  refreshText: {
    color: "#6c5ce7",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
  addExerciseButton: {
    backgroundColor: "#6c5ce7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default AIRecommendationsScreen;
