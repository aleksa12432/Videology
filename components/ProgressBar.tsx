import { Animated, StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
    progress: number;
}

export default function ProgressBar(props: ProgressBarProps) {

    return <View style={styles.container}>
        <Text>
            Konverzija u toku..... {props.progress}%
        </Text>
        <View style={styles.progressBar}>
            <Animated.View style={{
                backgroundColor: "black", 
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: `${props.progress}%`
            }} />
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column", //column direction
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        backgroundColor: 'transparent',
        padding: 8,
    },
    progressBar: {
        height: 20,
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#000',
        borderWidth: 2,
        borderRadius: 5
    }
});
