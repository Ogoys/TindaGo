import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import { s, vs } from "../../constants/responsive";

export function CustomStatusBar() {
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>9:41</Text>
      </View>
      
      <View style={styles.levelsContainer}>
        <View style={styles.cellularIcon}>
          <View style={[styles.bar, { height: 4 }]} />
          <View style={[styles.bar, { height: 6 }]} />
          <View style={[styles.bar, { height: 8 }]} />
          <View style={[styles.bar, { height: 10 }]} />
        </View>
        
        <View style={styles.wifiIcon}>
          <View style={styles.wifiArc} />
        </View>
        
        <View style={styles.batteryContainer}>
          <View style={styles.batteryBorder}>
            <View style={styles.batteryCapacity} />
          </View>
          <View style={styles.batteryCap} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: vs(54),
    paddingHorizontal: s(20),
  },
  timeContainer: {
    width: s(140.5),
    alignItems: "center",
  },
  timeText: {
    fontFamily: "ABeeZee",
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
    lineHeight: 22,
  },
  levelsContainer: {
    width: s(140.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: s(10),
  },
  cellularIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 3,
    backgroundColor: "#000000",
    borderRadius: 1,
  },
  wifiIcon: {
    width: 17,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  wifiArc: {
    width: 15,
    height: 10,
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryBorder: {
    width: 25,
    height: 13,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.35,
  },
  batteryCapacity: {
    width: 21,
    height: 9,
    backgroundColor: "#000000",
    borderRadius: 2.5,
  },
  batteryCap: {
    width: 1.5,
    height: 4,
    backgroundColor: "#000000",
    borderRadius: 1,
    opacity: 0.4,
    marginLeft: 1,
  },
});