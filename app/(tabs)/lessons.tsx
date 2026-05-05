import { COURSE_DATA } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useSpeakingListeningStats } from "@/hooks/useSpeakingListeningStats";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LessonsContent () {
  const colors = Colors["light"]
  const { stats, loading, refresh } = useSpeakingListeningStats()

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh])
  )

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        <View style={[styles.header, {borderBottomColor: Colors.borderColor}]}>
          <TouchableOpacity>
            <Text style={styles.headerTitle}>This Week</Text>
            <Text style={[styles.headerSubtitle, {
              color: Colors.subduedTextColor
            }]}>In Reviews</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>
                  {loading? "-" : Math.floor(stats?.minutesListened?? 0)}
                </Text>
                <Ionicons 
                  name="arrow-up" 
                  size={14} 
                  color="#34c759"
                  style={{marginLeft: 2}}
                />
                <Text style={styles.statChangePositive}>
                  {loading? "-" : Math.floor(stats?.weeklyChange.listened?? 0)}
                </Text>
              </View>
              <Text style={[styles.statLabel, {color: Colors.subduedTextColor}]}>
                minutes spoken
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.headerSeparator, {
            backgroundColor: Colors.borderColor
          }]}
          >

          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>
                  {loading? "-" : Math.floor(stats?.minutesListened?? 0)}
                </Text>
                <Ionicons 
                  name="arrow-up" 
                  size={14} 
                  color="#34c759"
                  style={{marginLeft: 2}}
                />
                <Text style={styles.statChangePositive}>
                  {loading? "-" : Math.floor(stats?.weeklyChange.listened?? 0)}
                </Text>
              </View>
              <Text style={[styles.statLabel, {color: Colors.subduedTextColor}]}>
                minutes spoken
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Main Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {COURSE_DATA.chapters.map((chapter)=> (
            <View key={chapter.id} style={styles.chapterContainer}>
              <View style={styles.chapterHeader}>
                <Text>CHAPTER {chapter.id}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statChangePositive: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34C759", // Green for positive change
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  headerSeparator: {
    width: 1,
    height: 24,
    marginRight: -8, // Adjust spacing
  },
  scrollContainer: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  chapterContainer: {
    marginBottom: 24,
  },
  chapterHeader: {
    marginBottom: 24,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8e8e93",
    textTransform: "uppercase",
  },
  chapterTitleText: {
    marginTop: 4,
  },
  lessonsWrapper: {
    gap: 20,
  },
  lessonNodeContainer: {
    minHeight: 80,
    justifyContent: "center",
  },
  lessonBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    width: "80%",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginBottom: 6,
  },
  completionStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 3,
  },
  extraCountText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
  practiceChapterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  practiceChapterButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});