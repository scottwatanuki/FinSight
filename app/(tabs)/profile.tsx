import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
      const result = await extractCardNumberFromImage(photo.uri);
      setCardNumber(result.cardNumber);
      setExpiry(result.expiry);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    console.log({ video });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderPicture = () => (
    <View style={styles.resultContainer}>
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{ width: 300, aspectRatio: 1, marginBottom: 20 }}
      />
      <Text style={styles.resultText}>
        💳 Card Number: {cardNumber || "Not found"}
      </Text>
      <Text style={styles.resultText}>
        📅 Expiry: {expiry || "Not found"}
      </Text>
      <Button
        title="Take another picture"
        onPress={() => {
          setUri(null);
          setCardNumber(null);
          setExpiry(null);
        }}
      />
    </View>
  );

  const renderCamera = () => (
    <CameraView
      style={styles.camera}
      ref={ref}
      mode={mode}
      facing={facing}
      mute={false}
      responsiveOrientationWhenOrientationLocked
    >
      <View style={styles.shutterContainer}>
        <Pressable onPress={toggleMode}>
          {mode === "picture" ? (
            <AntDesign name="picture" size={32} color="white" />
          ) : (
            <Feather name="video" size={32} color="white" />
          )}
        </Pressable>
        <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
          {({ pressed }) => (
            <View
              style={[
                styles.shutterBtn,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.shutterBtnInner,
                  {
                    backgroundColor: mode === "picture" ? "white" : "red",
                  },
                ]}
              />
            </View>
          )}
        </Pressable>
        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
      </View>
    </CameraView>
  );

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

async function extractCardNumberFromImage(uri: string) {
    console.log('🖼️ Image URI:', uri);
    console.log('📦 Reading image as base64...');

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('📦 Base64 length:', base64.length);

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const apiKey = 'AIzaSyCLspCimLs5Xuwu3it0jDQX3wxNlWHL5eU'; // Replace with your actual key
    const body = JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    });

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }
    );
    
    const result = await response.json();
    const ocrText = result.responses?.[0]?.textAnnotations?.[0]?.description || '';
    console.log('📨 Raw Google Vision API result:', JSON.stringify(result, null, 2));
    // 👇 LOG the raw OCR text so we can debug
    console.log('📃 OCR Raw Text:\n', ocrText);

    // Try multiple RegEx formats
    const cardNumberMatch = ocrText.match(/\b(?:\d[ -]*?){13,16}\b/);
    const expiryMatch = ocrText.match(/\b(0[1-9]|1[0-2])\/?([0-9]{2})\b/);

    return {
      cardNumber: cardNumberMatch?.[0]?.replace(/[^\d]/g, '') || null,
      expiry: expiryMatch ? `${expiryMatch[1]}/${expiryMatch[2]}` : null,
    };
  } catch (err) {
    console.error('❌ OCR Error:', err);
    return { cardNumber: null, expiry: null };
  }
}
