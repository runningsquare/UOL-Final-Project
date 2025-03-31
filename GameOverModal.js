{/** Game Over Modal */}
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";

const GameOverModal = ({ visible, score, onPlayAgain, onHome }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Game Over!</Text>
                    <Text style={styles.modalScore}>Final Score: {score}</Text>

                    <Pressable
                        style={styles.modalBtn}
                        onPress={onPlayAgain}
                    >
                        <Text style={styles.modalBtnText}>Play again</Text>
                    </Pressable>

                    <Pressable
                        style={styles.modalBtn}
                        onPress={onHome}
                    >
                        <Text style={styles.modalBtnText}>Home</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        backgroundColor: "#669999",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: "80%"
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffcc66",
        marginBottom: 10
    },
    modalScore: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 20
    },
    modalBtn: {
        backgroundColor: "#ffcc66",
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        width: "100%",
        alignItems: "center"
    },
    modalBtnText: {
        color: "#669999",
        fontWeight: "bold",
        fontSize: 16
    }
});

export default GameOverModal;